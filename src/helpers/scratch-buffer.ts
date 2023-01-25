export function scratchBuffer(context: AudioContext) {
  // Creates a silent > 1ms sound.
  return context.createBuffer(1, 1, 22050);
}
