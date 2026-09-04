import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { compareDateTime } from './datetime.util';
import { NgxDateTimeRange } from './types';

/**
 * Validates that `end >= start` in a `NgxDateTimeRange<D>` control, using `DateAdapter`
 * comparison methods only — never raw `Date`/moment comparison, to stay adapter-generic.
 * A range with a missing `start` or `end` is treated as incomplete, not invalid — pair with
 * `Validators.required` (or a required check on each endpoint) separately if completeness matters.
 */
export function ngxDatetimeRangeValidator<D>(adapter: DateAdapter<D>): ValidatorFn {
  return (control: AbstractControl<NgxDateTimeRange<D> | null>): ValidationErrors | null => {
    const value = control.value;
    if (!value?.start || !value?.end) {
      return null;
    }
    return compareDateTime(adapter, value.end, value.start) < 0
      ? { ngxDateRangeInvalid: { start: value.start, end: value.end } }
      : null;
  };
}
