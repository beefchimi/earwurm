import {MockAudioScheduledSourceNode} from './MockAudioScheduledSourceNode';
import {MockAudioParam} from './MockAudioParam';

const mockParam = new MockAudioParam();

export class MockAudioBufferSourceNode
  extends MockAudioScheduledSourceNode
  implements AudioBufferSourceNode {
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

    // Not sure if `option` values need to be passed...
    // if so, we might need to make each instance unique.
    this.detune = mockParam;
    this.playbackRate = mockParam;
  }
}
