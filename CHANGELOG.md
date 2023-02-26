# earwurm

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
