# API

> For a better understanding of the `Earwurm` API, it is recommended to review the `TypeScript` typing.

The below API outline should help illustrate what is possible with `Earwurm`.

## Manager API

Capabilities of the `Earwurm` “audio manager”.

**Initialization:**

```ts
// Create a new instance, optionally passing
// a configuration object.
const manager = new Earwurm(config?: ManagerConfig);
```

**Methods:**

```ts
// Get an individual `Stack` within this instance.
// Will return `undefined` if that `Stack` does not exist.
manager.get('StackId');

// Check if an individual `Stack > id` is contained within this instance.
manager.has('StackId');

// Manually unlock the browser’s “autoplay ability” for this instance.
// Without this, you cannot call `.play()` on any sound that does
// not trigger as a result of a user action (click, touch, etc).
manager.unlock();

// Add entries to this instance. Redundant `id` values will
// overwrite any previously added `Stack` with the same `id`.
manager.add({id: 'One', path: 'path/to/one.webm'}, ...moreEntries);

// Remove entries from this instance, referenced by `Stack > id`.
manager.remove('EntryId', ...moreEntryIds);

// Stop and destory all sounds within each `Stack`.
// Each `Stack` will remain available in the library
// to continue interacting with.
manager.stop();

// Will destroy and remove each `Stack` within this instance.
// Will `close` the `AudioContext`, effectively marking it as
// “discarded” for the browser to direct resources away from.
// Once you have performed this action, you will not be able to
// use this `Earwurm` instance again. If you later want to play
// more audio, it is recommended to either re-assign the
// existing `manager` with a `new Earwurm()`, or simply create
// a new variable to hold this new instance.
manager.teardown();
```

**Setters:**

```ts
// Set the “master volume” on this instance.
// While each `Stack` and `Sound` have their own `volume`,
// the `manager.volume` can be used to adjust the final output
// volume all at once. Doing so will NOT affect any individual
// `Stack/Sound > volume` properties.
manager.volume = 1;

// Mute or unmute the final output for this instance. Does NOT
// affect any individual `Stack/Sound > mute` properties.
manager.mute = true || false;
```

**Getters:**

```ts
// Get the “master volume” for this instance.
manager.volume;

// Get the “master mute” state for this instance.
manager.mute;

// Check if the browser’s “autoplay ability” has been
// “unlocked” for this instance.
manager.unlocked;

// Get all `Stack` ids contained within this instance.
manager.keys;

// Get the current `AudioContext.state` value. Additionally
// includes values for 'suspending' and 'interrupted'.
manager.state;

// Get a `boolean` for whether or not any `Stack > Sound`
// within this instance is actively “playing”.
manager.playing;

// Get an array of all the events for this instance
// that currently have listeners attached.
manager.activeEvents;
```

**Events:**

```ts

// Event called whenever `AudioContext > statechange` is triggered.
// Returns the current `AudioContext > state`. This may trigger
// immediately upon `new Earwurm()` if the `AudioContext` is
// “unlocked” right away.
(event: ManagerEventMap['statechange'], listener: (state?: ManagerState) => void)

// Event called whenever an error is occured on the `AudioContext`.
// This could be a result of: failed to resume, failed to close.
(event: ManagerEventMap['error'], listener: (message?: CombinedErrorMessage) => void)
```

**Static members:**

```ts
// Retrieve the maximum `number` of sounds allowed to
// be contained within a `Stack` at once.
Earwurm.maxStackSize;

// Retrieve the total time (in milliseconds) that needs
// to pass before the auto-suspension kicks in.
Earwurm.suspendAfterMs;
```

## Stack API

Capabilities of an indivudual `Earwurm > Stack`.

**Initialization:**

```ts
// Retrieve the `Stack` by `id` from the `Earwurm` instance.
// Will return `undefined` if no `Stack` is found.
const soundStack = manager.get('ExistingStack');

// Alternatively, if you are using `Stack` outside of `Earwurm`,
// you can manually create your own `Stack` instance.
const customStack = new Stack(id, path, context, destination, optionalConfig);
```

**Methods:**

```ts
// Get an individual `Sound` within this `Stack`.
// Will return `undefined` if that `Sound` does not exist.
soundStack.get('SoundId');

// Check if an individual `Sound > id` is contained within the `Stack`.
soundStack.has('SoundId');

// Create a new `Sound` within this `Stack`. The new `Sound`
// will be added to the `queue` and it’s `state` will be set
// to `created`. Accepts an optional `id`. Otherwise, `id` is auto
// assigned by combining the `id` passed to `new Stack()` with
// the total number of sounds created during this stack’s life.
// Will return a `Promise` which resolves to the`Sound` instance.
// You can either chain with `.then()`, or `await` and call
// `.play()` once the `Promise` has resolved.
soundStack.prepare(id?: string);

// Pause all sounds within the `Stack`. Each `Sound` is
// paused at it’s respective `elapsed` time.
soundStack.pause();

// Stop (and destroy) all sounds within the `Stack`.
soundStack.stop();

// Same as `.stop()` but additionally resets many
// internals, effectively marking the `Stack` as
// discarded. It is expected to never reuse a
// `Stack` that has been torn down.
soundStack.teardown();
```

**Setters:**

```ts
// Set the “stack volume” on this instance.
// While each `Sound` has it’s own `volume`, the
// `stack.volume` can be used as a “volume gate” for
// all sounds travelling through this `Stack` instance.
// Adjusting this will NOT affect any individual
// `Sound > volume` properties.
soundStack.volume = 1;

// Mute or unmute the output for this `Stack`. Does NOT
// affect any individual `Sound > mute` properties.
soundStack.mute = true || false;
```

**Getters:**

```ts
// Get the `id` provided to `new Stack()`.
soundStack.id;

// Get the `path` provided to `new Stack()`.
soundStack.path;

// Get the current `volume` for this `Stack`.
soundStack.volume;

// Get a `boolean` for whether or not this `Stack` is “mute”.
soundStack.mute;

// Get all `Sound` ids contained within this instance.
soundStack.keys;

// Get the current `state` value for this instance.
soundStack.state;

// Get a `boolean` for whether or not any `Sound`
// within this instance is actively “playing”.
soundStack.playing;

// Get an array of all the events for this instance
// that currently have listeners attached.
soundStack.activeEvents;
```

**Events:**

```ts
// Event called as a consequence of any `Sound > state` change within
// the `Stack`. As sounds cycle through their various states, the
// `Stack` will determine if any `Sound` is currently `playing`.
// Possible `StackState` values are: `idle`, `loading`, `playing`.
(event: StackEventMap['statechange'], listener: (state?: StackState) => void)

// Event called whenever an error is occured on the `Stack`.
// This could be a result of: failed to load the `path`.
(event: StackEventMap['error'], listener: ({id, message}?: StackError) => void)
```

**Static members:**

```ts
// Retrieve the maximum `number` of sounds allowed to
// be contained within a `Stack` at once. This is
// identical to what can also be read from `Earwurm`.
Stack.maxStackSize;
```

## Sound API

Capabilities of an individual `Earwurm > Stack > Sound`.

**Initialization:**

```ts
// Retrieve the `Sound` by `id` from the `Stack` instance.
// Will return `undefined` if no `Sound` is found.
const soundStack = manager.get('ExistingStack');
const sound = soundStack.get('ExistingSound');

// Alternatively, if you are using `Sound` outside of `Earwurm`,
// you can manually create your own `Sound` instance.
const customSound = new Sound(id, buffer, context, destination, optionalConfig);
```

**Methods:**

```ts
// Start playing the `Sound`. Will “resume” from the
// current `elapsed` time (default is `0`).
sound.play();

// Pause the `Sound` at it’s current `elapsed` time.
sound.pause();

// Stop and destroy this `Sound`. Will remove any
// registered event listeners. Once destroyed, the
// `Sound` is automatically discarded from within a
// `Stack`. Can be destroyed by calling `.stop()`
// even if it has never started “playing”.
sound.stop();
```

**Setters:**

```ts
// Set the volume for this `Sound`.
sound.volume = 1;

// Mute / unmute this `Sound`.
sound.mute = true || false;

// Toggle the “repetition” of the `Sound`. Will
// repeat indefinitely if `true`, preventing the
// `ended` event from firing.
sound.loop = true || false;
```

**Getters:**

```ts
// Get the current `volume` for this `Sound`.
sound.volume;

// Get a `boolean` for whether or not this `Sound` is “mute”.
sound.mute;

// Get a `boolean` for whether or not this `Sound` is
// to repeat indefinitely.
sound.loop;

// Get the “total play time” for this `Sound`.
sound.duration;

// Get the current `state` for this `Sound`. Can be:
// `created`, `playing`, `paused`, or `stopping`.
sound.duration;
```

**Events:**

```ts
// Event called whenever `Sound > state` is changed.
// Possible `SoundState` values are:
// `created`, `playing`, `paused`, and `stopping`.
(event: SoundEventMap['statechange'], listener: (state?: SoundState) => void)

// Event called on the audio `source` node whenenver
// a `Sound` reaches either it’s “end duration”,
// or has been stopped / removed from the `Stack`.
// This will NOT get called each time a “loop” repeats.
(event: SoundEventMap['ended'], listener: ({id, source}?: SoundEndedEvent) => void)
```

## Events API

All 3 components of `Earwurm` _(`manager`, `stack` and `sound`)_ each have “event emitter” capabilities.

**Methods:**

```ts
// `component` could be an `Earwurm`, `Stack`, or `Sound`.
// Each have their own set of available `events`, as well
// as a corresponding `listener` signature.
const component = new Earwurm();

// Register an event listener for a specified event.
component.on(event, listener: (value?) => void);

// Remove any previously registered event listener.
component.off(event, listener: (value?) => void);

// Register an event listener that will remove itself
// after only a single execution.
component.once(event, listener: (value?) => void);

// Register an event listener that will return the
// corresponding `.off()` function, allowing for
// easier removal of anonymous functions.
const registered = component.disposable(event, listener: (value?) => void);
```
