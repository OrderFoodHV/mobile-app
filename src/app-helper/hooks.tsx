import React, { useCallback, useRef, useEffect } from 'react';

/**
 * Handle function
 * @param callback
 */
export function useOnEventCallback<T extends (...args: any[]) => any>(callback: T): T {
  const ref = useRef<T>(callback);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  return useCallback<T>(
    ((...args) => {
      return ref.current(...args);
    }) as T,
    [],
  );
}
