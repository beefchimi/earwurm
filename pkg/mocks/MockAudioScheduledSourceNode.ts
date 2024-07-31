import {MockAudioNode} from './MockAudioNode';
import {mockData} from './mock-data';

/*
import {createErrorMessage} from './mock-utils';

function internalMessage(methodName: string, ...args: unknown[]) {
  return createErrorMessage('AudioScheduledSourceNode', methodName, ...args);
}
*/

export class MockAudioScheduledSourceNode
  extends MockAudioNode
  implements AudioScheduledSourceNode {
  onended: AudioScheduledSourceNode['onended'] = null;

  start(_when?: number | undefined): void {
    // Artificial timeout for sound duration.
    setTimeout(() => {
      this.dispatchEvent(new Event('ended'));
    }, mockData.playDurationMs);
  }

  stop(_when?: number | undefined): void {
    // Could pass `when` as delay for `setTimeout`.
    this.dispatchEvent(new Event('ended'));
  }
}
