# Future examples

This document simply sets aside some code examples that serve as an expectation for a future implementation.

**Stopping after an elapsed play time:**

```ts
const bananaStack = manager.get('Banana');
const bananaSound = await bananaStack.prepare();

// We will store the result of calling `.play()` and `.stop()`,
// but you can also access the `bananaSound?.state` property
// to know when a sound is actively `playing`.
let isPlaying = false;
let completion = '0%';

if (bananaSound) {
  bananaSound.play();

  isPlaying = bananaSound.playing;

  bananaSound.on('progress', ({elapsed, progress}) => {
    if (progress === 50) bananaSound.stop();

    // This is a silly example of using `elapsed`. Realistically,
    // you would simply check if `progress >= 50`.
    const isHalfway = elapsed === Math.min(0, bananaSound.duration / 2);

    // `progress` is returning a value between `0` and `100`.
    // Example: `elapsed / duration * 100`.
    completion = `${progress}%`;
  });

  bananaSound.on('ended', () => {
    console.log(`Audio is ${completion} completed`);
  });
}
```

**Looping audio:**

We can easily toggle a `Sound` to “loop indefinitely” by the `sound.loop` accessor.

```tsx
const appleStack = manager.get('Apple');
const appleSound = await appleStack?.prepare();

let playCount = 0;
appleSound.loop = true;

// Increment `playCount` by `1` each time a loop is completed.
appleSound?.on('loop', () => playCount++);
```

**Restarting a playing `Sound`:**

However, it is worth remembering that each call to `.play()` creates a new instance of a `Sound`. If doing so is a problem, and you need to reference / re-use an existing sound, you can alternatively call `.seek()` on the actively playing sound.

```tsx
const restartStack = manager.get('MySound');
let sound = restartStack.prepare();

async function handleRestartPlay() {
  // Early return if the `Promise` has not resolved.
  if (!sound?.id) return;

  // Simply call `.play()` if the sound has
  // never been played yet.
  if (sound.state === 'created') {
    return sound.play();
  }

  // Check if the `Sound` is `playing`, and if so,
  // return the “play position” back to the beginning.
  if (sound.playing) {
    return sound.seek(0);
  }

  // Otherwise, we need to re-create the sound
  // and play it once ready.
  sound = restartStack.prepare();
  const restarted = await sound.play();
  return restarted;
}

return <Button onClick={handleRestartPlay}>Restart</Button>;
```

**Managing a `Sound` queue:**

The problem with the “One-at-a-time” pattern is that it prevents adding a `Sound` to the `stack.queue` if `state` is `playing`. If the behaviour you _really want_ is to queue up a sound to play as soon as `state` is no longer `playing`, you can utilize the “Wait-your-turn pattern”:

```tsx
// 1. Listen for `queuechange` on the `stack`.
//    - Need to `emit` a new event that returns an array of `keys`.
// 2. Prepare a sound.
//    - Prevent adding more sounds if `keys.length` exceeds `max`.
// 3. When the `queue` has changed:
//    - Get the first sound in the `queue` and call `.play()`

const stack = manager.get('MySound');

function handleQueueChange(keys: SoundId[]) {
  if (!stack || !stack.keys.length) return;

  const firstId = stack.keys[0];
  const firstSound = stack.get(firstId);

  firstSound.play();
}

stack?.on('queuechange', (keys) => handleQueueChange(keys));

async function handleQueuedPlay() {
  if (!stack || stack.keys.length >= tokens.maxStackSize) return;

  const sound = await stack.prepare();
  return sound;
}

return <Button onClick={handleQueuedPlay}>Queue and play</Button>;
```

**Using audio sprites:**

With each individual audio file comes an individual network request.

Depending on the scope of sound effects you are using, it might be wise to use a “sprite”. This is a technique of spacing out individual sound effects within a single file, allowing you to condense multiple small requests into one large request.

> It is up to you to determine where and when to use an audio sprite, as there are many factors to consider.

```tsx
// Capture each sound embedded within the sprite by
// targeting each sound’s start/end time. This will
// require you to know the exact timestamp of each sound.
const beepSound = manager.get('Sprite')?.range(0, 900);
const oinkSound = manager.get('Sprite')?.range(1000, 2200);
const woofSound = manager.get('Sprite')?.range(2300, 3000);
```
