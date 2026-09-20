import type { Word } from './types';

const BASE_URL = import.meta.env.VITE_API_URL;
const DEFAULT_LIMIT = 2000;

async function fetchWords(path: string): Promise<Word[]> {
  const response = await fetch(`${BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${path}`);
  }

  return response.json();
}

export function getWords(
  offset: number = 0,
  limit: number = DEFAULT_LIMIT
): Promise<Word[]> {
  return fetchWords(`/api/words?offset=${offset}&limit=${limit}`);
}

export function getWordsByLength(
  length: number,
  offset: number = 0,
  limit: number = DEFAULT_LIMIT
): Promise<Word[]> {
  return fetchWords(
    `/api/words/by-length/${length}?offset=${offset}&limit=${limit}`
  );
}

export function getWordsByLetter(
  letter: string,
  offset: number = 0,
  limit: number = DEFAULT_LIMIT
): Promise<Word[]> {
  return fetchWords(
    `/api/words/by-letter/${encodeURIComponent(letter)}?offset=${offset}&limit=${limit}`
  );
}

export function getWordsByLetterAndLength(
  letter: string,
  length: number,
  offset: number = 0,
  limit: number = DEFAULT_LIMIT
): Promise<Word[]> {
  return fetchWords(
    `/api/words/by-letter-and-length?letter=${encodeURIComponent(letter)}&length=${length}&offset=${offset}&limit=${limit}`
  );
}