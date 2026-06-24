import { createContext, useState, useEffect } from 'react';
import { getPublicSweets } from '../api/admin';

// Create Sweets Context
const SweetsContext = createContext();

// Sweets Provider Component
export const SweetsProvider = ({ children }) => {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch sweets from backend
  const fetchSweets = async () => {
    try {
      setLoading(true);
      const response = await getPublicSweets();
      
      if (response.success) {
        // Handle both response structures: response.sweets (from public API) or response.data.sweets (from admin API)
        const sweetsData = response.sweets || response.data?.sweets || [];
        setSweets(sweetsData);
        setError(null);
        console.log('Sweets fetched successfully:', sweetsData.length, 'items');
      } else {
        setError(response.message || 'Failed to fetch sweets');
        console.error('API error:', response.message);
        setSweets([]);
      }
    } catch (error) {
      setError('Failed to fetch sweets');
      console.error('Fetch error:', error); // Debug log
      setSweets([]); // No fallback to dummy data
    } finally {
      setLoading(false);
    }
  };

  // Refetch sweets (for admin updates)
  const refetchSweets = () => {
    fetchSweets();
  };
  
  // Auto-refresh sweets every 5 seconds for real-time admin updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSweets();
    }, 5000); // 5 seconds - real-time updates for admin changes
    
    return () => clearInterval(interval);
  }, []);

  // Load sweets on mount
  useEffect(() => {
    fetchSweets();
  }, []);

  return (
    <SweetsContext.Provider value={{
      sweets,
      loading,
      error,
      refetchSweets
    }}>
      {children}
    </SweetsContext.Provider>
  );
};

// Removed static fallback data - only use backend data

export { SweetsContext };