# Future examples

This document simply sets aside some code examples that serve as an expectation for a future implementation.

**Restarting a playing `Sound`:**

It is worth remembering that each call to `.play()` creates a new instance of a `Sound`. If doing so is a problem, and you need to reference / re-use an existing sound, you can alternatively call `.seek()` on the actively playing sound.

```tsx
const restartStack = manager.get('MySound');
let sound = await restartStack.prepare();

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
  sound = await restartStack.prepare();
  const restarted = sound.play();
  return restarted;
}

return <Button onClick={handleRestartPlay}>Restart</Button>;
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
