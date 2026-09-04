import { compareDateTime, getTimeValue, applyTimeValue, wrapClamp } from './datetime.util';
import { createFakeDateAdapter, fakeDate } from './testing/fake-date-adapter';

describe('compareDateTime', () => {
  const adapter = createFakeDateAdapter();

  it('compares by date first', () => {
    expect(compareDateTime(adapter, fakeDate(1, 23, 0, 0), fakeDate(2, 0, 0, 0))).toBeLessThan(0);
    expect(compareDateTime(adapter, fakeDate(2, 0, 0, 0), fakeDate(1, 23, 0, 0))).toBeGreaterThan(0);
  });

  it('falls back to time when dates are equal', () => {
    expect(compareDateTime(adapter, fakeDate(1, 8, 0, 0), fakeDate(1, 9, 0, 0))).toBeLessThan(0);
    expect(compareDateTime(adapter, fakeDate(1, 9, 30, 0), fakeDate(1, 9, 0, 0))).toBeGreaterThan(0);
    expect(compareDateTime(adapter, fakeDate(1, 9, 0, 0), fakeDate(1, 9, 0, 0))).toBe(0);
  });
});

describe('getTimeValue / applyTimeValue', () => {
  const adapter = createFakeDateAdapter();

  it('round-trips hour/minute/second through a date', () => {
    const date = fakeDate(5, 14, 30, 45);
    expect(getTimeValue(adapter, date)).toEqual({ hour: 14, minute: 30, second: 45 });

    const moved = applyTimeValue(adapter, date, { hour: 1, minute: 2, second: 3 });
    expect(moved).toEqual({ day: 5, hour: 1, minute: 2, second: 3 });
  });
});

describe('wrapClamp', () => {
  it('wraps above max back to min', () => {
    expect(wrapClamp(24, 0, 23)).toBe(0);
    expect(wrapClamp(25, 0, 23)).toBe(1);
  });

  it('wraps below min back to max', () => {
    expect(wrapClamp(-1, 0, 23)).toBe(23);
    expect(wrapClamp(-2, 0, 59)).toBe(58);
  });

  it('leaves in-range values untouched', () => {
    expect(wrapClamp(10, 0, 23)).toBe(10);
  });
});
