/**
 * Multi-Currency System
 *
 * This module handles:
 * 1. User location detection via IP geolocation
 * 2. Real-time currency exchange rates (Yahoo Finance + fallback APIs)
 * 3. Dynamic currency conversion for payments
 * 4. Currency formatting and display
 *
 * Data Sources (in priority order):
 * 1. Yahoo Finance (real-time, yfinance-inspired)
 * 2. ExchangeRate-API (daily updates)
 * 3. Static fallback rates (updated Jan 2025)
 */

import {
  getYahooForexRate,
  convertWithYahooFinance,
} from "./yahoo-finance-forex";

// Supported currencies and their payment gateway mappings
// Based on Razorpay documentation: https://razorpay.com/docs/payments/international-payments/
export const SUPPORTED_CURRENCIES = {
  USD: {
    symbol: "$",
    name: "US Dollar",
    gateway: "razorpay", // Razorpay supports USD
    countries: ["US", "PR", "VI", "GU", "AS", "MP"],
  },
  EUR: {
    symbol: "€",
    name: "Euro",
    gateway: "razorpay", // Razorpay supports EUR
    countries: [
      "DE",
      "FR",
      "IT",
      "ES",
      "NL",
      "BE",
      "AT",
      "PT",
      "IE",
      "FI",
      "GR",
      "LU",
      "SI",
      "SK",
      "EE",
      "LV",
      "LT",
      "CY",
      "MT",
    ],
  },
  GBP: {
    symbol: "£",
    name: "British Pound",
    gateway: "razorpay", // Razorpay supports GBP
    countries: ["GB", "UK"],
  },
  INR: {
    symbol: "₹",
    name: "Indian Rupee",
    gateway: "razorpay", // Razorpay supports INR
    countries: ["IN"],
  },
  CAD: {
    symbol: "C$",
    name: "Canadian Dollar",
    gateway: "razorpay", // Razorpay supports CAD
    countries: ["CA"],
  },
  AUD: {
    symbol: "A$",
    name: "Australian Dollar",
    gateway: "razorpay", // Razorpay supports AUD
    countries: ["AU"],
  },
  SGD: {
    symbol: "S$",
    name: "Singapore Dollar",
    gateway: "razorpay", // Razorpay supports SGD
    countries: ["SG"],
  },
  HKD: {
    symbol: "HK$",
    name: "Hong Kong Dollar",
    gateway: "razorpay", // Razorpay supports HKD
    countries: ["HK"],
  },
  MYR: {
    symbol: "RM",
    name: "Malaysian Ringgit",
    gateway: "razorpay", // Razorpay supports MYR
    countries: ["MY"],
  },
} as const;

export type SupportedCurrency = keyof typeof SUPPORTED_CURRENCIES;

// Default currency (what's stored in database and displayed on website)
export const BASE_CURRENCY: SupportedCurrency = "USD";

// User location and currency detection
export interface UserLocation {
  country: string;
  currency: SupportedCurrency;
  gateway: string;
}

// Exchange rate data structure
export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

// Cache for exchange rates (1 hour for free tier, 10 minutes for paid)
const EXCHANGE_RATE_CACHE_DURATION = 60 * 60 * 1000; // 1 hour
let exchangeRateCache: ExchangeRates | null = null;

/**
 * Detect user's location and preferred currency based on IP
 */
export async function detectUserCurrency(): Promise<UserLocation> {
  try {
    // Try to get user's country from IP geolocation
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();

    if (data.country_code) {
      const countryCode = data.country_code.toUpperCase();

      // Find currency based on country
      for (const [currency, config] of Object.entries(SUPPORTED_CURRENCIES)) {
        if ((config as any).countries.includes(countryCode)) {
          return {
            country: countryCode,
            currency: currency as SupportedCurrency,
            gateway: (config as any).gateway,
          };
        }
      }
    }
  } catch (error) {
    console.warn("[Currency] Failed to detect user location:", error);
  }

  // Fallback to USD if detection fails
  return {
    country: "US",
    currency: "USD",
    gateway: "stripe",
  };
}

/**
 * Validate if exchange rates are fresh enough for payments
 */
function validateRateFreshness(rates: ExchangeRates): boolean {
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours max age for payment processing
  const age = Date.now() - rates.timestamp;

  if (age > maxAge) {
    console.warn(
      `[Currency] Exchange rates are ${Math.round(age / (60 * 60 * 1000))} hours old, may be stale`,
    );
    return false;
  }

  return true;
}

/**
 * Get live exchange rates from a free API
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  // Check cache first
  if (
    exchangeRateCache &&
    Date.now() - exchangeRateCache.timestamp < EXCHANGE_RATE_CACHE_DURATION
  ) {
    return exchangeRateCache;
  }

  try {
    // Using exchangerate-api.com (free tier: 1500 requests/month)
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${BASE_CURRENCY}`,
    );
    const data = await response.json();

    if (data.rates) {
      exchangeRateCache = {
        base: data.base,
        rates: data.rates,
        timestamp: Date.now(),
      };

      // Validate rate freshness
      if (!validateRateFreshness(exchangeRateCache)) {
        console.warn(
          "[Currency] API returned stale rates, consider upgrading to paid plan for real-time rates",
        );
      }

      return exchangeRateCache;
    }
  } catch (error) {
    console.warn("[Currency] Failed to fetch live exchange rates:", error);
  }

  // Fallback to current approximate rates if API fails (Updated: January 2025)
  const fallbackRates: ExchangeRates = {
    base: BASE_CURRENCY,
    rates: {
      USD: 1,
      EUR: 0.96, // Updated Jan 2025
      GBP: 0.81, // Updated Jan 2025
      INR: 86.5, // Updated Jan 2025
      CAD: 1.44, // Updated Jan 2025
      AUD: 1.62, // Updated Jan 2025
      SGD: 1.37, // Updated Jan 2025
      HKD: 7.78, // Updated Jan 2025
      MYR: 4.48, // Updated Jan 2025
    },
    timestamp: Date.now(),
  };

  exchangeRateCache = fallbackRates;
  return fallbackRates;
}

/**
 * Convert amount from base currency (USD) to target currency
 * Uses Yahoo Finance for real-time rates with fallback to daily API
 */
export async function convertCurrency(
  amount: number,
  targetCurrency: SupportedCurrency,
): Promise<number> {
  if (targetCurrency === BASE_CURRENCY) {
    return amount;
  }

  try {
    // Try Yahoo Finance first for real-time rates
    console.log(
      `[Currency] Attempting Yahoo Finance conversion: ${amount} ${BASE_CURRENCY} → ${targetCurrency}`,
    );
    const { convertedAmount } = await convertWithYahooFinance(
      amount,
      BASE_CURRENCY,
      targetCurrency,
    );
    console.log(
      `[Currency] Yahoo Finance conversion successful: ${convertedAmount} ${targetCurrency}`,
    );
    return convertedAmount;
  } catch (yahooError) {
    console.warn(
      `[Currency] Yahoo Finance failed, falling back to daily API:`,
      yahooError,
    );

    try {
      // Fallback to daily exchange rate API
      const rates = await getExchangeRates();
      const rate = rates.rates[targetCurrency];

      if (!rate) {
        console.warn(
          `[Currency] No exchange rate found for ${targetCurrency}, using base amount`,
        );
        return amount;
      }

      const convertedAmount = Math.round(amount * rate * 100) / 100;
      console.log(
        `[Currency] Daily API conversion: ${amount} ${BASE_CURRENCY} → ${convertedAmount} ${targetCurrency} (rate: ${rate})`,
      );
      return convertedAmount;
    } catch (apiError) {
      console.error(`[Currency] All conversion methods failed:`, apiError);
      return amount; // Final fallback
    }
  }
}

/**
 * Format currency amount with proper symbol and locale
 */
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = BASE_CURRENCY,
): string {
  const config = SUPPORTED_CURRENCIES[currency];

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return `${config.symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Convert amount to smallest currency unit for payment processing
 */
export function toPaymentUnit(
  amount: number,
  currency: SupportedCurrency,
): number {
  const multipliers: Record<SupportedCurrency, number> = {
    USD: 100, // cents
    EUR: 100, // cents
    GBP: 100, // pence
    INR: 100, // paise
    CAD: 100, // cents
    AUD: 100, // cents
    SGD: 100, // cents
    HKD: 100, // cents
    MYR: 100, // sen
  };

  return Math.round(amount * multipliers[currency]);
}

/**
 * Get enhanced exchange rate information with real-time data
 */
export async function getEnhancedExchangeRate(
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
): Promise<{
  rate: number;
  source: "yahoo-finance" | "daily-api" | "fallback";
  timestamp: number;
  change?: number;
  changePercent?: number;
  bid?: number;
  ask?: number;
}> {
  if (fromCurrency === toCurrency) {
    return {
      rate: 1,
      source: "fallback",
      timestamp: Date.now(),
    };
  }

  try {
    // Try Yahoo Finance first
    const yahooRate = await getYahooForexRate(fromCurrency, toCurrency);
    return {
      rate: yahooRate.rate,
      source: "yahoo-finance",
      timestamp: yahooRate.timestamp,
      change: yahooRate.change,
      changePercent: yahooRate.changePercent,
      bid: yahooRate.bid,
      ask: yahooRate.ask,
    };
  } catch (yahooError) {
    console.warn(
      `[Currency] Yahoo Finance failed for ${fromCurrency}/${toCurrency}, using daily API`,
    );

    try {
      // Fallback to daily API
      if (fromCurrency === BASE_CURRENCY) {
        const rates = await getExchangeRates();
        const rate = rates.rates[toCurrency];
        if (rate) {
          return {
            rate,
            source: "daily-api",
            timestamp: rates.timestamp,
          };
        }
      }

      // For non-USD base currencies, convert through USD
      const usdToTarget = await getExchangeRates();
      const baseToUsd = await getExchangeRates(); // This would need modification for reverse rates

      if (usdToTarget.rates[toCurrency]) {
        return {
          rate: usdToTarget.rates[toCurrency],
          source: "daily-api",
          timestamp: usdToTarget.timestamp,
        };
      }
    } catch (apiError) {
      console.warn(`[Currency] Daily API failed, using fallback rate`);
    }

    // Final fallback to static rates
    const fallbackRates = {
      USD: 1,
      EUR: 0.96,
      GBP: 0.81,
      INR: 86.5,
      CAD: 1.44,
      AUD: 1.62,
      SGD: 1.37,
      HKD: 7.78,
      MYR: 4.48,
    };

    const rate = fallbackRates[toCurrency] || 1;
    return {
      rate,
      source: "fallback",
      timestamp: Date.now(),
    };
  }
}

/**
 * Get payment gateway configuration for currency
 */
export function getPaymentGateway(currency: SupportedCurrency): string {
  return SUPPORTED_CURRENCIES[currency].gateway;
}

/**
 * Client-side hook for currency detection and conversion
 */
export function useCurrency() {
  // This will be implemented as a React hook in the components
  return {
    detectUserCurrency,
    convertCurrency,
    formatCurrency,
    getPaymentGateway,
    BASE_CURRENCY,
    SUPPORTED_CURRENCIES,
  };
}
