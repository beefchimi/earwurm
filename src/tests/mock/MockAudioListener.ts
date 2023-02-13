import {createErrorMessage} from './mock-utils';
import {MockAudioParam} from './MockAudioParam';

function internalMessage(methodName: string, ...args: unknown[]) {
  return createErrorMessage('AudioListener', methodName, ...args);
}

const mockParam = new MockAudioParam();

export class MockAudioListener implements AudioListener {
  readonly forwardX = mockParam;
  readonly forwardY = mockParam;
  readonly forwardZ = mockParam;
  readonly positionX = mockParam;
  readonly positionY = mockParam;
  readonly positionZ = mockParam;
  readonly upX = mockParam;
  readonly upY = mockParam;
  readonly upZ = mockParam;

  setOrientation(
    x: number,
    y: number,
    z: number,
    xUp: number,
    yUp: number,
    zUp: number,
  ): void {
    throw new Error(internalMessage('setOrientation', x, y, z, xUp, yUp, zUp));
  }

  setPosition(x: number, y: number, z: number): void {
    throw new Error(internalMessage('setOrientation', x, y, z));
  }
}
