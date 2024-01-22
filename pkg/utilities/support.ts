export function supportDom() {
  return typeof window?.document?.createElement !== 'undefined';
}

export function supportMatchMedia() {
  return (
    window && 'matchMedia' in window && typeof window.matchMedia === 'function'
  );
}
