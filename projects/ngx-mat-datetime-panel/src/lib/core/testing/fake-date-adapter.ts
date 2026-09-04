import { DateAdapter } from '@angular/material/core';

/** A minimal `DateAdapter<FakeDate>` fake, covering only the methods this library actually calls. */
export interface FakeDate {
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function fakeDate(day: number, hour = 0, minute = 0, second = 0): FakeDate {
  return { day, hour, minute, second };
}

export function createFakeDateAdapter(): DateAdapter<FakeDate> {
  return {
    compareDate: (a: FakeDate, b: FakeDate) => a.day - b.day,
    compareTime: (a: FakeDate, b: FakeDate) => a.hour - b.hour || a.minute - b.minute || a.second - b.second,
    getHours: (d: FakeDate) => d.hour,
    getMinutes: (d: FakeDate) => d.minute,
    getSeconds: (d: FakeDate) => d.second,
    setTime: (d: FakeDate, hour: number, minute: number, second: number) => ({ ...d, hour, minute, second }),
    today: () => fakeDate(0),
  } as unknown as DateAdapter<FakeDate>;
}
