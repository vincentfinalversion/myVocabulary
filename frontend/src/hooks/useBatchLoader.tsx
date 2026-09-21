import { useCallback, useRef, useState } from 'react';
import type { Word } from '../api/types';

export const BATCH_SIZE = 2000;

export type FetchBatch = (offset: number, limit: number) => Promise<Word[]>;

export function useBatchLoader(fetchBatch: FetchBatch | null) {
  const [batches, setBatches] = useState<Record<number, Word[]>>({});
  const requests = useRef<Map<number, Promise<boolean>>>(new Map());
  const generation = useRef(0);

  // Resolves false only when the request failed.
  const loadBatch = useCallback(
    (batchNumber: number): Promise<boolean> => {
      if (!fetchBatch) return Promise.resolve(false);

      const existing = requests.current.get(batchNumber);
      if (existing) return existing;

      const startedIn = generation.current;

      const request = fetchBatch(batchNumber * BATCH_SIZE, BATCH_SIZE)
        .then((words) => {
          // A reset happened while this was in flight, so drop the result.
          if (generation.current !== startedIn) return true;
          setBatches((prev) => ({ ...prev, [batchNumber]: words }));
          return true;
        })
        .catch(() => {
          if (generation.current === startedIn) {
            requests.current.delete(batchNumber);
          }
          return false;
        });

      requests.current.set(batchNumber, request);
      return request;
    },
    [fetchBatch]
  );

  const reset = useCallback(() => {
    generation.current += 1;
    requests.current = new Map();
    setBatches({});
  }, []);

  return { batches, loadBatch, reset };
}