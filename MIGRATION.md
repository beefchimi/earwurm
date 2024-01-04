# Earwurm migration guide

## 0.6.0

For more details on the released changes, please see [🐛 Various bug fixes](https://github.com/beefchimi/earwurm/pull/50).

- Rename all instances of `statechange` to `state`.
  - Example: `manager.on('statechange', () => {})`
- Replace any instances of `LibraryKeys` with the equivalent `StackIds[]`.
