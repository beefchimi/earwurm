const monthsPerYear = 12;

const weeksPerMonth = 4;
const weeksPerYear = 52;

const daysPerWeek = 7;
const daysPerMonth = 30;
const daysPerYear = 365;

const hrsPerDay = 24;
const hrsPerWeek = hrsPerDay * daysPerWeek;
const hrsPerMonth = hrsPerDay * daysPerMonth;
const hrsPerYear = hrsPerDay * daysPerYear;

const minsPerHr = 60;
const minsPerDay = minsPerHr * hrsPerDay;
const minsPerWeek = minsPerDay * daysPerWeek;
const minsPerMonth = minsPerDay * daysPerMonth;
const minsPerYear = minsPerDay * daysPerYear;

const secsPerMin = 60;
const secsPerHr = secsPerMin * minsPerHr;
const secsPerDay = secsPerHr * hrsPerDay;
const secsPerWeek = secsPerDay * daysPerWeek;
const secsPerMonth = secsPerDay * daysPerMonth;
const secsPerYear = secsPerDay * daysPerYear;

const msPerSec = 1000;
const msPerMin = msPerSec * secsPerMin;
const msPerHr = msPerMin * minsPerHr;
const msPerDay = msPerHr * hrsPerDay;
const msPerWeek = msPerDay * daysPerWeek;
const msPerMonth = msPerDay * daysPerMonth;
const msPerYear = msPerDay * daysPerYear;

export const timeMeasurement = {
  monthsPerYear,
  weeksPerMonth,
  weeksPerYear,
  daysPerWeek,
  hrsPerDay,
  hrsPerWeek,
  hrsPerMonth,
  hrsPerYear,
  minsPerHr,
  minsPerDay,
  minsPerWeek,
  minsPerMonth,
  minsPerYear,
  secsPerMin,
  secsPerHr,
  secsPerDay,
  secsPerWeek,
  secsPerMonth,
  secsPerYear,
  msPerSec,
  msPerMin,
  msPerHr,
  msPerDay,
  msPerWeek,
  msPerMonth,
  msPerYear,
};

export function msToSec(milliseconds = 0) {
  return milliseconds / msPerSec;
}

export function secToMs(seconds = 0) {
  return seconds * msPerSec;
}
