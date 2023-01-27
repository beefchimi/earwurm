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

### Converting audio

This documentation will not describe authoring audio and exporting it from any editing software.

Quite simply, if you have existing audio files that are not already in `webm` format, you can convert them using a command-line tool called [`ffmpeg`](https://ffmpeg.org/). You can learn some audio-specific commands from the [`ffmpeg` documentation](https://ffmpeg.org/ffmpeg.html#Audio-Options).

Using `ffmpeg`, you can select an audio file as an “input source”, pass some options that tell `ffmpeg` how you want to transform the audio, and point to an “output source” to save the converted asset.

**Good defaults for web audio:**

The following command will take a `wav` asset and convert it to `webm`:

```sh
# Navigate to the directory with your audio assets:
cd to/directory/that/has/audio-assets

# Convert a single audio file:
ffmpeg -i input-file.wav -dash 1 -map_metadata -1 -acodec libopus -ar 48000 -ac 2 -ab 96k -f webm output-file.webm
```

Here is a breakdown of the command:

- `ffmpeg`: Call the `ffmpeg` function.
- `-i {input-file.ext}`: Select a file as input.
- `-dash 1`: Create a WebM file conforming to WebM DASH specification _(may not be necessary for more use-cases)_.
- `-map_metadata -1`: Strip out metadata, resulting in a smaller file size.
- `-acodec libopus`: Use the `opus` codec.
- `-ar 48000`: Set the audio frequency. `48000hz` might be the minimum for `libopus` _(could throw an error at a lower value)_.
- `-ac 2`: Set the number of audio channels (mono = 1, stereo = 2).
- `-ab 96k`: Set the bitrate. `96k` for 2-channel `stereo` sound is probably good, but `128k` might be preferrable.
- `-f webm`: Specifiy the output format.
- `{output-file.ext}`: End with the file name _(including extension)_ you wish to save.

### Web Audio

This library _only supports_ the `Web Audio API`. Interacting with `HTML5` audio elements is not supported. Long-playing audio files are not recommended as inputs for `Earwurm` _(example: full-length songs)_. This library expects to playback short-duration sound effects.

### Other sounds

`Earwurm` was built to control audio files only. Generating sounds using `Web Audio` _(and subsequently controlling them)_ is not supported by this library.

### Compatibility

This library was built for the web, and _cannot be used_ within a `node.js` project.

### Network requests

At the moment, `Earwurm` expects your audio files to originate from the same domain. If you are attempting to load audio assets from a different domain, you may encounter cross-origin issues.

Each sound asset is obtained via a `fetch` request. It is possible to pass an optional [`options` object for the `Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request), but this can only be customized per-instance of `Earwurm`, and not for each individual asset. If asset’s require different `Request > options`, you may need to instantiate multiple instances of `Earwurm`.

## Getting started

Follow these steps to get up and running with `Earwurm`.

**Installing the dependency:**

```sh
# Using NPM
npm install earwurm

# Using Yarn
yarn add earwurm
```

**Initializing a global instance:**

```ts
import {Earwurm} from 'earwurm';
import type {ManagerConfig} from 'earwurm';

// Optionally configure some global settings.
const customConfig: ManagerConfig = {
  fadeMs: 200,
  request: {},
};

// Initialize the global audio controller.
const controller = new Earwurm(customConfig);
```

### Documentation

Please see the following links for more insight into using `Earwurm`:

- [API](./docs/api.md)
- [Design](./docs/design.md)
- [Examples](./docs/examples.md)
- [Resources](./docs/resources.md)
- [Roadmap](./docs/roadmap.md)
