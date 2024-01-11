# Earwurm

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

> `Earwurm` is a minimal-scope library for managing `webm` audio files using the [`Web Audio API`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).

The intention of this library is to help make it easier to add sound effects in user interfaces. `Earwurm` solves for _modern use-cases only_. The scope of this library is small. If you require more capabilities than what this library offers, it is recommended to use the `Web Audio API` directly _(alternatively, another library that offers the features you require)_.

## Important

Before beginning, it is critical to understand the following:

### File formats

Since `webm` _should be_ the most compact and broadly-supported format for playing audio on the web, it is the _only format_ to be supported by this library.

It is recommended to use the `opus` codec for any `webm` files used with `Earwurm`. However, `vorbis` _should work_ as well.

Technically, you can still provide `mp3`, `wav`, and other audio files to `Earwurm`. Just don't expect this library to make accommodations for those formats if problems arise.

For help on how to convert your audio files, [check out the provided docs](./docs/conversion.md).

### Web Audio

This library _only supports_ the `Web Audio API`. Interacting with `HTML5` audio elements is not supported. Long-playing audio files are not recommended as inputs for `Earwurm` _(example: full-length songs)_. This library expects to playback short-duration sound effects.

### Other sounds

`Earwurm` was built to control audio files only. Generating sounds using `Web Audio` _(and subsequently controlling them)_ is not supported by this library.

### Compatibility

This library was built for the web, and _cannot be used_ within a `node.js` project, or _(presumably)_ on a server.

### Network requests

At the moment, `Earwurm` expects your audio files to originate from the same domain. If you are attempting to load audio assets from a different domain, you may encounter cross-origin issues.

Each sound asset is obtained via a `fetch` request. It is possible to pass an optional [`options` object for the `Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request), but this can only be customized per-instance of `Earwurm`, and not for each individual asset. If asset’s require different `Request > options`, you may need to instantiate multiple instances of `Earwurm`.

If having more flexibility of network requests is a feature you would like to see... please get involved and help out!

## Getting started

Follow these steps to get up and running with `Earwurm`.

**Installing the dependency:**

```sh
# Using NPM
npm install earwurm

# Using Yarn
yarn add earwurm

# Using PNPM
pnpm add earwurm
```

**Initializing a global instance:**

```ts
import {Earwurm, type ManagerConfig} from 'earwurm';

// Optionally configure some global settings.
const customConfig: ManagerConfig = {
  transitions: true,
  request: {},
};

// Initialize the global audio manager.
const manager = new Earwurm(customConfig);
```

### Documentation

Please see the following links for more insight into using `Earwurm`:

- [API](./docs/api.md)
- [Design](./docs/design.md)
- [Examples](./docs/examples.md)
- [Converting audio](./docs/conversion.md)
- [Resources](./docs/resources.md)
- [Roadmap](./docs/roadmap.md)
