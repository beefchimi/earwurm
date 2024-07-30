import {MockAudioNode} from './MockAudioNode';

export class MockAudioDestinationNode extends MockAudioNode implements AudioDestinationNode {
  readonly maxChannelCount = 2;
}
