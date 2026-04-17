import { useUIStore } from '../stores/useUIStore';

/**
 * Utility for formatting currency based on global store settings.
 * Supports multiple currencies and locales.
 */
export const formatCurrency = (amount) => {
  const { currency, locale } = useUIStore.getState();
  
  // Ensure we are working with a number
  const numericAmount = typeof amount === 'string' 
    ? Number(amount.replace(/[^0-9.-]+/g, "")) 
    : Number(amount);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(numericAmount || 0);
};

/**
 * Utility for formatting dates consistently.
 */
export const formatDate = (dateString) => {
  const { locale } = useUIStore.getState();
  if (!dateString) return 'N/A';
  
  return new Date(dateString).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
