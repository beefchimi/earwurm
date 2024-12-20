# Earwurm Changelog

## 0.11.2

### Patch Changes

- [#92](https://github.com/beefchimi/earwurm/pull/92) [`54b5434`](https://github.com/beefchimi/earwurm/commit/54b543408f0c1f09c0f59624e647631e24483210) Thanks [@beefchimi](https://github.com/beefchimi)! - Earwurm state is now set to the `context.state` upon initialization.

- [#90](https://github.com/beefchimi/earwurm/pull/90) [`dd04449`](https://github.com/beefchimi/earwurm/commit/dd04449fe50af9c124184e20978fd442798d28b6) Thanks [@beefchimi](https://github.com/beefchimi)! - Update project dependencies.

## 0.11.1

### Patch Changes

- [#88](https://github.com/beefchimi/earwurm/pull/88) [`af3f8ea`](https://github.com/beefchimi/earwurm/commit/af3f8eaa86b12d5ea0a54f719724d152c8112432) Thanks [@beefchimi](https://github.com/beefchimi)! - Downgrade to Node LTS.

## 0.11.0

### Minor Changes

- [#84](https://github.com/beefchimi/earwurm/pull/84) [`fba1989`](https://github.com/beefchimi/earwurm/commit/fba198953c4c1f099763002f2287044eb40d0d87) Thanks [@beefchimi](https://github.com/beefchimi)! - Bumped required node and pnpm versions. Also overhauled linting/formatting.

## 0.10.0

### Minor Changes

- [#82](https://github.com/beefchimi/earwurm/pull/82) [`c2f5c21`](https://github.com/beefchimi/earwurm/commit/c2f5c214c577e6b1d26c4030518dd9336995efaf) Thanks [@beefchimi](https://github.com/beefchimi)! - Switched from local utilities package to beeftools.

## 0.9.0

### Minor Changes

- [#78](https://github.com/beefchimi/earwurm/pull/78) [`272c601`](https://github.com/beefchimi/earwurm/commit/272c601f15606e0a5728d9db0702e26a368aebe3) Thanks [@beefchimi](https://github.com/beefchimi)! - Remove timed auto-suspend in favour of exposing `.suspend() / .resume()` methods on `Earuwrm`.

- [#78](https://github.com/beefchimi/earwurm/pull/78) [`272c601`](https://github.com/beefchimi/earwurm/commit/272c601f15606e0a5728d9db0702e26a368aebe3) Thanks [@beefchimi](https://github.com/beefchimi)! - New `play` event available on `Earwurm` instance.

## 0.8.2

### Patch Changes

- [#75](https://github.com/beefchimi/earwurm/pull/75) [`d159f16`](https://github.com/beefchimi/earwurm/commit/d159f168ce5e42b870a9b382571545265b9498fb) Thanks [@beefchimi](https://github.com/beefchimi)! - Remove bundleDependencies and just use devDependencies.

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
