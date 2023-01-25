export type TimeoutId = number | ReturnType<typeof setTimeout>;
// Tuple: custom error, original error.
export type CombinedErrorMessage = [string, string];

///
/// Manager

export type ManagerState = AudioContextState | 'suspending' | 'interrupted';

export interface ManagerEventMap {
  statechange: ManagerState;
  error: CombinedErrorMessage;
}

export interface ManagerConfig {
  volume?: number;
  fadeMs?: number;
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

export interface StackEventMap {
  statechange: StackState;
  error: StackError;
}

export interface StackConfig {
  volume?: number;
  fadeMs?: number;
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

export interface SoundEventMap {
  statechange: SoundState;
  ended: SoundEndedEvent;
  // loop: boolean;
}

export interface SoundConfig {
  volume?: number;
  fadeMs?: number;
}
