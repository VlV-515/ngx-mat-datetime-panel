import { DateAdapter, MatDateFormats } from '@angular/material/core';
import { NgxDatetimePanelGranularity, NgxTimeValue } from './types';

/** Compares two `D` values by date first, then by time-of-day — always via `DateAdapter`, never raw `Date`/moment comparison. */
export function compareDateTime<D>(adapter: DateAdapter<D>, a: D, b: D): number {
  const dateComparison = adapter.compareDate(a, b);
  return dateComparison !== 0 ? dateComparison : adapter.compareTime(a, b);
}

/** Reads the hour/minute/second of `date` as a plain triple, for feeding the DateAdapter-agnostic time spinner. */
export function getTimeValue<D>(adapter: DateAdapter<D>, date: D): NgxTimeValue {
  return {
    hour: adapter.getHours(date),
    minute: adapter.getMinutes(date),
    second: adapter.getSeconds(date),
  };
}

/** Returns a new `D` with `date`'s calendar date and `time`'s hour/minute/second. */
export function applyTimeValue<D>(adapter: DateAdapter<D>, date: D, time: NgxTimeValue): D {
  return adapter.setTime(date, time.hour, time.minute, time.second);
}

/**
 * Formats `value` for the panel's text input, according to `granularity`.
 * Falls back to a manual "HH:mm[:ss]" build when `formats.display.timeInput` is missing —
 * common for older custom `MAT_DATE_FORMATS` objects that predate Material's time-input format field.
 */
export function formatDateTimeValue<D>(
  adapter: DateAdapter<D>,
  formats: MatDateFormats,
  value: D,
  granularity: NgxDatetimePanelGranularity,
  showSeconds: boolean,
): string {
  const datePart = () => adapter.format(value, formats.display.dateInput);
  const timePart = () => {
    if (formats.display.timeInput) {
      return adapter.format(value, formats.display.timeInput);
    }
    return formatTimeFallback(getTimeValue(adapter, value), showSeconds);
  };

  switch (granularity) {
    case 'date':
      return datePart();
    case 'time':
      return timePart();
    case 'datetime':
    default:
      return `${datePart()} ${timePart()}`;
  }
}

function formatTimeFallback(time: NgxTimeValue, showSeconds: boolean): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const base = `${pad(time.hour)}:${pad(time.minute)}`;
  return showSeconds ? `${base}:${pad(time.second)}` : base;
}

/** Clamps `value` into `[min, max]` inclusive, wrapping around when it overshoots either bound. */
export function wrapClamp(value: number, min: number, max: number): number {
  const span = max - min + 1;
  return min + (((value - min) % span) + span) % span;
}
