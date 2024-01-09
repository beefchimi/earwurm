import {createErrorMessage} from './mock-utils';

function internalMessage(methodName: string, ...args: unknown[]) {
  return createErrorMessage('AudioBuffer', methodName, ...args);
}

export class MockAudioBuffer implements AudioBuffer {
  readonly duration = 0;

  readonly length: number;
  readonly numberOfChannels: number;
  readonly sampleRate: number;

  // channelCountMode
  // channelCountMode
  // channelInterpretation

  constructor(options: AudioBufferOptions) {
    this.length = options.length;
    this.numberOfChannels = options.numberOfChannels ?? 2;
    this.sampleRate = options.sampleRate;
  }

  copyFromChannel(
    destination: Float32Array,
    channelNumber: number,
    bufferOffset?: number | undefined,
  ): void {
    throw new Error(
      internalMessage(
        'copyFromChannel',
        destination,
        channelNumber,
        bufferOffset,
      ),
    );
  }

  copyToChannel(
    source: Float32Array,
    channelNumber: number,
    bufferOffset?: number | undefined,
  ): void {
    throw new Error(
      internalMessage('copyToChannel', source, channelNumber, bufferOffset),
    );
  }

  getChannelData(channel: number): Float32Array {
    throw new Error(internalMessage('getChannelData', channel));
  }
}
