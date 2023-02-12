import {vi} from 'vitest';
import type {Mutable} from '../types';

type MutableAudioContext = Mutable<AudioContext>;
type MutableAudioDestinationNode = Mutable<AudioDestinationNode>;

const MockAudioParam = vi.fn<[], AudioParam>(() => ({
  defaultValue: 1,
  maxValue: 2,
  minValue: 0,
  value: 1,
  automationRate: 'a-rate',
  cancelAndHoldAtTime: vi.fn(),
  cancelScheduledValues: vi.fn(),
  exponentialRampToValueAtTime: vi.fn(),
  linearRampToValueAtTime: vi.fn(),
  setTargetAtTime: vi.fn(),
  setValueAtTime: vi.fn(),
  setValueCurveAtTime: vi.fn(),
}));

export const MockAudioContext = vi.fn<[], MutableAudioContext>(() => {
  const audioParam = new MockAudioParam();

  const context: Partial<MutableAudioContext> = {
    audioWorklet: {
      addModule: vi.fn(),
    },
    baseLatency: 0,
    listener: {
      forwardX: audioParam,
      forwardY: audioParam,
      forwardZ: audioParam,
      positionX: audioParam,
      positionY: audioParam,
      positionZ: audioParam,
      upX: audioParam,
      upY: audioParam,
      upZ: audioParam,
      setOrientation: vi.fn(),
      setPosition: vi.fn(),
    },
    currentTime: 0,
    outputLatency: 0,
    sampleRate: 44100,
    state: 'suspended',
    onstatechange: null,
    createGain: vi.fn(),
    createBuffer: vi.fn(),
    createBufferSource: vi.fn(),
    decodeAudioData: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    close: vi.fn(async () => {
      console.log('close', this);
      // this.state = 'closed';
    }),
    resume: vi.fn(async () => {
      console.log('resume', this);
      // this.state = 'running';
    }),
    suspend: vi.fn(async () => {
      console.log('suspend', this);
      // this.state = 'suspended';
    }),
  };

  const destination: MutableAudioDestinationNode = {
    context,
    channelCount: 2,
    channelCountMode: 'explicit',
    channelInterpretation: 'speakers',
    maxChannelCount: 2,
    numberOfInputs: 1,
    numberOfOutputs: 0,
    connect: vi.fn(() => {}),
    disconnect: vi.fn(() => {}),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  context.destination = destination;

  return context;
});
