# Converting audio

This documentation will NOT describe how to record audio and export it from any editing software.

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

**Here is a breakdown of the command:**

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
