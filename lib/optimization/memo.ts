import { memo, useMemo } from 'react';

type AnyObject = Record<string, any>;

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }
  return true;
}

export function deepMemo<T extends React.ComponentType<any>>(Component: T): T {
  return memo(Component, deepEqual) as unknown as T;
}

export function useDeepMemo<T>(factory: () => T, deps: AnyObject): T {
  return useMemo(factory, [JSON.stringify(deps)]);
}

export function arePropsEqual<T extends AnyObject>(prevProps: T, nextProps: T): boolean {
  return deepEqual(prevProps, nextProps);
}