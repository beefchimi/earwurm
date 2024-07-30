# Examples

> Eventually, we hope to offer CodeSandbox examples that you can interact with.

The following examples should help demonstrate _most of the_ common use cases for `Earwurm`.

## Getting started

Here are some basic examples to help initalize your `Earwurm` instance.

### Initialization

In order to start making noise, we will need to have an `Earwurm` instance to work with.

```ts
// Initialize the “manager”.
const manager = new Earwurm();
manager.add({id: 'MyStack', path: 'path/to/my/sound.webm'});

// Now play some sounds!
const stack = manager.get('MyStack');
const sound = await stack?.prepare();

sound?.play();
```

### Enabling autoplay

Most browsers will intentionally block audio from playing automatically. The user should not be caught off guard with unwanted noise… annoying advertisements be damned! Any media should be explicitly initialized by the user.

With that said, sometimes we just _need to autoplay audio_. In that case, we likely need to “unlock” the ability to play audio.

```ts
// It is safe to call `unlock()` even if the browser
// has already “unlocked” the `AudioContext`.
manager.unlock();

// We can always check `unlocked` status before
// performing an audio action.
if (manager.unlocked) sound?.play();
```

### Adding entries

We can add as few as `1` new `Stack` at a time.

```ts
// Add one new `Stack` entry.
manager.add({id: 'NewEntry', path: 'path/to/my/audio.webm'});

// The result will return an array of freshly added ids.
// > ['NewEntry']

// Or, add any number of new entries at once.
manager.add(
  {
    id: 'Apple',
    path: 'apple.webm',
  },
  {
    id: 'Banana',
    path: 'banana.webm',
  },
  {
    id: 'Peach',
    path: 'peach.webm',
  },
  {
    id: 'Sprite',
    path: 'sprite.webm',
  },
);

// The returned result.
// > ['Apple', 'Banana', 'Peach', 'Sprite']
```

### Removing entries

Similarly, we can remove any entries that have already been added:

```ts
// Remove one entry at a time, referencing the `id`
// that was used when added.
manager.remove('SomeStack');

// If we call `.remove()` on an `id` that does not exist,
// the result will simply be an empty array.
// > []

// Or, remove multiple entries at once.
manager.remove('Apple', 'Peach');

// The result will return an array of freshly removed ids.
// > ['Apple', 'Peach']
```

### Auto suspend `AudioContext`

`Earwurm` attempts to be efficient about managing `AudioContext` suspension by triggering a `suspend` if `.stop()` has been called on the `Earwurn` instance, or the `library` is empty _(`.remove()` has removed any remaining `Stack` instances)_.

Otherwise, the `Earwurm > AudioContext` will continue `running` once it has begun playing sounds.

> **Note:** There are instances where the browser/device can “interrupt” playback, causing `Earwurm` to emit an `interrupted` state change. Scenarios such as the device going to sleep, or receiving a phone call, invoke an “interruption”. This _should be_ functionally equivalent to the `suspended` state, and can be corrected by calling `.resume()`.

To free up some precious resources, you can automatically `suspend` the `AudioContext` after a period of no playback. This is made easy by subscribing to the `Earwurn > play` event.

```ts
const suspendAfterMs = 30000;
let suspendId = 0;

function autoSuspend() {
  manager.suspend();
  suspendId = 0;
}

manager.on('play', (active) => {
  clearTimeout(suspendId);
  suspendId = 0;

  if (active) return;

  suspendId = setTimeout(autoSuspend, suspendAfterMs);
});
```

The `suspend/resume` methods on the `AudioContext` are asynchronous. At the moment, `Earwurm` does not expose the `Promise` for each of these methods. It is possible that the need to “resume” could occur while the context is “suspending”. If this is a concern, you can try to get around it by also subscribing to the `Earwurn > state` event.

```ts
manager.on('state', (current) => {
  if (current === 'suspending' && suspendId) {
    clearTimeout(suspendId);
    suspendId = 0;

    // This is not guaranteed to work, as the `resume()` method
    // could early return depending on the internal state.
    manager.resume();
  }
});
```

You may also want to perform some action - such as suspending the `AudioContext`, or pausing all sounds - if the page is no longer visible. The `document > visibilitychange` does not quite give us a way to distinguish between the many ways a page changes “visibility”... but it might be the catch-all that suits your needs.

<!-- eslint-skip -->

```ts
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    manager.suspend();
  } else {
    manager.resume();
  }
});
```

A good use-case for the above is restoring playback on a mobile device that went to sleep.

```ts
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && manager.state === 'interrupted') {
    manager.resume();
  }
});
```

## Using sounds

Some more detailed examples for interacting with individual sounds.

### Interact with an available `Sound`

Now that we have added some audio files, let’s go ahead and play one.

```ts
const appleStack = manager.get('Apple');
const appleSound = await appleStack?.prepare();

// It is possible that we have asked for an `id` that
// does not exist, so we will guard against `undefined`.
if (appleSound) {
  appleSound.volume = 0.8;
  appleSound.play();
  // We only wanted this `Stack > Sound` to play once,
  // so we remove the entire `Stack` once it has ended.
  appleSound.on('ended', () => manager.remove('Apple'));
}

// Later on (after the sound has been removed), if we want
// to `play` it again, calling `.play()` will do nothing and
// simply return `undefined`.
const appleSoundDuration = appleSound?.duration ?? 0;
const durationBuffer = 100;

setTimeout(() => appleSound?.play(), appleSoundDuration + durationBuffer);
```

The creation of a sound is asynchronous, which means we need to wait for it to be “ready” before we can perform actions on it. There are two patterns for this:

```ts
// Await the sound assignment as it is being prepared.
const sound1 = await stack?.prepare();
if (sound1) sound1.play();

// Or, perform our action as a `.then()` callback.
const sound2 = stack?.prepare();
if (sound2) sound2.then((soundInstance) => soundInstance.play());
```

### Determining state values

A `Stack` instance will have a dedicated `playing` property to help identify if _atleast one contained `Sound`_ is actively “playing”.

Additionally, the `state` property is exposed which can give us a better idea of what the current state is.

If we want real time updates, we can subscribe to the `state` change event instead.

```ts
// Get a `true` or `false` value.
const isPlaying = stack.playing;

// Or get a string value for the current state.
const currentState = stack.state;

// eslint-disable-next-line no-console
stack.on('state', (currentState) => console.log(currentState));
```

Many of the same rules apply to a `Sound` instance.

```ts
let capturedState = sound.state;
let isPaused = capturedState === 'paused';

sound.on('state', (state) => {
  capturedState = state;
  isPaused = capturedState === 'paused';
});
```

## Sound behaviour

As discussed in the [Design document](./design.md), sounds within the `AudioContext` are “one-and-done”. A `Sound` is “destroyed” upon completion.

Depending on our needs, we can tailor the behaviour in several ways.

### Allowing sounds to overlap

Every time we make a call to `.prepare()`, we “create a new instance” of that `Sound` within the `Stack`. After calling `.play()`, that `Sound` then “expires” and is removed from the `Stack` upon completion _(or call to `.stop()`)_.

Depending on the `duration` of the `Sound`, rapid consecutive calls to `.prepare()` followed by `.play()` will create a “stack of sounds” that overlap. If this is our intention, then implemention is very simple.

This is referred to as the “Overlapping pattern”:

```tsx
function Example() {
  const overlapStack = manager.get('MyStack');

  async function handleOverlappingPlay() {
    if (!overlapStack) return;

    const sound = await overlapStack.prepare();
    const playedSound = sound.play();

    return playedSound;
  }

  return <Button onClick={handleOverlappingPlay}>Overlap</Button>;
}
```

### Restricting a `Sound` to a single instance

If we do not want consecutive plays of a `Sound` to overlap, we can restrict the `Stack` to allow only a single `Sound` in the `queue` at once. Simply checking for `stack.keys.length` will let us know how many sounds have been queued up.

In this example, we will avoid additional calls to `.prepare()` if the `queue` exceeds `1`. This is referred to as the “One-at-a-time pattern”:

```tsx
function Example() {
  const singleStack = manager.get('MyStack');

  // Each attempt to `play` will early return if there are
  // sounds in the `queue`, preventing overlapping sounds.
  async function handleSinglePlay() {
    if (!singleStack || singleStack.keys.length >= 1) return;

    const sound = await singleStack.prepare();
    const playedSound = sound.play();

    return playedSound;
  }

  return <Button onClick={handleSinglePlay}>Single</Button>;
}
```

It could be that there are sounds in the `queue` that were paused. We might decide to clear out any non-playing sounds whenever a new call to `.play()` is requested.

```tsx
async function handleSinglePlay() {
  if (!singleStack) return;

  const exceedsOne = singleStack.keys.length >= 1;

  if (exceedsOne && singleStack.playing) return;

  if (exceedsOne && !singleStack.playing) {
    singleStack.stop();
  }

  const sound = await singleStack.prepare();
  const playedSound = sound.play();

  return playedSound;
}
```

### Restarting a playing `Sound`

A variation of the “One-at-a-time pattern” is the “Restart pattern”. Here, we will check if the `Sound` is `playing`, and if `true`, simply “restart it” from the beginning:

```tsx
function Example() {
  const restartStack = manager.get('MyStack');

  // Each attempt to `play` (while already playing)
  // will stop then restart the `Sound`.
  async function handleRestartPlay() {
    if (!restartStack) return;

    // If we are treating this as a “single instance sound”,
    // then it is fine to call `.stop()` on an already "stopped" `Stack`.
    restartStack.stop();

    const sound = await restartStack.prepare();
    const playedSound = sound.play();

    return playedSound;
  }

  return <Button onClick={handleRestartPlay}>Restart</Button>;
}
```

### Restricting a specific `Sound` in the `Stack`

If we are re-using the same `Sound` in multiple places throughout the app, it could be beneficial to re-use the same variable reference.

Here is another example of the “One-at-a-time pattern”, but referrencing a specific variable:

```tsx
async function Example() {
  const stack = manager.get('MyStack');
  let sound = await stack?.prepare();

  sound?.on('ended', () => {
    // Upon completion of the `Sound`,
    // re-assign a new instance to the `sound` variable.
    // This will result in a new `id` for that `Sound`.
    sound = stack?.prepare();
  });

  function handleSoundPlay() {
    sound?.play();
  }

  return <Button onClick={handleSinglePlay}>Single</Button>;
}
```

### Managing a `Sound` queue

The problem with the “One-at-a-time” pattern is that it prevents adding a `Sound` to the `stack.queue` if `state` is `playing`. If the behaviour we _really want_ is to queue up a sound to play as soon as `state` is no longer `playing`, we can utilize the “Wait-your-turn pattern”:

The pattern works like so:

1. Listen for `queue` change event on the `Stack`.
2. Prepare a sound.
   - Remember, there is a limit to the number of sounds that can be queued within a `Stack`!
3. When the `queue` has changed:
   - Get the first sound in the `queue` and call `.play()`

<!-- eslint-skip -->

```tsx
const stack = manager.get('MyStack');

const handleQueueChange: StackEventMap['queue'] = (newKeys, _oldKeys) => {
  if (!stack || !stack.keys.length) return;

  const firstId = stack.keys[0];
  const firstSound = stack.get(firstId ?? '');

  // It is harmless to call `.play()` on a `Sound` that is already playing.
  firstSound?.play();
};

stack?.on('queue', handleQueueChange);

async function handleQueuedPlay() {
  if (!stack || stack.keys.length >= tokens.maxStackSize) return;

  const sound = await stack.prepare();

  // No real reason to return anything from this function...
  return sound;
}

return <Button onClick={handleQueuedPlay}>Queue and play</Button>;
```

This same pattern could be achieved using the `Sound > ended` event instead:

<!-- eslint-skip -->

```tsx
const stack = manager.get('MyStack');

const handleSoundEnded: SoundEventMap['ended'] = (event) => {
  if (!stack) return;

  // By the time this Sound has "ended", it should be
  // removed from it’s Stack queue.
  const firstId = stack.keys[0];
  const firstSound = stack.get(firstId ?? '');

  firstSound?.play();
};

async function handleQueuedPlay() {
  if (!stack || stack.keys.length >= tokens.maxStackSize) return;

  const sound = await stack.prepare();
  sound?.once('ended', handleSoundEnded);
}

return <Button onClick={handleQueuedPlay}>Queue and play</Button>;
```

### Stopping after an elapsed play time

```ts
const stack = manager.get('MyStack');
const sound = await stack?.prepare();

// We will store the result of calling `.play()` and `.stop()`,
// but we can also access the `sound?.state` property
// to know when a sound is actively `playing`.
let isPlaying = false;
let completion = '0%';

if (sound) {
  sound.play();

  isPlaying = sound.playing;

  sound.on('progress', ({elapsed, progress}) => {
    if (progress === 50) sound.stop();

    // This is a silly example of using `elapsed`. Realistically,
    // we would simply check if `progress >= 50`.
    const isHalfway = elapsed === Math.min(0, sound.duration / 2);

    // `progress` is returning a value between `0` and `100`.
    // Example: `elapsed / duration * 100`.
    completion = `${progress}%`;
  });

  sound.on('ended', ({id}) => {
    // eslint-disable-next-line no-console
    console.log(`Sound ${id} has been stopped at ${completion} completion`);
  });
}
```

### Looping audio

We can easily toggle a `Sound` to “loop indefinitely” by the `sound.loop` accessor.

```tsx
const stack = manager.get('MyStack');
const sound = await stack?.prepare();

let playCount = 0;

if (sound) {
  sound.loop = true;
  sound.play();

  // Retrieve the `iterations` count by listening to the `progress` event.
  sound?.on('progress', ({iterations}) => {
    playCount = iterations;

    // Keep in mind, `iterations` is only incremented at the start of a loop.
    if (iterations === 10) sound.stop();
  });
}
```

## Summary

Hopefully this document has provided enough examples to help you identify the capabilities of `Earwurm`. If you are anxious to start experimenting, please check out the included demo app within this repo!

If you end up experimenting with `Earwurm` and have a `CodeSandbox` to share, feel free to [open an issue](https://github.com/beefchimi/earwurm/issues) and post the link so other consumers can learn from it.
