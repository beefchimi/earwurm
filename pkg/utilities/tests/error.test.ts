import {describe, it, expect} from 'vitest';

import {getErrorMessage} from '../error';

describe('getErrorMessage()', () => {
  it('returns message from basic object', async () => {
    const mockError = {
      message: 'foo',
    };

    const result = getErrorMessage(mockError);

    expect(result).toBe(mockError.message);
  });

  it('returns message from Error', async () => {
    const mockMessage = 'Foo';
    const mockError = new Error(mockMessage, {
      cause: 'bar',
    });

    const result = getErrorMessage(mockError);

    expect(result).toBe(mockMessage);
  });

  it('returns stringified result when unknown', async () => {
    const mockError = ['foo', true, {bar: false}, null];
    const result = getErrorMessage(mockError);

    expect(result).toBe(JSON.stringify(mockError));
  });
});
