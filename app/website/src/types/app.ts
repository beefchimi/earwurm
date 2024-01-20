import type {LibraryEntry} from 'earwurm';

export const SynthTypeValues = [
  'strk',
  'clb1',
  'clb2',
  'hhts',
  'rmbl',
  'blck',
] as const;
export type SynthType = (typeof SynthTypeValues)[number];

export interface SynthEntry extends LibraryEntry {
  id: SynthType;
  path: string;
}

// More precicely typed `LibraryEntry[]`.
export type SynthEntries = SynthEntry[];
