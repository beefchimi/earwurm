import {createErrorMessage} from './mock-utils';

function internalMessage(methodName: string, ...args: unknown[]) {
  return createErrorMessage('AudioParam', methodName, ...args);
}

export class MockAudioParam implements AudioParam {
  automationRate: AutomationRate = 'a-rate';
  value = 1;

  readonly defaultValue = 1;
  readonly maxValue = 2;
  readonly minValue = -2;

  cancelAndHoldAtTime(cancelTime: number): AudioParam {
    throw new Error(internalMessage('cancelAndHoldAtTime', cancelTime));
  }

  cancelScheduledValues(cancelTime: number): AudioParam {
    throw new Error(internalMessage('cancelScheduledValues', cancelTime));
  }

  exponentialRampToValueAtTime(value: number, endTime: number): AudioParam {
    throw new Error(
      internalMessage('exponentialRampToValueAtTime', value, endTime),
    );
  }

  linearRampToValueAtTime(value: number, endTime: number): AudioParam {
    throw new Error(internalMessage('linearRampToValueAtTime', value, endTime));
  }

  setTargetAtTime(
    target: number,
    startTime: number,
    timeConstant: number,
  ): AudioParam {
    throw new Error(
      internalMessage('setTargetAtTime', target, startTime, timeConstant),
    );
  }

  setValueAtTime(value: number, startTime: number): AudioParam {
    throw new Error(internalMessage('setValueAtTime', value, startTime));
  }

  setValueCurveAtTime(
    values: number[] | Float32Array,
    startTime: number,
    duration: number,
  ): AudioParam {
    throw new Error(
      internalMessage('setValueCurveAtTime', ...values, startTime, duration),
    );
  }
}
