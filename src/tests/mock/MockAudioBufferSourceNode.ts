import {MockAudioScheduledSourceNode} from './MockAudioScheduledSourceNode';
import {MockAudioParam} from './MockAudioParam';

export class MockAudioBufferSourceNode
  extends MockAudioScheduledSourceNode
  implements AudioBufferSourceNode
{
  buffer: AudioBuffer | null;
  loop: boolean;
  loopEnd: number;
  loopStart: number;

  readonly detune: AudioParam;
  readonly playbackRate: AudioParam;

  constructor(
    readonly context: BaseAudioContext,
    options?: AudioBufferSourceOptions,
  ) {
    super();

    this.buffer = options?.buffer ?? null;
    this.loop = options?.loop ?? false;
    this.loopEnd = options?.loopEnd ?? 0;
    this.loopStart = options?.loopStart ?? 0;

    // Not sure if `option` values need to be passed.
    this.detune = new MockAudioParam();
    this.playbackRate = new MockAudioParam();
  }
}
