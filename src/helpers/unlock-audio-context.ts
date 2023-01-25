import {scratchBuffer} from './scratch-buffer';

const INTERACTION_EVENTS: Array<keyof DocumentEventMap> = [
  'click',
  'keydown',
  'touchstart',
  'touchend',
];

export function unlockAudioContext(
  context: AudioContext,
  onEnded?: () => void,
) {
  const buffer = scratchBuffer(context);

  function unlock() {
    // TODO: Double-check and make sure this is still required.
    // Android can not play in suspend state.
    // We might want to use `autoResume()` here,
    // and if so, will need a `.onStart?()`.
    context.resume().catch(() => null);

    const source = context.createBufferSource();
    source.buffer = buffer;

    source.connect(context.destination);
    source.start();

    // TODO: Double-check and make sure this is still required.
    // Required for Android Chrome >= 55.
    context.resume().catch(() => null);

    function handleEnded() {
      source.disconnect();

      INTERACTION_EVENTS.forEach((type) => {
        console.log('INTERACTION_EVENTS > remove > type', type);

        document.removeEventListener(type, unlock, {capture: true});
      });

      // Typically used to set a "isUnlocked" state variable.
      onEnded?.();
    }

    source.addEventListener('ended', handleEnded, {once: true});
  }

  INTERACTION_EVENTS.forEach((type) => {
    console.log('INTERACTION_EVENTS > add > type', type);

    document.addEventListener(type, unlock, {
      capture: true,
      once: true,
    });
  });
}
