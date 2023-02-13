import {createErrorMessage} from './mock-utils';

function internalMessage(methodName: string, ...args: unknown[]) {
  return createErrorMessage('AudioNode', methodName, ...args);
}

// We cannot import `MockBaseAudioContext` and instantiate it.
// Doing so would create a circular dependency that creates
// a recursive call between `MockAudioNode` and `MockBaseAudioContext`.
const typecastContext = {};

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
    destinationNode: unknown,
    output?: unknown,
    input?: unknown,
  ): AudioNode {
    // eslint-disable-next-line no-console
    console.log(internalMessage('connect', destinationNode, output, input));
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
    destinationNode?: unknown,
    output?: unknown,
    input?: unknown,
  ): void {
    // eslint-disable-next-line no-console
    console.log(internalMessage('disconnect', destinationNode, output, input));
  }
}
