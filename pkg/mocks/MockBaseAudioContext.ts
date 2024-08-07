import {createErrorMessage} from './mock-utils';
import {MockAudioBuffer} from './MockAudioBuffer';
import {MockAudioBufferSourceNode} from './MockAudioBufferSourceNode';
import {MockAudioDestinationNode} from './MockAudioDestinationNode';
import {MockAudioListener} from './MockAudioListener';
import {MockAudioWorklet} from './MockAudioWorklet';
import {MockGainNode} from './MockGainNode';

function internalMessage(methodName: string, ...args: unknown[]) {
  return createErrorMessage('BaseAudioContext', methodName, ...args);
}

export class MockBaseAudioContext
  extends EventTarget
  implements BaseAudioContext {
  // Cannot be `readonly` because `AudioContext` needs
  // to update this value from within it’s constructor.
  sampleRate = 44100;

  // Cannot be `readonly` becauase we need to mock
  // updating `state` in various methods.
  state: AudioContextState = 'suspended';

  readonly currentTime = 0;
  readonly audioWorklet = new MockAudioWorklet();
  readonly destination = new MockAudioDestinationNode();
  readonly listener = new MockAudioListener();
  readonly onstatechange: AudioContext['onstatechange'] = null;

  createAnalyser(): AnalyserNode {
    throw new Error(internalMessage('createAnalyser'));
  }

  createBiquadFilter(): BiquadFilterNode {
    throw new Error(internalMessage('createBiquadFilter'));
  }

  createBuffer(
    numberOfChannels: number,
    length: number,
    sampleRate: number,
  ): AudioBuffer {
    return new MockAudioBuffer({numberOfChannels, length, sampleRate});
  }

  createBufferSource(): AudioBufferSourceNode {
    return new MockAudioBufferSourceNode(this);
  }

  createChannelMerger(numberOfInputs?: number | undefined): ChannelMergerNode {
    throw new Error(internalMessage('createChannelMerger', numberOfInputs));
  }

  createChannelSplitter(
    numberOfOutputs?: number | undefined,
  ): ChannelSplitterNode {
    throw new Error(internalMessage('createChannelSplitter', numberOfOutputs));
  }

  createConstantSource(): ConstantSourceNode {
    throw new Error(internalMessage('createConstantSource'));
  }

  createConvolver(): ConvolverNode {
    throw new Error(internalMessage('createConvolver'));
  }

  createDelay(maxDelayTime?: number | undefined): DelayNode {
    throw new Error(internalMessage('createDelay', maxDelayTime));
  }

  createDynamicsCompressor(): DynamicsCompressorNode {
    throw new Error(internalMessage('createDynamicsCompressor'));
  }

  createGain(): GainNode {
    // Might need to pass `options`...
    // which are inferred from `context`?
    return new MockGainNode(this);
  }

  createIIRFilter(feedforward: number[], feedback: number[]): IIRFilterNode {
    throw new Error(internalMessage('createIIRFilter', feedforward, feedback));
  }

  createOscillator(): OscillatorNode {
    throw new Error(internalMessage('createOscillator'));
  }

  createPanner(): PannerNode {
    throw new Error(internalMessage('createPanner'));
  }

  createPeriodicWave(
    real: number[] | Float32Array,
    imag: number[] | Float32Array,
    constraints?: PeriodicWaveConstraints | undefined,
  ): PeriodicWave {
    throw new Error(
      internalMessage('createPeriodicWave', real, imag, constraints),
    );
  }

  createScriptProcessor(
    bufferSize?: number | undefined,
    numberOfInputChannels?: number | undefined,
    numberOfOutputChannels?: number | undefined,
  ): ScriptProcessorNode {
    throw new Error(
      internalMessage(
        'createScriptProcessor',
        bufferSize,
        numberOfInputChannels,
        numberOfOutputChannels,
      ),
    );
  }

  createStereoPanner(): StereoPannerNode {
    throw new Error(internalMessage('createStereoPanner'));
  }

  createWaveShaper(): WaveShaperNode {
    throw new Error(internalMessage('createWaveShaper'));
  }

  async decodeAudioData(
    _audioData: ArrayBuffer,
    _successCallback?: DecodeSuccessCallback | null | undefined,
    _errorCallback?: DecodeErrorCallback | null | undefined,
  ): Promise<AudioBuffer> {
    return new Promise((resolve) => {
      const buffer = new MockAudioBuffer({
        length: 1,
        numberOfChannels: 2,
        sampleRate: 44100,
      });

      resolve(buffer);
    });
  }
}
