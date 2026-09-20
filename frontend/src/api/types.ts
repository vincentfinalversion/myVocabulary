export interface Word {
  id: number;
  wordText: string;
  definition: string;
  characterCount: number;
}

export interface WordPosition {
  id: number;
  position: number;
}

export interface Filters {
  letter: string | null;
  length: number | null;
}