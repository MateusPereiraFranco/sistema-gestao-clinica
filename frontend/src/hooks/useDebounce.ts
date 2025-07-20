'use client';

import { useState, useEffect } from 'react';

/**
 * Hook que atrasa a atualização de um valor. Útil para evitar chamadas excessivas à API em inputs de busca.
 * @param value O valor a ser "atrasado".
 * @param delay O tempo de atraso em milissegundos.
 * @returns O valor após o atraso.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}