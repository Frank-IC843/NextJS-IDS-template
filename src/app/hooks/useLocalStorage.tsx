import { useState, useEffect } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * @param key - The localStorage key
 * @param initialValue - The initial value if nothing is in localStorage
 * @returns A tuple of [value, setValue] similar to useState
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  // Initialize with initialValue to avoid hydration mismatch
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Handle hydration after component mounts
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        // Special handling for strings - they might be stored as plain text or JSON
        if (typeof initialValue === 'string') {
          // First, try to use it as a plain string
          setStoredValue(item as T);
        } else {
          // For non-string types, parse as JSON
          try {
            setStoredValue(JSON.parse(item));
          } catch {
            // If parsing fails for non-string types, reset to initial value
            setStoredValue(initialValue);
            window.localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error loading localStorage key "${key}":`, error);
      }
    }
  }, [key, initialValue]);

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        // For strings, store them as plain text
        if (typeof valueToStore === 'string') {
          window.localStorage.setItem(key, valueToStore as string);
        } else {
          // For other types, stringify them
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    }
  };

  return [storedValue, setValue];
}
