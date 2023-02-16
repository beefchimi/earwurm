// We cannot import `MockBaseAudioContext` and instantiate it.
// Doing so would create a circular dependency that creates
// a recursive call between `MockAudioNode` and `MockBaseAudioContext`.
const typecastContext = {};

/*
import {createErrorMessage} from './mock-utils';

function internalMessage(methodName: string, ...args: unknown[]) {
  return createErrorMessage('AudioNode', methodName, ...args);
}
*/

export class MockAudioNode extends EventTarget implements AudioNode {
  channelCount = 2;
  channelCountMode: ChannelCountMode = 'explicit';
  channelInterpretation: ChannelInterpretation = 'speakers';

  readonly context: BaseAudioContext = typecastContext as BaseAudioContext;
  readonly numberOfInputs: number;
  readonly numberOfOutputs: number;

  constructor() {
    super();
    this.numberOfInputs = 1;
    this.numberOfOutputs = 0;
  }

  connect(
    destinationNode: AudioNode,
    output?: number | undefined,
    input?: number | undefined,
  ): AudioNode;
  connect(destinationParam: AudioParam, output?: number | undefined): void;
  connect(
    _destinationNode: unknown,
    _output?: unknown,
    _input?: unknown,
  ): AudioNode {
    return this;
  }

  disconnect(): void;
  disconnect(output: number): void;
  disconnect(destinationNode: AudioNode): void;
  disconnect(destinationNode: AudioNode, output: number): void;
  disconnect(destinationNode: AudioNode, output: number, input: number): void;
  disconnect(destinationParam: AudioParam): void;
  disconnect(destinationParam: AudioParam, output: number): void;
  disconnect(
    _destinationNode?: unknown,
    _output?: unknown,
    _input?: unknown,
  ): void {}
}
