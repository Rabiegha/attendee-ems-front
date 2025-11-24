import { useMemo } from 'react'
import Fuse, { IFuseOptions } from 'fuse.js'

export const DEFAULT_FUZZY_THRESHOLD = 0.3

interface UseFuzzySearchOptions<T> extends IFuseOptions<T> {
  threshold?: number
}

export function useFuzzySearch<T>(
  data: T[],
  query: string,
  keys: string[],
  options: UseFuzzySearchOptions<T> = {}
): T[] {
  const searchResults = useMemo(() => {
    if (!query) {
      return data
    }

    const fuse = new Fuse(data, {
      keys,
      threshold: options.threshold ?? DEFAULT_FUZZY_THRESHOLD,
      ignoreLocation: true,
      ...options,
    })

    return fuse.search(query).map((result) => result.item)
  }, [data, query, keys, options])

  return searchResults
}
