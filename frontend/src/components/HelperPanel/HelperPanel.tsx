import { useState } from 'react';
import type { Filters } from '../../api/types';
import TextBox from '../TextBox/TextBox';
import Button from '../Button/Button';
import './HelperPanel.css';

type SearchPanelProps = {
  onSearch: (word: string) => void;
};

function SearchPanel({ onSearch }: SearchPanelProps) {
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');

  function handleChange(value: string) {
    setSearchText(value);
    setError('');
  }

  function handleSearch() {
    const word = searchText.trim();

    if (!word) {
      setError('Enter a word');
      return;
    }

    onSearch(word);
  }

  return (
    <div className='search-panel-container'>
      <label className='search-panel-label'>
        Search
      </label>

      <TextBox
        label='Find a specific word'
        placeholder='Enter a word'
        value={searchText}
        error={error}
        onChange={(e) => handleChange(e.target.value)}
      />

      <Button onClick={handleSearch}>
        Search
      </Button>
    </div>
  );
}

type FilterPanelProps = {
  onApplyFilters: (filters: Filters) => void;
  onClearFilters: () => void;
};

function FilterPanel({ onApplyFilters, onClearFilters }: FilterPanelProps) {
  const [letterText, setLetterText] = useState('');
  const [lengthText, setLengthText] = useState('');
  const [letterError, setLetterError] = useState('');
  const [lengthError, setLengthError] = useState('');

  function handleLetterChange(value: string) {
    setLetterText(value);
    setLetterError('');
  }

  function handleLengthChange(value: string) {
    setLengthText(value);
    setLengthError('');
  }

  function handleApply() {
    const letter = letterText.trim();
    const length = lengthText.trim();

    if (!letter && !length) {
      setLetterError('Enter a letter or a character count');
      return;
    }

    let hasError = false;

    if (letter && letter.length !== 1) {
      setLetterError('Enter a single letter');
      hasError = true;
    }

    if (length && !/^[1-9]\d*$/.test(length)) {
      setLengthError('Enter a positive number');
      hasError = true;
    }

    if (hasError) return;

    onApplyFilters({
      letter: letter || null,
      length: length ? Number(length) : null,
    });
  }

  function handleClear() {
    setLetterText('');
    setLengthText('');
    setLetterError('');
    setLengthError('');
    onClearFilters();
  }

  return (
    <div className='filter-panel-container'>
      <label className='filter-panel-label'>
        Filters
      </label>

      <div className='filter-textbox-container'>
        <TextBox
          label='Filter by starting letter'
          placeholder='Enter a letter'
          value={letterText}
          error={letterError}
          onChange={(e) => handleLetterChange(e.target.value)}
        />
        <TextBox
          label='Filter by character count'
          placeholder='Enter character amount'
          value={lengthText}
          error={lengthError}
          onChange={(e) => handleLengthChange(e.target.value)}
        />
      </div>

      <div className='filter-button-container'>
        <Button variant='destructive' onClick={handleClear}>
          Clear Filters
        </Button>
        <Button onClick={handleApply}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
}

type HelperPanelProps = {
  onSearch: (word: string) => void;
  onApplyFilters: (filters: Filters) => void;
  onClearFilters: () => void;
};

function HelperPanel({
  onSearch,
  onApplyFilters,
  onClearFilters,
}: HelperPanelProps) {
  return (
    <div className='helper-panel-container'>
      <SearchPanel onSearch={onSearch} />
      <FilterPanel
        onApplyFilters={onApplyFilters}
        onClearFilters={onClearFilters}
      />
    </div>
  );
}

export default HelperPanel;