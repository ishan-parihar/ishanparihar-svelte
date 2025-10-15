"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  SupportedCurrency,
  UserLocation,
  BASE_CURRENCY,
  detectUserCurrency,
  convertCurrency,
  formatCurrency,
  getPaymentGateway,
  getEnhancedExchangeRate,
} from "@/lib/currency";

interface CurrencyContextType {
  // Current user's detected currency and location
  userLocation: UserLocation | null;

  // Display currency (always USD for website display)
  displayCurrency: SupportedCurrency;

  // Payment currency (user's local currency)
  paymentCurrency: SupportedCurrency;

  // Loading states
  isDetecting: boolean;

  // Utility functions
  convertToPaymentCurrency: (amount: number) => Promise<number>;
  formatDisplayPrice: (amount: number) => string;
  formatPaymentPrice: (amount: number, currency?: SupportedCurrency) => string;
  getPaymentGatewayForUser: () => string;

  // Enhanced rate information
  getExchangeRateInfo: (
    fromCurrency: SupportedCurrency,
    toCurrency: SupportedCurrency,
  ) => Promise<{
    rate: number;
    source: "yahoo-finance" | "daily-api" | "fallback";
    timestamp: number;
    change?: number;
    changePercent?: number;
  }>;

  // Manual currency override (for testing)
  setPaymentCurrency: (currency: SupportedCurrency) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isDetecting, setIsDetecting] = useState(true);
  const [paymentCurrency, setPaymentCurrencyState] =
    useState<SupportedCurrency>(BASE_CURRENCY);

  // Display currency is always USD
  const displayCurrency = BASE_CURRENCY;

  // Detect user's currency on mount
  useEffect(() => {
    async function detectCurrency() {
      try {
        setIsDetecting(true);
        const location = await detectUserCurrency();
        setUserLocation(location);
        setPaymentCurrencyState(location.currency);

        console.log("[CurrencyProvider] Detected user location:", location);
      } catch (error) {
        console.error("[CurrencyProvider] Failed to detect currency:", error);
        // Fallback to USD
        setUserLocation({
          country: "US",
          currency: "USD",
          gateway: "stripe",
        });
        setPaymentCurrencyState("USD");
      } finally {
        setIsDetecting(false);
      }
    }

    detectCurrency();
  }, []);

  // Convert USD amount to user's payment currency
  const convertToPaymentCurrency = async (
    usdAmount: number,
  ): Promise<number> => {
    if (paymentCurrency === "USD") {
      return usdAmount;
    }

    try {
      return await convertCurrency(usdAmount, paymentCurrency);
    } catch (error) {
      console.error("[CurrencyProvider] Conversion failed:", error);
      return usdAmount; // Fallback to USD amount
    }
  };

  // Format price for website display (always USD)
  const formatDisplayPrice = (amount: number): string => {
    return formatCurrency(amount, displayCurrency);
  };

  // Format price for payment (user's local currency)
  const formatPaymentPrice = (
    amount: number,
    currency?: SupportedCurrency,
  ): string => {
    return formatCurrency(amount, currency || paymentCurrency);
  };

  // Get payment gateway for user's currency
  const getPaymentGatewayForUser = (): string => {
    return getPaymentGateway(paymentCurrency);
  };

  // Get enhanced exchange rate information
  const getExchangeRateInfo = async (
    fromCurrency: SupportedCurrency,
    toCurrency: SupportedCurrency,
  ) => {
    try {
      const rateInfo = await getEnhancedExchangeRate(fromCurrency, toCurrency);
      return {
        rate: rateInfo.rate,
        source: rateInfo.source,
        timestamp: rateInfo.timestamp,
        change: rateInfo.change,
        changePercent: rateInfo.changePercent,
      };
    } catch (error) {
      console.error(
        "[CurrencyProvider] Failed to get exchange rate info:",
        error,
      );
      return {
        rate: 1,
        source: "fallback" as const,
        timestamp: Date.now(),
      };
    }
  };

  // Manual currency override
  const setPaymentCurrency = (currency: SupportedCurrency) => {
    setPaymentCurrencyState(currency);
    setUserLocation((prev) =>
      prev
        ? {
            ...prev,
            currency,
            gateway: getPaymentGateway(currency),
          }
        : null,
    );
  };

  const value: CurrencyContextType = {
    userLocation,
    displayCurrency,
    paymentCurrency,
    isDetecting,
    convertToPaymentCurrency,
    formatDisplayPrice,
    formatPaymentPrice,
    getPaymentGatewayForUser,
    getExchangeRateInfo,
    setPaymentCurrency,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

// Currency selector component for testing/debugging
export function CurrencySelector() {
  const { paymentCurrency, setPaymentCurrency, isDetecting } = useCurrency();

  if (process.env.NODE_ENV !== "development") {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Payment Currency (Dev Only)
      </label>
      <select
        value={paymentCurrency}
        onChange={(e) =>
          setPaymentCurrency(e.target.value as SupportedCurrency)
        }
        disabled={isDetecting}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <option value="USD">🇺🇸 USD - US Dollar</option>
        <option value="EUR">🇪🇺 EUR - Euro</option>
        <option value="GBP">🇬🇧 GBP - British Pound</option>
        <option value="INR">🇮🇳 INR - Indian Rupee</option>
        <option value="CAD">🇨🇦 CAD - Canadian Dollar</option>
        <option value="AUD">🇦🇺 AUD - Australian Dollar</option>
        <option value="SGD">🇸🇬 SGD - Singapore Dollar</option>
        <option value="HKD">🇭🇰 HKD - Hong Kong Dollar</option>
        <option value="MYR">🇲🇾 MYR - Malaysian Ringgit</option>
      </select>
      {isDetecting && (
        <p className="text-xs text-gray-500 mt-1">Detecting location...</p>
      )}
    </div>
  );
}
