export const tokens = {
  // Global
  error: {
    close: 'Failed to close the Earwurm AudioContext.',
    resume: 'Failed to resume the Earwurm AudioContext.',
  },
  transitionSec: 0.2,
  // Earwurm (manager)
  suspendAfterMs: 30000,
  // Stack
  maxStackSize: 8,
  // Sound
  minStartTime: 0.0001,
  minSpeed: 0.25,
  maxSpeed: 4,
  // FireFox does not accept a `0` value.
  pauseSpeed: 0.0001,
};
