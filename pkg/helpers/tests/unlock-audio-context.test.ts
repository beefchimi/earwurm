import {afterEach, describe, it, expect, vi} from 'vitest';
import {audioBufferSourceNodeEndedEvent} from '@earwurm/mocks';

import {unlockAudioContext} from '../unlock-audio-context';

describe('unlockAudioContext()', () => {
  const mockContext = new AudioContext();

  afterEach(() => {
    vi.advanceTimersToNextTimer();
  });

  it('resumes AudioContext state', async () => {
    const spyCreateBuffer = vi.spyOn(mockContext, 'createBuffer');
    const spyResume = vi.spyOn(mockContext, 'resume');

    const spySourceConnect = vi.spyOn(
      AudioBufferSourceNode.prototype,
      'connect',
    );
    const spySourceStart = vi.spyOn(AudioBufferSourceNode.prototype, 'start');

    unlockAudioContext(mockContext);

    expect(spyCreateBuffer).toBeCalledTimes(1);
    expect(spyResume).not.toBeCalled();
    expect(spySourceConnect).not.toBeCalled();
    expect(spySourceStart).not.toBeCalled();

    // Unlocks upon any of these events:
    // `click`, `keydown`, `touchstart`, and `touchend`.
    const clickEvent = new Event('click');
    document.dispatchEvent(clickEvent);

    expect(spyResume).toBeCalledTimes(2);
    expect(spySourceConnect).toBeCalledWith(mockContext.destination);
    expect(spySourceStart).toBeCalledTimes(1);
  });

  it('calls onEnded after interaction event', async () => {
    vi.spyOn(
      AudioBufferSourceNode.prototype,
      'addEventListener',
    ).mockImplementation(audioBufferSourceNodeEndedEvent);

    const mockEnded = vi.fn();
    const spySourceDisconnect = vi.spyOn(
      AudioBufferSourceNode.prototype,
      'disconnect',
    );

    unlockAudioContext(mockContext, mockEnded);

    expect(spySourceDisconnect).not.toBeCalled();
    expect(mockEnded).not.toBeCalled();

    const keydownEvent = new Event('keydown');
    document.dispatchEvent(keydownEvent);

    expect(spySourceDisconnect).toBeCalledTimes(1);
    expect(mockEnded).toBeCalledTimes(1);
  });
});
