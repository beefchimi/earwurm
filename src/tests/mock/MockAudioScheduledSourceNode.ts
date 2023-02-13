import {createErrorMessage} from './mock-utils';
import {MockAudioNode} from './MockAudioNode';

function internalMessage(methodName: string, ...args: unknown[]) {
  return createErrorMessage('AudioScheduledSourceNode', methodName, ...args);
}

export class MockAudioScheduledSourceNode
  extends MockAudioNode
  implements AudioScheduledSourceNode
{
  onended: AudioScheduledSourceNode['onended'] = null;

  start(when?: number | undefined): void {
    // eslint-disable-next-line no-console
    console.log(internalMessage('start', when));
  }

  stop(when?: number | undefined): void {
    // eslint-disable-next-line no-console
    console.log(internalMessage('stop', when));
  }
}
