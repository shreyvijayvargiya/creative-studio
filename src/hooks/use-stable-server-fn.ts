import { useRef } from 'react'
import { useServerFn } from '@tanstack/react-start'

/**
 * TanStack Start's useServerFn can return a new function reference each render,
 * which retriggers useEffect deps and causes fetch/render loops. This wrapper
 * returns one stable callable for the component lifetime.
 */
export function useStableServerFn<T extends (...args: never[]) => unknown>(
  serverFn: T,
): T {
  const serverFnCallable = useServerFn(serverFn)
  const latestFn = useRef(serverFnCallable)
  latestFn.current = serverFnCallable

  const stableFn = useRef<T | null>(null)
  if (!stableFn.current) {
    stableFn.current = ((...args: Parameters<T>) =>
      latestFn.current(...args)) as T
  }

  return stableFn.current
}
