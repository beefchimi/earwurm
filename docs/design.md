# Design

> This document will attempt to describe some of the technical details of `Earwurm`.

If you are finding the `API` difficult to understand - or that `Earwurm` is behaving contrary to your expectations - reading this document _should help_ clarify that confusion.

**In order to better understand the terminology** used when discussing “browser audio”, it is recommended that you familiarize yourself with the [`Web Audio API`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).

## Overview

The quickest way to describe the “structure” of an `Earwurm` is:

- An `Earwurm` is a “manager” of sounds, responsible for:
  - Loading the audio asset.
  - Preparing that asset to be played.
  - Coordinating how that asset gets played.
- The `Manager` contains a library of “stacks”.
- A `Stack` contains a queue of “sounds”.
- A `Sound` is created and queued within the `Stack`.
  - The queue increases when calling: `stack.prepare()`.
  - The queue decreases when calling: `sound.stop()` _(or `ended` event)_.
  - The queue has a maximum size.
    - A `Sound` is automatically destroyed as new sounds are added that would exceed that maximum size.
- As sounds begin playing, their output travels through a “chain of gain nodes”, the final “destination” being your device’s speakers.
  - `soundGain > stackGain > managerGain > device speakers`.

## Concepts

`Earwurm` is made up of the following `3` components:

### 1 - The “Manager”

Whenever you instantiate a `new Earwurm()`, you are creating a “Manager” that will act as your “audio hub” - a centralized tool to manage all of your audio.

The “Manager” will be responsible for knowing exactly what sounds you feed to it, and provide you a mechanism to interact with those sounds.

There are a few “master controls” available on the “Manager” which allow you to affect all sounds at once _(`volume` and `mute`)_. For the most part however, you will want to control each sound individually.

In order to play a sound, you must first add it to the “Manager’s” `library` as an `LibraryEntry`. Each “entry” is then transformed into a `Stack`, which surfaces an API that allows you to interact with the sound within.

<!-- eslint-skip -->

```ts
const manager = new Earwurm();

const singleEntry: LibraryEntry = {
  id: 'MySoundId',
  path: 'path/to/my/sound.webm',
};

manager.add(singleEntry, ...additionalEntries);
```

Once an “entry” has been successfully added to the `library`, you can retrieve and interact with it like so:

```ts
const soundStack = manager.get('MySoundId');
const sound = await soundStack?.prepare();

sound?.play();
```

### 2 - The “Stack”

While the “Manager” is our tool to manage _all sounds in the library_, the “Stack” is a bit like _a manager for an individual sound_.

The `Web Audio API` considers sounds to be “single-use”. This means that - once played - the sound is “destroyed” in order to free up resources. When you want to play the same sound again, you have to “re-create it”.

Since “user interface audio” _could require_ rapid execution of an identical sound _(with the intention to “overlap” consecutive executions)_, `Earwurm` creates a new instance of a `Sound` upon every execution of `.prepare()`.

Upon calling `.prepare()`, the `Stack` will instantiate a `new Sound(args)` and add it to the `queue`.

A rough pseudo-code visualization:

```tsx
const soundStack = manager.get('MySound');
const sound = await soundStack?.prepare();

// We can imagine some internal code that looks like:
const latestId = totalSoundsCreated + 1;
const updatedStack = [...stack.queue, new Sound(latestId)];

// We then make 3 consecutive calls to `play` on the same `Sound`:
sound?.play();
sound?.play();
sound?.play();

// If we were to inspect that `Entry` at this exact moment,
// it might look something like this:
const mySoundsEntry = {
  id: 'MySound',
  path: 'path/to/my/sound.webm',
  state: 'playing',
  queue: [
    {
      id: 'MySound-1',
      state: 'playing',
    },
    {
      id: 'MySound-2',
      state: 'playing',
    },
    {
      id: 'MySound-3',
      state: 'playing',
    },
  ],
  // …other properties on the `Stack` instance…
};
```

To better understand a few details of the `Stack`, let’s say:

- The `sound.webm` asset has a `duration` of `1s`.
- Each call to `.play()` was made `200ms` apart.
- While all sounds are `playing`, the `stack.queue` has a `length` of `3`.
- `MySound-1` would “expire” and leave the `stack.queue` after it has finished playing.
- Once `MySound-1` expires, the `stack.queue` would have a `length` of `2`.
- `MySound-2` now has `200ms` remaining before it expires, while `MySound-3` has `400ms` remaining.
- If `MySound-2` had it’s `state` set to `paused`, then it would remain in the `stack.queue` even after `MySound-3` expires.

Calling _some operations_ directly on the `Stack` will affect every `Sound` within:

- All sounds in the `Stack` will have their `state` set to `paused` if `.pause()` is called.
- Likewise, all sounds in the `Stack` will be removed if `.stop()` is called.

**How to gain access to an individual `Sound`:**

Whenever you call `.prepare()` on a `Stack`, it will re-create the necessary audio data, and return the generated `Sound`.

```ts
const echo1 = soundStack.prepare();
echo1.volume = 0.8;

const echo2 = soundStack.prepare();
echo2.volume = 0.6;

const echo3 = soundStack.prepare();
echo3.volume = 0.4;

echo1.play();
setTimeout(() => echo2.play(), 100);
setTimeout(() => echo3.play(), 200);
```

Each call to `.prepare()` will create the `Sound` and add it to the `queue`, setting each `sound.state` to `created` until `.play()` is called on that individual instance.

There is a **maximum of `8` sounds that can be added to the `queue`** at any given time. If a call to `.prepare()` attempts to create a `Sound` outside of that range, the oldest `Sound` within the `queue` will be “stopped and destroyed”. This _could result in_ an abrupt stop to a currently `playing` sound. The reason for this maximum limit is to mitigate performance degradation.

### 3 - The “Sound”

As the name implies, this is the _actual audio_ that lives inside the `Manager > Stack`.

```ts
mySound.play();

mySound.loop = true;
mySound.volume = 0.6;
mySound.mute = true;

mySound.pause();
```
