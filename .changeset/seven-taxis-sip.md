---
'earwurm': minor
---

Fix issue "stopping" a `Sound` that was never "started".
Include a `neverStarted: boolean;` property in the `SoundEndedEvent`.
New `volume` change event for `Earwurm`, `Stack`, and `Sound`.
New `mute` change event for `Earwurm`, `Stack`, and `Sound`.
New `library` change event for `Earwurm`.
New `queue` change event for `Stack`.
New `speed` change event for `Sound`.
`speed` Setter now clamps the value between `0.25` and `4`.
New `progress` change event.
New `progress` Getter.
New `state > ending` value.
Renamed all `statechange` events to `state`.
No longer setting `mute = false` when "pausing".
Avoid re-initializing an existing `Stack` when `.add()` is passed an identical `id + path`.
Removed `LibraryKeys` type, instead using `StackIds[]` directly.
Now exporting `tokens` object with some usual values.
Updated `docs/api.md` to include details on all the newly added / changed code.
