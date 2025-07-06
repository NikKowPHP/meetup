import { useEffect, useRef } from 'react';

type CallbackFunction<T extends any[]> = (...args: T) => void;

export function useDebouncedSearch<T extends any[]>(
  callback: CallbackFunction<T>,
  delay: number
): CallbackFunction<T> {
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (...args: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}