# Earwurm Changelog

## 0.8.1

### Patch Changes

- [#73](https://github.com/beefchimi/earwurm/pull/73) [`450aa86`](https://github.com/beefchimi/earwurm/commit/450aa869190ab3a08e99a9f5bcf845afeff4b4e0) Thanks [@beefchimi](https://github.com/beefchimi)! - Define bundleDependencies in hopes it solves failed package installs.

## 0.8.0

### Minor Changes

- [#66](https://github.com/beefchimi/earwurm/pull/66) [`ef66a1b`](https://github.com/beefchimi/earwurm/commit/ef66a1bf00a0c79221f87e16631c2093c541ead7) Thanks [@beefchimi](https://github.com/beefchimi)! - Refactor codebase into a monorepo.

## 0.7.0

### Minor Changes

- 5f7e2b1: Remove all `static` members in favour of exported `tokens` object.
- 5f7e2b1: Replace `fadeMs` option with `transitions` boolean.

## 0.6.0

### Minor Changes

- 51368fd: Fix issue "stopping" a `Sound` that was never "started".
- 51368fd: Include a `neverStarted: boolean;` property in the `SoundEndedEvent`.
- 51368fd: New `volume` change event for `Earwurm`, `Stack`, and `Sound`.
- 51368fd: New `mute` change event for `Earwurm`, `Stack`, and `Sound`.
- 51368fd: New `library` change event for `Earwurm`.
- 51368fd: New `queue` change event for `Stack`.
- 51368fd: New `speed` change event for `Sound`.
- 51368fd: `speed` Setter now clamps the value between `0.25` and `4`.
- 51368fd: New `progress` change event.
- 51368fd: New `progress` Getter.
- 51368fd: New `state > ending` value.
- 51368fd: Renamed all `statechange` events to `state`.
- 51368fd: No longer setting `mute = false` when "pausing".
- 51368fd: Avoid re-initializing an existing `Stack` when `.add()` is passed an identical `id + path`.
- 51368fd: Removed `LibraryKeys` type, instead using `StackIds[]` directly.
- 51368fd: Now exporting `tokens` object with some usual values.
- 51368fd: Updated `docs/api.md` to include details on all the newly added / changed code.

### Patch Changes

- 222eb16: Bumping project dependencies, including the emitten peerDependency.

## 0.5.2

### Patch Changes

- ae3a112: Fix failure to resolve types in some projects.

## 0.5.1

### Patch Changes

- ff464bf: Include prettier in devDependencies

## 0.5.0

### Minor Changes

- 2ce6f50: Upgrade to Vite 5

## 0.4.0

### Minor Changes

- f2f911d: Upgrade to TypeScript 5.

### Patch Changes

- d41dfd5: Various dependency bumps.

## 0.3.0

### Minor Changes

- 2e81cd3: Earwurm now empties all events on teardown.
- 2e81cd3: Earwurm now triggers autoSuspend conditionally on init and whenever state changes to "running".
- 2e81cd3: Revise some method types for TypeScript strict mode.

## 0.2.0

### Minor Changes

- 87464b3: `Stack` now correctly passes a custom `Sound > id` _(instead of appending as a `suffix`)_.
- 87464b3: Fixed a bug where `Stack` was double incrementing `totalSoundsCreated`.
- 87464b3: Fixed an issue with `#create` not filtering "out of bounds" Sounds.
- f98e04a: Bump node to `18.14.2`.
- f98e04a: Bump various dependencies.
- f98e04a: Fix issue with `Earworm > state` being set to `suspended` even after `closed`.
- f98e04a: Fix bug with `Sound` throwing an error on subsequent calls to `.play()`.
- f98e04a: Fix bug with `Sound > pause()` not working.
- f98e04a: Fix bug with `volume` and `mute` setters not actually changing `gain.value`.
- f98e04a: Both `Stack` and `Sound` can now accept a `GainNode` _(in addition to an `AudioNode`)_ as their `destination`.
- f98e04a: Simplify exported `types`.

### Patch Changes

- dc3dfe3: Mock AudioContext for testing.
- f019b47: Further improve Web Audio mocks and helpers tests.
- dcc5adc: Initial testing setup.
- fde15fb: Further adjust test env for better Web Audio testing.

## 0.1.0

### Minor Changes

- cb3cdd0: Bump emitten to v0.3.0

## 0.0.3

### Patch Changes

- 87beb80: Export types for LibraryEntry and LibraryKeys.
- dc9bc89: Improve README with some guidance on converting audio files.
- dffe648: Solves a `this` binding issue by converting a `Stack` method to an arrow function.
- dffe648: Removed some `console.log` calls.
- dffe648: Bumps `emitten` to `0.2.0` to solve a `super > accessor` bug.

## 0.0.2

### Patch Changes

- 877e95b: Update Emitten and revise public exposure of protected methods.

## 0.0.1

### Patch Changes

- d9dc55b: Can now pass a request object to the config for both Earwurm and Stack.
