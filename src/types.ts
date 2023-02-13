export type TimeoutId = number | ReturnType<typeof setTimeout>;

// Tuple: custom error, original error.
export type CombinedErrorMessage = [string, string];

///
/// Manager

export type ManagerState = AudioContextState | 'suspending' | 'interrupted';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ManagerEventMap = {
  statechange(state: ManagerState): void;
  error(error: CombinedErrorMessage): void;
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

export type LibraryKeys = StackId[];

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
  statechange(state: StackState): void;
  error(error: StackError): void;
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
export type SoundState = 'created' | 'playing' | 'paused' | 'stopping';

export interface SoundEndedEvent {
  id: SoundId;
  source: AudioBufferSourceNode;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type SoundEventMap = {
  statechange(state: SoundState): void;
  ended(event: SoundEndedEvent): void;
  // loop(ended: boolean): void;
};

export interface SoundConfig {
  volume?: number;
  fadeMs?: number;
}
