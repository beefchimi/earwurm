import {createErrorMessage} from './mock-utils';

function internalMessage(methodName: string, ...args: unknown[]) {
  return createErrorMessage('Worklet', methodName, ...args);
}

export class MockWorklet implements Worklet {
  async addModule(
    moduleURL: string | URL,
    options?: WorkletOptions | undefined,
  ): Promise<void> {
    throw new Error(internalMessage('addModule', moduleURL, options));
  }
}
