import { useEffect, useState } from 'react';

export function useExchangeRate() {
  const [rate, setRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        setIsLoading(true);
        // Use a free API or your own backend endpoint
        const response = await fetch(
          'https://api.exchangerate-api.com/v4/latest/USD'
        );
        const data = await response.json();
        setRate(data.rates.BDT); // Get BDT rate
        setError(null);
      } catch (err) {
        console.error('Failed to fetch exchange rate:', err);
        setError('Failed to load exchange rates');
        // Fallback rate if API fails
        setRate(84.5); // Example fallback rate
      } finally {
        setIsLoading(false);
      }
    };

    fetchRate();

    // Refresh rate every hour
    const interval = setInterval(fetchRate, 3600000);
    return () => clearInterval(interval);
  }, []);

  return { rate, isLoading, error };
}
