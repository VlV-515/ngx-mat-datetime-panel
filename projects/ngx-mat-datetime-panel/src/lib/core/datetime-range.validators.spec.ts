import { FormControl } from '@angular/forms';
import { ngxDatetimeRangeValidator } from './datetime-range.validators';
import { NgxDateTimeRange } from './types';
import { createFakeDateAdapter, fakeDate, FakeDate } from './testing/fake-date-adapter';

describe('ngxDatetimeRangeValidator', () => {
  const adapter = createFakeDateAdapter();
  const validate = ngxDatetimeRangeValidator(adapter);

  it('is valid when the range is incomplete', () => {
    const control = new FormControl<NgxDateTimeRange<FakeDate> | null>({ start: fakeDate(1), end: null });
    expect(validate(control)).toBeNull();
  });

  it('is valid when end is after start', () => {
    const control = new FormControl<NgxDateTimeRange<FakeDate> | null>({ start: fakeDate(1), end: fakeDate(2) });
    expect(validate(control)).toBeNull();
  });

  it('is valid when end equals start', () => {
    const control = new FormControl<NgxDateTimeRange<FakeDate> | null>({ start: fakeDate(1, 9), end: fakeDate(1, 9) });
    expect(validate(control)).toBeNull();
  });

  it('flags an end before start with ngxDateRangeInvalid', () => {
    const control = new FormControl<NgxDateTimeRange<FakeDate> | null>({ start: fakeDate(2), end: fakeDate(1) });
    expect(validate(control)).toEqual({
      ngxDateRangeInvalid: { start: fakeDate(2), end: fakeDate(1) },
    });
  });

  it('flags a same-day end time before the start time', () => {
    const control = new FormControl<NgxDateTimeRange<FakeDate> | null>({
      start: fakeDate(1, 10, 0, 0),
      end: fakeDate(1, 9, 0, 0),
    });
    expect(validate(control)?.['ngxDateRangeInvalid']).toBeTruthy();
  });
});
