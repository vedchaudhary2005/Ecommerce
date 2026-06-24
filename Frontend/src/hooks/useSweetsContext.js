import { useContext } from 'react';
import { SweetsContext } from '../context/SweetsContext';

// Custom hook to use SweetsContext
export const useSweetsContext = () => {
  const context = useContext(SweetsContext);
  
  if (!context) {
    throw new Error('useSweetsContext must be used within a SweetsProvider');
  }
  
  return context;
};