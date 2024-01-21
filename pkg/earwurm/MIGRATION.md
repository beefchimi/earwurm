# Earwurm migration guide

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
