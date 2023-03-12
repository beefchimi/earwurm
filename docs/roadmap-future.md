# Future API additions

In the future, _it is possible_ that we will see some additional features added to `Earwurm`.

## Stack

```ts
///
/// Getters

// Get a `boolean` value for whether or not the audio asset
// has been successfully fetched and cached by the browser.
soundStack.cached;

///
/// Events

// Capture the moment the audio asset fetch request changes
// from `false` to `true`. Will noever fire if an `error`
// occurs, or if the asset is already cached on initialization.
soundStack.onCache((cached: true) => void);

// Capture the `error` thrown from the audio asset request,
// or the subsequent decoding of that response data.
soundStack.onError((error: unknown) => void);
```

## Sound

```ts
///
/// Methods

// Set the `elapsed` time for this `Sound`.
// Will be “clamped” so that the provided `elapsed` value
// cannot be less than `0` or greater than `duration`.
sound.seek(1000);

// Capture a segment of audio from this `Sound`.
// Will return a new `Sound` restricted to that “range”.
const segment = sound.range(1000, 2000);
segment.play();

///
/// Setters

// Toggle the “play direction” of the `Sound`.
// Will play in “reverse” if `true`.
// Toggling will not affect `playing` state.
sound.reverse = true || false;

///
/// Getters

// Get a `boolean` for whether or not this `Sound` is
// fully loaded and held in memory by the browser. A
// previously loaded `Sound` could later be “forgotten”
// by the browser as a way to free-up memory.
sound.loaded;

// Get the “current play time” for this `Sound`.
sound.elapsed;

// Get a `boolean` for whether or not this `Sound` is
// to be played in the “reverse” direction.
sound.reverse;

// If this `Sound` was extracted using `.range()`,
// `sprite` will reference the `id` of the `Sound`
// that it was derived from. Otherwise `undefined`.
sound.sprite;

///
/// Events

// Event called whenever `.play()` is triggered.
sound.onPlay(() => void);

// Event called whenever `.pause()` is triggered.
sound.onPause(() => void);

// Event called whenever `.stop()` is triggered.
sound.onStop(() => void);

// Event called each time a “loop” restarts.
sound.onLoop(() => void);

// Event called whenever `elapsed` changes while
// the `Sound` is `playing`.
sound.onProgress(({elapsed, progress}) => void);

// Event called whenever there is an `Error` thrown
// from the `Sound`.
sound.onError((error) => void);
```

## Concerns

- `Sound > stop()`: It is possible we will have to wait before calling `.empty()`.
  - If we find that the `Sound` is not getting removed from the `Stack`, perhaps it is because `.empty()` is called before the `listener` has run.
- Is having `context` and `destination` set to `readonly` allowing consumer's to hijack the inidivual properties attached to the `AudioContext` and `AudioNode`?
  - If so, we will need to switch these to being private.
- What happens when I try to call `.play()` on an already destroyed `Sound`?
  - Is that variable now `undefined`?
  - Do I need to add a early return within the `.play()` method?
