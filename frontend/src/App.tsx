import { useCallback, useEffect, useRef, useState } from 'react';
import type { Word } from './api/types';
import { getWords } from './api/words';
import DictionaryPanel from './components/DictionaryPanel/DictionaryPanel';
import HelperPanel from './components/HelperPanel/HelperPanel';
import './App.css';

const PAGE_SIZE = 100;
const BATCH_SIZE = 2000;
const PAGES_PER_BATCH = BATCH_SIZE / PAGE_SIZE;
const PREFETCH_PAGE = PAGES_PER_BATCH * 0.8;

function getPageWords(
  batches: Record<number, Word[]>,
  pageIndex: number
): Word[] | undefined {
  const batch = batches[Math.floor(pageIndex / PAGES_PER_BATCH)];
  if (!batch) return undefined;

  const start = (pageIndex % PAGES_PER_BATCH) * PAGE_SIZE;
  return batch.slice(start, start + PAGE_SIZE);
}

function App() {
  const [mainBatch, setMainBatch] = useState<Record<number, Word[]>>({});
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const requestedBatches = useRef<Set<number>>(new Set());

  const loadBatch = useCallback(async (batchNumber: number) => {
    if (requestedBatches.current.has(batchNumber)) return;
    requestedBatches.current.add(batchNumber);

    try {
      const words = await getWords(batchNumber * BATCH_SIZE, BATCH_SIZE);
      setMainBatch((prev) => ({ ...prev, [batchNumber]: words }));
    } catch (err) {
      requestedBatches.current.delete(batchNumber);
      setError(err instanceof Error ? err.message : 'Failed to load words');
    }
  }, []);

  const batchNumber = Math.floor(currentPageIndex / PAGES_PER_BATCH);
  const pageInBatch = currentPageIndex % PAGES_PER_BATCH;
  const currentBatch = mainBatch[batchNumber];

  useEffect(() => {
    loadBatch(0);
  }, [loadBatch]);

  useEffect(() => {
    if (!currentBatch) return;

    const isLastBatch = currentBatch.length < BATCH_SIZE;
    if (!isLastBatch && pageInBatch >= PREFETCH_PAGE) {
      loadBatch(batchNumber + 1);
    }
  }, [currentBatch, batchNumber, pageInBatch, loadBatch]);

  const pageWords = getPageWords(mainBatch, currentPageIndex);
  const nextPageWords = getPageWords(mainBatch, currentPageIndex + 1);
  const isBatchFull = currentBatch?.length === BATCH_SIZE;

  const hasPrevious = currentPageIndex > 0;
  const hasNext =
    nextPageWords === undefined ? isBatchFull : nextPageWords.length > 0;

  function handlePrevious() {
    setCurrentPageIndex((page) => page - 1);
  }

  function handleNext() {
    setCurrentPageIndex((page) => page + 1);
  }

  return (
    <div className='app-container'>
      <h1 className='app-title'>myVocabulary</h1>

      <div className='app-content'>
        {error ? (
          <p className='app-message'>{error}</p>
        ) : !pageWords ? (
          <p className='app-message'>Loading…</p>
        ) : (
          <DictionaryPanel
            words={pageWords}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        )}

        <HelperPanel
          onSearch={(word) => console.log('search:', word)}
          onApplyFilters={(filters) => console.log('apply:', filters)}
          onClearFilters={() => console.log('clear')}
        />
      </div>
    </div>
  );
}

export default App;