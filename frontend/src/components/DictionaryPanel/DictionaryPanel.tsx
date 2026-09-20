import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { Word } from '../../api/types';
import Button from '../Button/Button';
import './DictionaryPanel.css';

type WordCardProps = {
  word: Word;
  highlighted: boolean;
};

function WordCard({ word, highlighted }: WordCardProps) {
  return (
    <div  
      id={`word-${word.id}`} 
      className={`word-card ${highlighted ? 'word-card-highlighted' : ''}`}
    >
      <p className='word-card-word'>{word.wordText}</p>
      <p className='word-card-definition'>{word.definition}</p>
    </div>
  );
}

type WordListProps = {
  words: Word[];
  highlightedId?: number;
  listRef: RefObject<HTMLDivElement | null>;
};

function WordList({ words, highlightedId, listRef }: WordListProps) {
  return (
    <div className='word-list-container' ref={listRef}>
      {words.map((word) => (
        <WordCard
          key={word.id}
          word={word}
          highlighted={word.id === highlightedId}
        />
      ))}
    </div>
  );
}

type DictionaryPanelProps = {
  words: Word[];
  highlightedId?: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

function DictionaryPanel({
  words,
  highlightedId,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: DictionaryPanelProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightedId === undefined) return;

    document
      .getElementById(`word-${highlightedId}`)
      ?.scrollIntoView({ block: 'center' });
  }, [highlightedId, words]);
  
  function scrollToTop() {
    listRef.current?.scrollTo({ top: 0 });
  }

  function handlePrevious() {
    onPrevious();
    scrollToTop();
  }

  function handleNext() {
    onNext();
    scrollToTop();
  }

  return (
    <div className='dictionary-panel-container'>
      <div className='dictionary-panel-header'>
        <Button
          variant='secondary'
          aria-label='Previous page'
          disabled={!hasPrevious}
          onClick={handlePrevious}
        >
          &lt;
        </Button>
        <Button
          variant='secondary'
          aria-label='Next page'
          disabled={!hasNext}
          onClick={handleNext}
        >
          &gt;
        </Button>
      </div>

      <WordList
        words={words}
        highlightedId={highlightedId}
        listRef={listRef}
      />
    </div>
  );
}

export default DictionaryPanel;