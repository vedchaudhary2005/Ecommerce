import { useState, useEffect } from 'react';
import { getPublicSweets } from '../api/admin';

// Custom hook to fetch products data from backend
export const useSweets = () => {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products data on mount
  useEffect(() => {
    const fetchSweets = async () => {
      try {
        setLoading(true);
        const response = await getPublicSweets();
        
        if (response.success) {
          setSweets(response.data.sweets);
          setError(null);
        } else {
          setError(response.message);
          setSweets([]); // No fallback data for fashion business
        }
      } catch (error) {
        setError('Failed to fetch products');
        setSweets([]); // No fallback data for fashion business
      } finally {
        setLoading(false);
      }
    };

    fetchSweets();
  }, []);

  // Refetch function
  const refetch = async () => {
    try {
      setLoading(true);
      const response = await getPublicSweets();
      
      if (response.success) {
        setSweets(response.data.sweets);
        setError(null);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  return { sweets, loading, error, refetch };
};