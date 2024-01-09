interface LinearRampValue {
  from: number;
  to: number;
}

export function linearRamp(
  param: AudioParam,
  value: LinearRampValue,
  time: LinearRampValue,
) {
  return param
    .cancelScheduledValues(time.from)
    .setValueAtTime(value.from, time.from)
    .linearRampToValueAtTime(value.to, time.to);
}
