export type PrimitiveType =
  | string
  | number
  | bigint
  | boolean
  | symbol
  | undefined
  | null;

export type TimeoutId = number | ReturnType<typeof setTimeout>;

// Tuple: custom error, original error.
export type CombinedErrorMessage = [string, string];

///
/// Manager

export type ManagerState = AudioContextState | 'suspending' | 'interrupted';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ManagerEventMap = {
  state: (current: ManagerState) => void;
  library: (newKeys: StackId[], oldKeys: StackId[]) => void;
  volume: (level: number) => void;
  mute: (muted: boolean) => void;
  error: (messages: CombinedErrorMessage) => void;
};

export interface ManagerConfig {
  volume?: number;
  fadeMs?: number;
  request?: RequestInit;
}

export interface LibraryEntry {
  id: StackId;
  path: string;
}

///
/// Stack

export type StackId = string;
export type StackState = 'idle' | 'loading' | 'playing';

export interface StackError {
  id: StackId;
  message: CombinedErrorMessage;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type StackEventMap = {
  state: (current: StackState) => void;
  queue: (newKeys: SoundId[], oldKeys: SoundId[]) => void;
  volume: (level: number) => void;
  mute: (muted: boolean) => void;
  error: (message: StackError) => void;
};

export interface StackConfig {
  volume?: number;
  fadeMs?: number;
  request?: RequestInit;
}

///
/// Sound

export type SoundId = string;
// TODO: Are there any errors that can occur on a `Sound`?
// If so, we need to add an error `event` and/or `state`.
export type SoundState =
  | 'created'
  | 'playing'
  | 'paused'
  | 'stopping'
  | 'ending';

export interface SoundEndedEvent {
  id: SoundId;
  source: AudioBufferSourceNode;
  neverStarted: boolean;
}

export interface SoundProgressEvent {
  elapsed: number;
  remaining: number;
  percentage: number;
  iterations: number;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type SoundEventMap = {
  state: (current: SoundState) => void;
  ended: (event: SoundEndedEvent) => void;
  volume: (level: number) => void;
  mute: (muted: boolean) => void;
  speed: (rate: number) => void;
  progress: (event: SoundProgressEvent) => void;
  // loop(ended: boolean): void;
};

export interface SoundConfig {
  volume?: number;
  fadeMs?: number;
}
