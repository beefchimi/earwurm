export type PrimitiveType =
  | string
  | number
  | bigint
  | boolean
  | symbol
  | undefined
  | null;

export type TimeoutId = number | ReturnType<typeof setTimeout>;

// Tuple: custom error, original error.
export type CombinedErrorMessage = [string, string];
