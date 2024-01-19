export type Primitive =
  | string
  | number
  | bigint
  | boolean
  | symbol
  | undefined
  | null;

// eslint-disable-next-line @typescript-eslint/ban-types
export type Builtin = Primitive | Function | Date | Error | RegExp;

export type AnyFn = (...args: any[]) => any;
export type Fn = () => void;

export type GlobalEventCallback = (event: any) => void;
export type GlobalEventTarget =
  | Document
  | Window
  | HTMLElement
  | null
  | undefined;

export type UtcMilliseconds = ReturnType<typeof Date.now>;

export type IntervalId = number | ReturnType<typeof setInterval>;
export type TimeoutId = number | ReturnType<typeof setTimeout>;

// Tuple: custom error, original error.
export type CombinedErrorMessage = [string, string];
