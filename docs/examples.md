# Examples

> Eventually, we hope to offer CodeSandbox examples that you can interact with.

The following examples should help demonstrate _most of the_ common use cases for `Earwurm`.

## Getting started

**Initialization:**

In order to start making noise, we need to have a `Earwurm` instance to work with.

```ts
const manager = new Earwurm();
manager.add({id: 'MySound', path: 'path/to/my/sound.webm'});

const stack = manager.get('MySound');
```

**Enabling autoplay:**

Most browsers will intentionally block audio from playing automatically. The user should not be caught off guard with unwanted noise… annoying advertisements be damned! Any media should be explicitly initialized by the user.

With that said, sometimes you just _need to autoplay audio_. In that case, you likely need to “unlock” the ability to play audio.

```ts
// Check if the browser has allowed audio to be played.
// If not, manually unlock it.
if (!manager.unlocked) {
  // No audio from this context has been played yet,
  // so we will unlock it.
  manager.unlock();
}

// Now that we are “unlocked”, the `unlocked` property
// should be `true`, and we can play a `Sound` without
// it being trigger by a user interaction.
if (manager.unlocked) stack.play();
```

**Adding entries:**

You can add as few as `1` new `Stack` at a time.

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

**Removing entries:**

Similarly, we can remove entries that we have already added:

```ts
// Remove one entry at a time, referencing the `id`
// that was used when added.
manager.remove('Some-Source');

// If you call `.remove()` on an `id` that does not exist,
// the result will simply be an empty array.
// > []

// Or, remove multiple entries at once.
manager.remove('Apple', 'Peach');

// The result will return an array of freshly removed ids.
// > ['Apple', 'Peach']
```

## Using sounds

**Interact with an available `Sound`:**

Now that we have added some audio files, let’s go ahead and play one.

```ts
const appleStack = manager.get('Apple');
const appleSound = await appleStack?.prepare();

// It is possible that we have asked for an `id` that
// does not exist, so we will guard against `undefined`.
if (appleSound) {
  appleSound.volume(0.8);
  appleSound.play();
  // We only wanted this sound to play once,
  // so go ahead and remove it after it has ended.
  appleSound.on('ended', () => manager.remove('Apple'));
}

// Later on (after the sound has been removed), if we want
// to `play` it again, calling `.play()` will do nothing and
// simply return `undefined`.
const appleSoundDuration = appleSound?.duration ?? 0;
const durationBuffer = 100;

setTimeout(() => appleSound?.play(), appleSoundDuration + durationBuffer);
```

**Determining state values:**

While there is a dedicated `playing` property, you can obtain a more granular `state` by listening for the `statechange` event and checking the `state` property directly.

```ts
let capturedState = sound.state;
let isPaused = capturedState === 'paused';

sound.on('statechange', (state) => {
  capturedState = sound.state;
  isPaused = capturedState === 'paused';
});
```

## Sound behaviour

As discussed in the `Design` document, sounds within the `AudioContext` are “one-and-done”. A `Sound` is “destroyed” upon completion.

Depending on your needs, you can tailor the behaviour in several ways.

**Allowing sounds to overlap:**

Every time you make a call to `.prepare()`, you “create a new instance” of that `Sound` within the `Stack`. After calling `.play()`, that `Sound` then “expires” and is removed from the `Stack` upon completion _(or call to `.stop()`)_.

Depending on the `duration` of the `Sound`, rapid consecutive calls to `.prepare()` followed by `.play()` will create a “stack of sounds” that overlap. If this is your intention, then implemention is very simple.

This is referred to as the “Overlapping pattern”:

```tsx
const overlapStack = manager.get('MySound');

async function handleOverlappingPlay() {
  if (!overlapStack) return;

  const sound = overlapStack.prepare();
  const playedSound = await sound.play();

  return playedSound;
}

return <Button onClick={handleOverlappingPlay}>Overlap</Button>;
```

**Restricting a `Sound` to a single instance:**

If you do not want consecutive plays of a `Sound` to overlap, you can restrict the `Stack` to allow only a single `Sound` in the `queue` at once. Simply checking for `stack.keys.length` will let you know how many sounds have been queued up.

In this example, we will avoid additional calls to `.prepare()` if the `queue` exceeds `1`. This is refferd to as the “One-at-a-time pattern”:

```tsx
const singleStack = manager.get('MySound');

// Each attempt to `play` will early return if there are
// sounds in the `queue`, preventing overlapping sounds.
async function handleSinglePlay() {
  if (!singleStack || singleStack.keys.length >= 1) return;

  const sound = singleStack.prepare();
  const playedSound = await sound.play();

  return playedSound;
}

return <Button onClick={handleSinglePlay}>Single</Button>;
```

It could be that there are sounds in the `queue` that were paused. You might decide to clear out any non-playing sounds whenever a new call to `.play()` is requested.

```tsx
async function handleSinglePlay() {
  if (!singleStack) return;

  const exceedsOne = singleStack.keys.length >= 1;

  if (exceedsOne && singleStack.playing) return;

  if (exceedsOne && !singleStack.playing) {
    singleStack.stop();
  }

  const sound = singleStack.prepare();
  const playedSound = await sound.play();

  return playedSound;
}
```

**Restarting a playing `Sound`:**

A variation of the “One-at-a-time pattern” is the “Restart pattern”. Here, we will check if the `Sound` is `playing`, and if `true`, simply “restart it” from the beginning:

```tsx
const restartStack = manager.get('MySound');

// Each attempt to `play` (while already playing)
// will stop then restart the `Sound`.
function handleRestartPlay() {
  if (!restartStack) return;
  // If you are treating this as a “single instance sound”,
  // then it is fine to call `.stop()` on an already "stopped" `Stack`.
  restartStack.stop();

  const sound = restartStack.prepare();
  const playedSound = await sound.play();

  return playedSound;
}

return <Button onClick={handleRestartPlay}>Restart</Button>;
```

**Restricting a specific `Sound` in the `Stack`:**

If you are re-using the same `Sound` in multiple places throughout the app, it could be beneficial to re-use the same variable reference.

Here is another example of the “One-at-a-time pattern”, but referrencing a specific variable:

```tsx
const stack = manager.get('MySound');
let sound = await stack?.prepare();

sound?.on('ended', () => {
  // Upon completion of the `Sound`,
  // re-assign a new instance to the `sound` variable.
  // This will result in a new `id` for that `Sound`.
  sound = stack?.prepare();
});

function handleSoundPlay() {
  if (!sound?.playing) single.play();
}

return <Button onClick={handleSinglePlay}>Single</Button>;
```
