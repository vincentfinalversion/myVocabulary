import { useCallback, useEffect, useRef, useState } from 'react';
import type { Word } from './api/types';
import { getWordPosition, getWords } from './api/words';
import DictionaryPanel from './components/DictionaryPanel/DictionaryPanel';
import HelperPanel from './components/HelperPanel/HelperPanel';
import './App.css';

const PAGE_SIZE = 100;
const BATCH_SIZE = 2000;
const PAGES_PER_BATCH = BATCH_SIZE / PAGE_SIZE;
const PREFETCH_PAGE = PAGES_PER_BATCH * 0.8;
const SEARCH_ERROR = 'Something went wrong. Try again.';

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
  const [highlightedId, setHighlightedId] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);

  const batchRequests = useRef<Map<number, Promise<boolean>>>(new Map());

  const loadBatch = useCallback((batchNumber: number): Promise<boolean> => {
    const existing = batchRequests.current.get(batchNumber);
    if (existing) return existing;

    const request = getWords(batchNumber * BATCH_SIZE, BATCH_SIZE)
      .then((words) => {
        setMainBatch((prev) => ({ ...prev, [batchNumber]: words }));
        return true;
      })
      .catch(() => {
        batchRequests.current.delete(batchNumber);
        return false;
      });

    batchRequests.current.set(batchNumber, request);
    return request;
  }, []);

  const batchNumber = Math.floor(currentPageIndex / PAGES_PER_BATCH);
  const pageInBatch = currentPageIndex % PAGES_PER_BATCH;
  const currentBatch = mainBatch[batchNumber];

  useEffect(() => {
    if (currentBatch) return;

    loadBatch(batchNumber).then((ok) => {
      if (!ok) setError('Failed to load words');
    });
  }, [batchNumber, currentBatch, loadBatch]);

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
    setHighlightedId(undefined);
    setCurrentPageIndex((page) => page - 1);
  }

  function handleNext() {
    setHighlightedId(undefined);
    setCurrentPageIndex((page) => page + 1);
  }

  async function backfillBatches(fromBatch: number) {
    for (let batch = fromBatch; batch >= 0; batch--) {
      const ok = await loadBatch(batch);
      if (!ok) return;
    }
  }

  async function handleSearch(word: string): Promise<string | null> {
    try {
      const result = await getWordPosition(word);
      if (result === null) return 'Word not found';

      const targetBatch = Math.floor(result.position / BATCH_SIZE);
      const targetPage = Math.floor(result.position / PAGE_SIZE);

      const loaded = await loadBatch(targetBatch);
      if (!loaded) return SEARCH_ERROR;

      setCurrentPageIndex(targetPage);
      setHighlightedId(result.id);
      backfillBatches(targetBatch - 1);

      return null;
    } catch {
      return SEARCH_ERROR;
    }
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
            highlightedId={highlightedId}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        )}

        <HelperPanel
          onSearch={handleSearch}
          onApplyFilters={(filters) => console.log('apply:', filters)}
          onClearFilters={() => console.log('clear')}
        />
      </div>
    </div>
  );
}

export default App;