import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useApp } from './AppContext';
import { CurrencyItem } from '../types';
import { INITIAL_CURRENCIES } from '../data/mockData';

interface WebsiteCurrencyContextType {
  selectedCurrencyCode: string;
  selectedCurrency: CurrencyItem;
  setSelectedCurrencyCode: (code: string) => void;
  availableCurrencies: CurrencyItem[];
  convertPrice: (amountQAR: number) => number;
  formatPrice: (amountQAR: number) => string;
  formatPriceParts: (amountQAR: number) => {
    symbol: string;
    code: string;
    amount: string;
    isQAR: boolean;
    qarEquivalent: string;
  };
}

const WebsiteCurrencyContext = createContext<WebsiteCurrencyContextType | undefined>(undefined);

export const WebsiteCurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currencies } = useApp();

  // If dashboard has currencies, use them; otherwise fallback to INITIAL_CURRENCIES
  const activeCurrenciesList = useMemo(() => {
    return currencies && currencies.length > 0 ? currencies : INITIAL_CURRENCIES;
  }, [currencies]);

  const [selectedCurrencyCode, setSelectedCurrencyCodeState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('artrust_website_currency');
      if (saved) return saved.toUpperCase();
    } catch {}
    return 'QAR';
  });

  const setSelectedCurrencyCode = (code: string) => {
    const clean = code.toUpperCase();
    setSelectedCurrencyCodeState(clean);
    try {
      localStorage.setItem('artrust_website_currency', clean);
    } catch {}
  };

  // Find active selected currency or fallback to QAR or first currency
  const selectedCurrency = useMemo(() => {
    const found = activeCurrenciesList.find((c) => c.code === selectedCurrencyCode);
    if (found) return found;
    const qar = activeCurrenciesList.find((c) => c.code === 'QAR');
    return qar || activeCurrenciesList[0] || INITIAL_CURRENCIES[0];
  }, [activeCurrenciesList, selectedCurrencyCode]);

  // Convert QAR amount to selected currency
  const convertPrice = (amountQAR: number): number => {
    if (!amountQAR || isNaN(amountQAR)) return 0;
    if (selectedCurrency.code === 'QAR') return amountQAR;
    const rate = selectedCurrency.rateToQAR || 1.0;
    return Math.round((amountQAR / rate) * 100) / 100;
  };

  // Format price string e.g. "QAR 350" or "$ 96.15 USD"
  const formatPrice = (amountQAR: number): string => {
    if (selectedCurrency.code === 'QAR') {
      return `QAR ${amountQAR.toLocaleString()}`;
    }
    const converted = convertPrice(amountQAR);
    const formatted = converted % 1 === 0 ? converted.toLocaleString() : converted.toFixed(2);
    return `${selectedCurrency.symbol} ${formatted} ${selectedCurrency.code}`;
  };

  // Structured breakdown for UI badges
  const formatPriceParts = (amountQAR: number) => {
    const isQAR = selectedCurrency.code === 'QAR';
    const converted = convertPrice(amountQAR);
    const formatted = isQAR
      ? amountQAR.toLocaleString()
      : converted % 1 === 0
      ? converted.toLocaleString()
      : converted.toFixed(2);

    return {
      symbol: selectedCurrency.symbol,
      code: selectedCurrency.code,
      amount: formatted,
      isQAR,
      qarEquivalent: `QAR ${amountQAR.toLocaleString()}`,
    };
  };

  return (
    <WebsiteCurrencyContext.Provider
      value={{
        selectedCurrencyCode,
        selectedCurrency,
        setSelectedCurrencyCode,
        availableCurrencies: activeCurrenciesList,
        convertPrice,
        formatPrice,
        formatPriceParts,
      }}
    >
      {children}
    </WebsiteCurrencyContext.Provider>
  );
};

export const useWebsiteCurrency = (): WebsiteCurrencyContextType => {
  const context = useContext(WebsiteCurrencyContext);
  if (!context) {
    // Graceful fallback
    const fallbackQAR = INITIAL_CURRENCIES[0];
    return {
      selectedCurrencyCode: 'QAR',
      selectedCurrency: fallbackQAR,
      setSelectedCurrencyCode: () => {},
      availableCurrencies: INITIAL_CURRENCIES,
      convertPrice: (amt) => amt,
      formatPrice: (amt) => `QAR ${amt}`,
      formatPriceParts: (amt) => ({
        symbol: 'QAR',
        code: 'QAR',
        amount: amt.toString(),
        isQAR: true,
        qarEquivalent: `QAR ${amt}`,
      }),
    };
  }
  return context;
};
