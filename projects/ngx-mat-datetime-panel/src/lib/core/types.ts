/** A start/end date+time pair. Plain, consumer-constructible — unlike CDK's frozen `DateRange`. */
export interface NgxDateTimeRange<D> {
  start: D | null;
  end: D | null;
}

/** Which parts of the panel are shown. `date` hides the time spinner, `time` hides the calendar. */
export type NgxDatetimePanelGranularity = 'date' | 'datetime' | 'time';

/** Common surface both the single-value and range panel components implement, for the toggle button's `[for]`. */
export interface NgxDatetimePanelPanelBase {
  readonly isOpen: boolean;
  open(): void;
  close(): void;
}

/** A plain hour/minute/second triple, decoupled from any `DateAdapter`. */
export interface NgxTimeValue {
  hour: number;
  minute: number;
  second: number;
}

export type NgxDatetimeRangeEndpoint = 'start' | 'end';
