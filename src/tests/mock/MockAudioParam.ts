import {secToMs} from '../../utilities';
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

  cancelScheduledValues(_cancelTime: number): AudioParam {
    return this;
  }

  exponentialRampToValueAtTime(value: number, endTime: number): AudioParam {
    throw new Error(
      internalMessage('exponentialRampToValueAtTime', value, endTime),
    );
  }

  linearRampToValueAtTime(value: number, endTime: number): AudioParam {
    const ms = secToMs(endTime);

    setTimeout(() => {
      this.value = value;
    }, ms);

    return this;
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

  setValueAtTime(value: number, _startTime: number): AudioParam {
    this.value = value;
    return this;
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
