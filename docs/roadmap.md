# Roadmap

While we are intentionally keeping the scope of `Earwurm` to an absolute minimum, there are still some features / tasks that remain to be completed.

## Tasks

1. Ability to `seek()`.
2. Ability to set `speed`.
3. Ability to set `pitch`.
4. Calculate `elapsed` time per-sound.
   - If this can be achieved _(taking into consideration how `speed` will influence the calculation of `elapsed`)_, then we can add a `progress` event.
5. Support `sprite`.
6. Tests.
7. Finish docs.
   - We need to elaborate on returning a `scratchBuffer` if the `fetch` fails.
   - If we failed to load the sound, return a “scratch buffer” so that we can still register an `ended` listener and call `.stop()` on the `source`. Since `Stack` will `emit` an `error` event with the `Sound > id`, consumer’s can listen for that event and perform their own handling.
8. …and more…

## Considerations

1. Should we make `context` available to the consumer so that they can re-use it for other things?
   - Can cause many complications within `Earwurm`.
2. Should we have some “SSR detection” to know if we can actually use the `Web Audio API`?
   - Can the `Web Audio API` work on a server?
3. Should we offer a utility to help detect:
   - `AudioContext` support.
   - `webm` format support.
   - `opus` codec support.
4. Should we implement the “distortion fix” within the `unlock` method?
   - `Howler` uses this, but I'm not sure if its relevant for evergreen browsers.
5. Consider a `autoSuspendDelay` config option.
   - Accepts a `ms` value that defaults to `30000`.
   - If `0` is passed to `autoSuspendDelay`, then we consider that a “opt-out” value and disable the auto-suspension.
6. Should we allow “restarting” a `Earwurm` instance after `.teardown()` has been called?
   - My current preference is, once `.teardown()` is called, you are done with that instance and will not be resurrecting it.
   - We are not however setting `#context` and `managerGain` to `null`, because that would introduce a `null` type that I do not want to check for within the code.
7. Investigate if it makes any sense to utilize a `OfflineAudioContext`.
8. Consider a `delay` property for a `Sound`.
   - The idea is that the `delay` is persistent for that sound.
   - The `delay` is included in each subsequent `loop`, instead of ONLY applying to the first iteration.
   - Maybe a `startPad` and `endPad` make sense?
9. At the moment, `fadeMs` is passed to `new Earwurm` and will be the same value for `manager`, `stack` and `sound`.
   - If we want more ganularity, we could remove `fadeMs` from the `constructor`.
   - Then, we would need to convert the `volume` accessor to a `volume(fadeMs)` method.
   - Now, we can specify a unique `fadeMs` upon every call to `.volume()` for each separate component.
   - We would also need to pass `fadeMs` to `.pause()`.
   - I think both `stop` and `mute` could be left alone, and we simply state that those are "instant actions".
10. Should we offer a way to "pre-fetch" all audio data within an `Earwurm`?
    - Otherwise, we will sometimes have a "delay" before audio begins playing for the first time.
    - It would also be nice if a `Stack` had a `cached` boolean getter.
11. Is it reasonable to cache the decoded `AudioBuffer` by storing it on the `Stack` instance?
    - We could introduce this private property: `#audioBuffer: AudioBuffer | null;`
    - And then add an option to the `config` for `cacheAudioBuffer?: boolean;`
    - This would have to be flagged as potentially "dangerous", as I imagine caching too many buffers creates considerable overhead.
12. Considering adding a `queuechange` event on `Stack`.
    - We could simply `.emit()` from `#setQueue` and pass `keys` as the argument.
13. Do we need to re-check the `#queue` state when a sound has `ended`?
    - This would be done within `Stack > #handleSoundEnded`.
    - A sound goes into a `stopping` state first, which will trigger `#setStateFromQueue`. There shouldn't be any reason for the `ended` event to fail… but if so, then we will need to re-check.
14. Find out if `statechange` event listeners automatically get removed upon calling `.close()` / state change to `closed` on a `AudioContext`.
    - If so, then I can remove the `.close().then()` chain.
15. Consider adding a `readonly parent` to both `Stack` and `Sound`.
    - The value of each would be `this` from either the `Manager` or the `Stack`.
    - Example: This would allow me to know what `Stack` manages a particular `Sound`.
