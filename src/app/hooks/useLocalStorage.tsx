import { useState, useEffect } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * @param key - The localStorage key
 * @param initialValue - The initial value if nothing is in localStorage
 * @returns A tuple of [value, setValue] similar to useState
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error loading localStorage key "${key}":`, error);
      }
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    }
  };

  return [storedValue, setValue];
}
