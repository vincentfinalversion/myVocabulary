import { useEffect, useMemo, useState } from 'react';
import type { Filters, Word } from './api/types';
import {
  getWordPosition,
  getWords,
  getWordsByLength,
  getWordsByLetter,
  getWordsByLetterAndLength,
} from './api/words';
import { BATCH_SIZE, useBatchLoader } from './hooks/useBatchLoader';
import type { FetchBatch } from './hooks/useBatchLoader';
import DictionaryPanel from './components/DictionaryPanel/DictionaryPanel';
import HelperPanel from './components/HelperPanel/HelperPanel';
import './App.css';

const PAGE_SIZE = 100;
const PAGES_PER_BATCH = BATCH_SIZE / PAGE_SIZE;
const PREFETCH_PAGE = PAGES_PER_BATCH * 0.8;
const SEARCH_ERROR = 'Something went wrong. Try again.';

const fetchMain: FetchBatch = (offset, limit) => getWords(offset, limit);

function getFilteredFetcher(filters: Filters | null): FetchBatch | null {
  if (!filters) return null;

  const { letter, length } = filters;

  if (letter !== null && length !== null) {
    return (offset, limit) =>
      getWordsByLetterAndLength(letter, length, offset, limit);
  }
  if (letter !== null) {
    return (offset, limit) => getWordsByLetter(letter, offset, limit);
  }
  if (length !== null) {
    return (offset, limit) => getWordsByLength(length, offset, limit);
  }
  return null;
}

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
  const main = useBatchLoader(fetchMain);

  const [appliedFilters, setAppliedFilters] = useState<Filters | null>(null);
  const fetchFiltered = useMemo(
    () => getFilteredFetcher(appliedFilters),
    [appliedFilters]
  );
  const filtered = useBatchLoader(fetchFiltered);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [filteredPageIndex, setFilteredPageIndex] = useState(0);
  const [highlightedId, setHighlightedId] = useState<number | undefined>();
  const [filterResetKey, setFilterResetKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const isFiltered = appliedFilters !== null;
  const active = isFiltered ? filtered : main;
  const activePageIndex = isFiltered ? filteredPageIndex : currentPageIndex;
  const setActivePageIndex = isFiltered
    ? setFilteredPageIndex
    : setCurrentPageIndex;
  const loadActiveBatch = active.loadBatch;

  const batchNumber = Math.floor(activePageIndex / PAGES_PER_BATCH);
  const pageInBatch = activePageIndex % PAGES_PER_BATCH;
  const currentBatch = active.batches[batchNumber];

  useEffect(() => {
    if (currentBatch) return;

    loadActiveBatch(batchNumber).then((ok) => {
      if (!ok) {
        setError(
          isFiltered ? 'Failed to load filtered words' : 'Failed to load words'
        );
      }
    });
  }, [batchNumber, currentBatch, loadActiveBatch, isFiltered]);

  useEffect(() => {
    if (!currentBatch) return;

    const isLastBatch = currentBatch.length < BATCH_SIZE;
    if (!isLastBatch && pageInBatch >= PREFETCH_PAGE) {
      loadActiveBatch(batchNumber + 1);
    }
  }, [currentBatch, batchNumber, pageInBatch, loadActiveBatch]);

  const pageWords = getPageWords(active.batches, activePageIndex);
  const nextPageWords = getPageWords(active.batches, activePageIndex + 1);
  const isBatchFull = currentBatch?.length === BATCH_SIZE;

  const hasPrevious = activePageIndex > 0;
  const hasNext =
    nextPageWords === undefined ? isBatchFull : nextPageWords.length > 0;

  function handlePrevious() {
    setHighlightedId(undefined);
    setActivePageIndex((page) => page - 1);
  }

  function handleNext() {
    setHighlightedId(undefined);
    setActivePageIndex((page) => page + 1);
  }

  function discardFilteredView() {
    filtered.reset();
    setFilteredPageIndex(0);
    setAppliedFilters(null);
  }

  function handleApplyFilters(filters: Filters) {
    setError(null);
    setHighlightedId(undefined);
    filtered.reset();
    setFilteredPageIndex(0);
    setAppliedFilters(filters);
  }

  function handleClearFilters() {
    if (!isFiltered) return;

    setError(null);
    setHighlightedId(undefined);
    discardFilteredView();
  }

  async function backfillBatches(fromBatch: number) {
    for (let batch = fromBatch; batch >= 0; batch--) {
      const ok = await main.loadBatch(batch);
      if (!ok) return;
    }
  }

  async function handleSearch(word: string): Promise<string | null> {
    try {
      const result = await getWordPosition(word);
      if (result === null) return 'Word not found';

      const targetBatch = Math.floor(result.position / BATCH_SIZE);
      const targetPage = Math.floor(result.position / PAGE_SIZE);

      const loaded = await main.loadBatch(targetBatch);
      if (!loaded) return SEARCH_ERROR;

      if (isFiltered) {
        discardFilteredView();
        setFilterResetKey((key) => key + 1);
      }

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
        ) : isFiltered && activePageIndex === 0 && pageWords.length === 0 ? (
          <p className='app-message'>No words match these filters.</p>
        ) : (
          <DictionaryPanel
            key={isFiltered ? 'filtered' : 'main'}
            words={pageWords}
            highlightedId={highlightedId}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        )}

        <HelperPanel
          filterResetKey={filterResetKey}
          onSearch={handleSearch}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />
      </div>
    </div>
  );
}

export default App;