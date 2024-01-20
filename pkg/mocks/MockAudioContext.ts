import {createErrorMessage} from './mock-utils';
import {MockBaseAudioContext} from './MockBaseAudioContext';

function internalMessage(methodName: string, ...args: unknown[]) {
  return createErrorMessage('AudioContext', methodName, ...args);
}

export class MockAudioContext
  extends MockBaseAudioContext
  implements AudioContext
{
  latencyHint: AudioContextOptions['latencyHint'];
  readonly baseLatency = 0;
  readonly outputLatency = 0.0123;

  constructor(options?: AudioContextOptions) {
    super();
    this.latencyHint = options?.latencyHint ?? 'interactive';
    this.sampleRate = options?.sampleRate ?? 44100;
  }

  createMediaElementSource(
    mediaElement: HTMLMediaElement,
  ): MediaElementAudioSourceNode {
    throw new Error(internalMessage('createMediaElementSource', mediaElement));
  }

  createMediaStreamDestination(): MediaStreamAudioDestinationNode {
    throw new Error(internalMessage('createMediaStreamDestination'));
  }

  createMediaStreamSource(
    mediaStream: MediaStream,
  ): MediaStreamAudioSourceNode {
    throw new Error(internalMessage('createMediaStreamSource', mediaStream));
  }

  getOutputTimestamp(): AudioTimestamp {
    throw new Error(internalMessage('getOutputTimestamp'));
  }

  async close(): Promise<void> {
    // Setting + dispatching state outside of the
    // Promise to avoid complicated async testing.
    this.state = 'closed';
    this.dispatchEvent(new Event('statechange'));

    await new Promise((resolve) => {
      resolve(() => {});
    });
  }

  async resume(): Promise<void> {
    // Setting + dispatching state outside of the
    // Promise to avoid complicated async testing.
    this.state = 'running';
    this.dispatchEvent(new Event('statechange'));

    await new Promise((resolve) => {
      resolve(() => {});
    });
  }

  async suspend(): Promise<void> {
    // Setting + dispatching state outside of the
    // Promise to avoid complicated async testing.
    this.state = 'suspended';
    this.dispatchEvent(new Event('statechange'));

    await new Promise((resolve) => {
      resolve(() => {});
    });
  }
}
