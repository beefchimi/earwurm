import {MockAudioNode} from './MockAudioNode';
import {MockAudioParam} from './MockAudioParam';

export class MockGainNode extends MockAudioNode implements GainNode {
  readonly gain = new MockAudioParam();

  constructor(readonly context: BaseAudioContext, options?: GainOptions) {
    super();

    this.channelCount = options?.channelCount ?? 2;
    this.channelCountMode = options?.channelCountMode ?? 'explicit';
    this.channelInterpretation = options?.channelInterpretation ?? 'speakers';
  }
}
