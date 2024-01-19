export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  timeout: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      callback(...args);
    }, timeout);
  };
}

export async function sleep(ms = 0) {
  return await new Promise((resolve) => setTimeout(resolve, ms));
}
