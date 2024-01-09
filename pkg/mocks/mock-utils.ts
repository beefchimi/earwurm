function convertArg(value: any) {
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  if (typeof value === 'boolean') {
    return value.toString();
  }

  if (value === undefined) {
    return 'undefined';
  }

  if (Array.isArray(value)) {
    return `[${value.join(', ')}]`;
  }

  return JSON.stringify(value);
}

export function createErrorMessage(
  className: string,
  methodName: string,
  ...args: unknown[]
) {
  const stringifiedArgs = args.length
    ? args.map(convertArg).join(', ')
    : 'none';

  return `${className} > ${methodName} > args: ${stringifiedArgs}`;
}

export function audioBufferSourceNodeEndedEvent(
  _eventName = 'ended',
  callback: EventListenerOrEventListenerObject,
) {
  if (typeof callback !== 'function') {
    return;
  }

  const mockEvent = new Event('ended');
  callback(mockEvent);
}
