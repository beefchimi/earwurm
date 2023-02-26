---
'earwurm': minor
---

Bump node to `18.14.2`.

Bump various dependencies.

Fix issue with `Earworm > state` being set to `suspended` even after `closed`.

Fix bug with `Sound` throwing an error on subsequent calls to `.play()`.

Fix bug with `Sound > pause()` not working.

Fix bug with `volume` and `mute` setters not actually changing `gain.value`.

Both `Stack` and `Sound` can now accept a `GainNode` _(in addition to an `AudioNode`)_ as their `destination`.

Simplify exported `types`.
