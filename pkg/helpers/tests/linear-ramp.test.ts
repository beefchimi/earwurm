import {describe, expect, it, vi} from 'vitest';

import {linearRamp} from '../linear-ramp';

describe('linearRamp()', () => {
  const mockContext = new AudioContext();

  it('transitions to the specified value', async () => {
    const mockAudioParam = new AudioParam();

    const spyCancel = vi.spyOn(mockAudioParam, 'cancelScheduledValues');
    const spySet = vi.spyOn(mockAudioParam, 'setValueAtTime');
    const spyRamp = vi.spyOn(mockAudioParam, 'linearRampToValueAtTime');

    const fromValue = mockAudioParam.value;
    const fromTime = mockContext.currentTime;

    const toValue = 2;
    const toTime = fromTime + 2;

    expect(spyCancel).not.toBeCalled();
    expect(spySet).not.toBeCalled();
    expect(spyRamp).not.toBeCalled();

    const result = linearRamp(
      mockAudioParam,
      {from: fromValue, to: toValue},
      {from: fromTime, to: toTime},
    );

    expect(result).toBeInstanceOf(AudioParam);

    expect(spyCancel).toBeCalledTimes(1);
    expect(spyCancel).toBeCalledWith(fromTime);

    expect(spySet).toBeCalledTimes(1);
    expect(spySet).toBeCalledWith(fromValue, fromTime);

    expect(spyRamp).toBeCalledTimes(1);
    expect(spyRamp).toBeCalledWith(toValue, toTime);
  });
});
