# Earwurm Migration Guide

## 0.9.0

- Removed the “timed auto-suspend” behaviour.
  - With the new `play` event, it is now easy for consumers to specify this behaviour themselves.
  - See the `Examples` documentation for some insight.
  - PR for code change: <https://github.com/beefchimi/earwurm/pull/78>
- While there is no more “timed auto-suspend”, the `Earwurm` will attempt to optimistically `suspend` whenever:
  - All `Stacks` have been removed from the `Earwurm`. instance.
  - `.stop()` has been called on the `Earwurn` instance.
- Will now auto-resume a `suspended` state when `.play()` is called on a `Sound`.

## 0.7.0

- Replaced the `fadeMs?: number` option for `Earwurm`, `Stack`, and `Sound` with a simpler `transitions?: boolean` option.
  - Defaults to `false`.
  - If opted-into, it will provide an opinionated `200ms` “fade”.
  - To fix: Replace all instances of `fadeMs: someNumber` with `transitions: true`.
- Removed some `static` members from `Earwurm` and `Stack`.
  - Now exposing equivalent values on the exported `tokens` object.
  - To fix, simply replace any instances of:
    - `Earwurm.suspendAfterMs` with `tokens.suspendAfterMs`.
    - `Earwurm.maxStackSize` or `Stack.maxStackSize` with `tokens.maxStackSize`.

## 0.6.0

For more details on the released changes, please see [🐛 Various bug fixes](https://github.com/beefchimi/earwurm/pull/50).

- Renamed all instances of `statechange` to `state`.
  - Example: `manager.on('statechange', () => {})`
  - To fix: Simply find all instances of `statechange` and rename it to `state`.
- Removed the exported `LibraryKeys` type.
  - Simply find-and-replace any instances of `LibraryKeys` with the equivalent `StackIds[]`.
