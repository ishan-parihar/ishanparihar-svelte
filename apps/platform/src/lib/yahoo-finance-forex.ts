/**
 * Yahoo Finance Forex Data API
 *
 * JavaScript implementation inspired by yfinance for real-time forex rates
 * Uses Yahoo Finance's public endpoints for currency exchange rates
 */

import { SupportedCurrency } from "./currency";

// Yahoo Finance forex symbol mappings
const FOREX_SYMBOLS: Record<string, string> = {
  "USD-EUR": "USDEUR=X",
  "USD-GBP": "USDGBP=X",
  "USD-INR": "USDINR=X",
  "USD-CAD": "USDCAD=X",
  "USD-AUD": "USDAUD=X",
  "USD-SGD": "USDSGD=X",
  "USD-HKD": "USDHKD=X",
  "USD-MYR": "USDMYR=X",
  // Reverse pairs for better liquidity
  "EUR-USD": "EURUSD=X",
  "GBP-USD": "GBPUSD=X",
  "CAD-USD": "CADUSD=X",
  "AUD-USD": "AUDUSD=X",
};

interface YahooFinanceQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketTime: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  bid: number;
  ask: number;
  currency: string;
}

interface YahooFinanceResponse {
  quoteResponse: {
    result: YahooFinanceQuote[];
    error: null | string;
  };
}

interface ForexRate {
  symbol: string;
  rate: number;
  timestamp: number;
  change: number;
  changePercent: number;
  bid: number;
  ask: number;
  source: "yahoo-finance";
}

// Cache for forex rates (5 minutes)
const FOREX_CACHE_DURATION = 5 * 60 * 1000;
const forexCache = new Map<string, { data: ForexRate; timestamp: number }>();

/**
 * Get forex symbol for currency pair
 */
function getForexSymbol(
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
): string {
  const pairKey = `${fromCurrency}-${toCurrency}`;
  const reversePairKey = `${toCurrency}-${fromCurrency}`;

  return (
    FOREX_SYMBOLS[pairKey] ||
    FOREX_SYMBOLS[reversePairKey] ||
    `${fromCurrency}${toCurrency}=X`
  );
}

/**
 * Check if we need to invert the rate (for reverse pairs)
 */
function shouldInvertRate(
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
): boolean {
  const pairKey = `${fromCurrency}-${toCurrency}`;
  const reversePairKey = `${toCurrency}-${fromCurrency}`;

  // If we have the reverse pair but not the direct pair, we need to invert
  return !FOREX_SYMBOLS[pairKey] && !!FOREX_SYMBOLS[reversePairKey];
}

/**
 * Fetch real-time forex rate from Yahoo Finance
 */
export async function getYahooForexRate(
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
): Promise<ForexRate> {
  if (fromCurrency === toCurrency) {
    return {
      symbol: `${fromCurrency}${toCurrency}`,
      rate: 1,
      timestamp: Date.now(),
      change: 0,
      changePercent: 0,
      bid: 1,
      ask: 1,
      source: "yahoo-finance",
    };
  }

  const cacheKey = `${fromCurrency}-${toCurrency}`;
  const cached = forexCache.get(cacheKey);

  // Return cached data if still fresh
  if (cached && Date.now() - cached.timestamp < FOREX_CACHE_DURATION) {
    return cached.data;
  }

  try {
    const symbol = getForexSymbol(fromCurrency, toCurrency);
    const shouldInvert = shouldInvertRate(fromCurrency, toCurrency);

    // Yahoo Finance quote endpoint
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ForexRateBot/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data: YahooFinanceResponse = await response.json();

    if (data.quoteResponse.error || !data.quoteResponse.result.length) {
      throw new Error("No forex data returned from Yahoo Finance");
    }

    const quote = data.quoteResponse.result[0];

    // Invert rate if needed (e.g., we got EURUSD but need USDEUR)
    const rate = shouldInvert
      ? 1 / quote.regularMarketPrice
      : quote.regularMarketPrice;
    const change = shouldInvert
      ? -quote.regularMarketChange / quote.regularMarketPrice ** 2
      : quote.regularMarketChange;
    const bid = shouldInvert ? 1 / quote.ask : quote.bid;
    const ask = shouldInvert ? 1 / quote.bid : quote.ask;

    const forexRate: ForexRate = {
      symbol: `${fromCurrency}${toCurrency}`,
      rate: rate,
      timestamp: quote.regularMarketTime * 1000, // Convert to milliseconds
      change: change,
      changePercent: shouldInvert
        ? -quote.regularMarketChangePercent
        : quote.regularMarketChangePercent,
      bid: bid,
      ask: ask,
      source: "yahoo-finance",
    };

    // Cache the result
    forexCache.set(cacheKey, { data: forexRate, timestamp: Date.now() });

    console.log(
      `[YahooFinance] Fetched ${fromCurrency}/${toCurrency}: ${rate.toFixed(4)} (${change > 0 ? "+" : ""}${change.toFixed(4)})`,
    );

    return forexRate;
  } catch (error) {
    console.error(
      `[YahooFinance] Failed to fetch ${fromCurrency}/${toCurrency}:`,
      error,
    );
    throw error;
  }
}

/**
 * Convert amount using Yahoo Finance real-time rates
 */
export async function convertWithYahooFinance(
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
): Promise<{ convertedAmount: number; rate: ForexRate }> {
  const rate = await getYahooForexRate(fromCurrency, toCurrency);
  const convertedAmount = Math.round(amount * rate.rate * 100) / 100;

  return { convertedAmount, rate };
}

/**
 * Get multiple forex rates at once
 */
export async function getMultipleYahooForexRates(
  baseCurrency: SupportedCurrency,
  targetCurrencies: SupportedCurrency[],
): Promise<Record<SupportedCurrency, ForexRate>> {
  const promises = targetCurrencies.map(async (currency) => {
    if (currency === baseCurrency) {
      return [
        currency,
        {
          symbol: `${baseCurrency}${currency}`,
          rate: 1,
          timestamp: Date.now(),
          change: 0,
          changePercent: 0,
          bid: 1,
          ask: 1,
          source: "yahoo-finance" as const,
        },
      ] as const;
    }

    try {
      const rate = await getYahooForexRate(baseCurrency, currency);
      return [currency, rate] as const;
    } catch (error) {
      console.warn(
        `Failed to get rate for ${baseCurrency}/${currency}, using fallback`,
      );
      return [
        currency,
        {
          symbol: `${baseCurrency}${currency}`,
          rate: 1,
          timestamp: Date.now(),
          change: 0,
          changePercent: 0,
          bid: 1,
          ask: 1,
          source: "yahoo-finance" as const,
        },
      ] as const;
    }
  });

  const results = await Promise.all(promises);
  return Object.fromEntries(results) as Record<SupportedCurrency, ForexRate>;
}

/**
 * Clear forex rate cache
 */
export function clearYahooForexCache(): void {
  forexCache.clear();
  console.log("[YahooFinance] Cache cleared");
}

/**
 * Get cache statistics
 */
export function getYahooForexCacheStats(): { size: number; keys: string[] } {
  return {
    size: forexCache.size,
    keys: Array.from(forexCache.keys()),
  };
}
