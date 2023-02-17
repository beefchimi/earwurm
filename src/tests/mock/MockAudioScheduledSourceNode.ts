import {MockAudioNode} from './MockAudioNode';

/*
import {createErrorMessage} from './mock-utils';

function internalMessage(methodName: string, ...args: unknown[]) {
  return createErrorMessage('AudioScheduledSourceNode', methodName, ...args);
}
*/

export class MockAudioScheduledSourceNode
  extends MockAudioNode
  implements AudioScheduledSourceNode
{
  onended: AudioScheduledSourceNode['onended'] = null;

  start(_when?: number | undefined): void {
    // Artificial timeout for sound duration.
    setTimeout(() => {
      this.dispatchEvent(new Event('ended'));
    }, 100);
  }

  stop(_when?: number | undefined): void {
    // Could pass `when` as delay for `setTimeout`.
    this.dispatchEvent(new Event('ended'));
  }
}
