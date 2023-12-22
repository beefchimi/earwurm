import {afterEach, describe, it, expect, vi} from 'vitest';

import {msToSec} from '../utilities';
import {Sound} from '../Sound';
import type {SoundConfig, SoundEventMap} from '../types';

// This test covers any shared implementation between
// each component. Eventually, I will create a proper
// `abstract` that each component implements. For now,
// I will simply use `Sound` as a stand-in.
describe('Abstract implementation', () => {
  const defaultAudioBuffer = new AudioBuffer({
    length: 1,
    numberOfChannels: 2,
    sampleRate: 44100,
  });

  const defaultContext = new AudioContext();
  const defaultAudioNode = new AudioNode();

  describe('mute', () => {
    const mockSound = new Sound(
      'TestMute',
      defaultAudioBuffer,
      defaultContext,
      defaultAudioNode,
    );

    afterEach(() => {
      mockSound.mute = false;
    });

    it('allows `set` and `get`', () => {
      expect(mockSound.mute).toBe(false);
      mockSound.mute = true;
      expect(mockSound.mute).toBe(true);
    });

    // TODO: Will require spy on the `gainNode.gain.value`.
    it.todo('sets gain to 0 when muted');
    it.todo('sets gain to volume when un-muted');

    it('fades to new value', () => {
      const mockOptions: SoundConfig = {
        volume: 0.6,
        fadeMs: 100,
      };

      const soundWithFade = new Sound(
        'TestMuteFade',
        defaultAudioBuffer,
        defaultContext,
        defaultAudioNode,
        {...mockOptions},
      );

      const fadeSec = msToSec(mockOptions.fadeMs ?? 0);
      const endTime = defaultContext.currentTime + fadeSec;

      const spyGainRamp = vi.spyOn(
        AudioParam.prototype,
        'linearRampToValueAtTime',
      );

      soundWithFade.mute = true;

      // TODO: Check that `gain.value` is `mockOptions.volume`.
      // Then, `advanceTimersToNextTimer()` and check that
      // `gain.value` is `0`.
      expect(spyGainRamp).toBeCalledWith(0, endTime);
    });

    it('triggers mute event when set to a unique value', async () => {
      const spyMute: SoundEventMap['mute'] = vi.fn((_muted) => {});

      mockSound.on('mute', spyMute);
      expect(spyMute).not.toBeCalled();

      mockSound.mute = false;
      expect(spyMute).not.toBeCalled();

      mockSound.mute = true;
      expect(spyMute).toBeCalledWith(true);

      mockSound.mute = false;
      expect(spyMute).toBeCalledWith(false);

      mockSound.off('mute', spyMute);

      mockSound.mute = true;
      expect(spyMute).not.toHaveBeenLastCalledWith(true);
    });
  });

  describe('volume', () => {
    const mockSound = new Sound(
      'TestVolume',
      defaultAudioBuffer,
      defaultContext,
      defaultAudioNode,
    );

    afterEach(() => {
      mockSound.volume = 1;
      mockSound.mute = false;
    });

    it('allows `set` and `get`', () => {
      const mockVolume = 0.4;
      mockSound.volume = mockVolume;

      expect(mockSound.volume).toBe(mockVolume);
    });

    it('restricts value to a minimum of `0`', () => {
      mockSound.volume = -2;
      expect(mockSound.volume).toBe(0);
    });

    it('restricts value to a maximum of `1`', () => {
      mockSound.volume = 2;
      expect(mockSound.volume).toBe(1);
    });

    it('sets value on `gain`', () => {
      const oldValue = mockSound.volume;
      const newValue = 0.6;
      const {currentTime} = defaultContext;

      const spyGainCancel = vi.spyOn(
        AudioParam.prototype,
        'cancelScheduledValues',
      );
      const spyGainSet = vi.spyOn(AudioParam.prototype, 'setValueAtTime');
      const spyGainRamp = vi.spyOn(
        AudioParam.prototype,
        'linearRampToValueAtTime',
      );

      // TODO: Spy on the `gain.value` setter.
      mockSound.volume = newValue;

      expect(spyGainCancel).toBeCalledWith(currentTime);
      expect(spyGainSet).toBeCalledWith(oldValue, currentTime);
      expect(spyGainRamp).toBeCalledWith(newValue, currentTime);
    });

    it('does not set value on gain if muted', () => {
      const mockVolume = 0.2;

      const spyGainCancel = vi.spyOn(
        AudioParam.prototype,
        'cancelScheduledValues',
      );
      const spyGainSet = vi.spyOn(AudioParam.prototype, 'setValueAtTime');
      const spyGainRamp = vi.spyOn(
        AudioParam.prototype,
        'linearRampToValueAtTime',
      );

      expect(spyGainCancel).not.toBeCalled();
      expect(spyGainSet).not.toBeCalled();
      expect(spyGainRamp).not.toBeCalled();

      mockSound.mute = true;

      // TODO: Should check that `gain.value` is `0`,
      // but `volume` is unchanged.
      expect(spyGainCancel).toBeCalledTimes(1);
      expect(spyGainSet).toBeCalledTimes(1);
      expect(spyGainRamp).toBeCalledTimes(1);

      mockSound.volume = mockVolume;

      // TODO: Should check that `gain.value` and
      // `volume` are now equal.
      expect(spyGainCancel).not.toBeCalledTimes(2);
      expect(spyGainSet).not.toBeCalledTimes(2);
      expect(spyGainRamp).not.toBeCalledTimes(2);
    });

    it('fades to new volume', () => {
      const mockOptions: SoundConfig = {
        volume: 0.6,
        fadeMs: 100,
      };

      const soundWithFade = new Sound(
        'TestVolumeFade',
        defaultAudioBuffer,
        defaultContext,
        defaultAudioNode,
        {...mockOptions},
      );

      const newValue = 0.8;
      const fadeSec = msToSec(mockOptions.fadeMs ?? 0);
      const endTime = defaultContext.currentTime + fadeSec;

      const spyGainRamp = vi.spyOn(
        AudioParam.prototype,
        'linearRampToValueAtTime',
      );

      soundWithFade.volume = newValue;

      // TODO: Check that `gain.value` is `mockOptions.volume`.
      // Then, `advanceTimersToNextTimer()` and check that
      // `gain.value` is `newValue`.
      expect(spyGainRamp).toBeCalledWith(newValue, endTime);
    });

    it('triggers volume event when set to a unique value (regardless of mute state)', async () => {
      const spyVolume: SoundEventMap['volume'] = vi.fn((_level) => {});

      mockSound.on('volume', spyVolume);
      expect(spyVolume).not.toBeCalled();

      mockSound.volume = 1;
      expect(spyVolume).not.toBeCalled();

      mockSound.mute = true;
      mockSound.volume = 0.8;
      expect(spyVolume).toBeCalledWith(0.8);

      mockSound.mute = false;
      mockSound.volume = 0;
      expect(spyVolume).toBeCalledWith(0);

      mockSound.volume = 1;
      expect(spyVolume).toBeCalledWith(1);

      mockSound.off('volume', spyVolume);

      mockSound.volume = 0.6;
      expect(spyVolume).not.toBeCalledWith(0.6);
    });
  });
});
