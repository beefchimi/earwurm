---
'earwurm': minor
---

`Stack` now correctly passes a custom `Sound > id` _(instead of appending as a `suffix`)_.
Fixed a bug where `Stack` was double incrementing `totalSoundsCreated`.
Fixed an issue with `#create` not filtering "out of bounds" Sounds.
