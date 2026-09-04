import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { DateRange, MatCalendar, MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { DateAdapter } from '@angular/material/core';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';
import { applyTimeValue, compareDateTime, getTimeValue } from '../core/datetime.util';
import { NgxDateTimeRange, NgxDatetimePanelGranularity, NgxDatetimeRangeEndpoint, NgxTimeValue } from '../core/types';
import { NgxTimeSpinnerComponent } from '../time-spinner/time-spinner.component';

/**
 * Calendar + time spinner + "Desde | Hasta" segmented control, all sharing one panel — the
 * range picker's content. Internal: not exported from `public-api.ts`, used only by
 * `NgxMatDatetimeRangePanelComponent`.
 */
@Component({
  selector: 'ngx-mat-datetime-range-panel-content',
  standalone: true,
  imports: [MatCalendar, NgxTimeSpinnerComponent, MatButtonToggleModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './datetime-range-panel-content.component.html',
  styleUrl: './datetime-range-panel-content.component.scss',
  host: {
    class: 'ngx-mat-datetime-range-panel-content',
  },
})
export class NgxDatetimeRangePanelContentComponent<D> {
  private readonly dateAdapter = inject<DateAdapter<D>>(DateAdapter);

  @Input() value: NgxDateTimeRange<D> = { start: null, end: null };
  @Input() activeEndpoint: NgxDatetimeRangeEndpoint = 'start';
  @Input() startView: 'month' | 'year' | 'multi-year' = 'month';
  @Input() minDate: D | null = null;
  @Input() maxDate: D | null = null;
  @Input() dateFilter?: (date: D) => boolean;
  @Input() dateClass: MatCalendarCellClassFunction<D> = () => '';
  @Input() granularity: NgxDatetimePanelGranularity = 'datetime';
  @Input() showSeconds = false;
  @Input() timeStep = 1;
  @Input() disabled = false;
  @Input() startEndpointLabel = 'Desde';
  @Input() endEndpointLabel = 'Hasta';

  @Output() readonly valueChange = new EventEmitter<NgxDateTimeRange<D>>();
  @Output() readonly activeEndpointChange = new EventEmitter<NgxDatetimeRangeEndpoint>();

  protected get showCalendar(): boolean {
    return this.granularity !== 'time';
  }

  protected get showSpinner(): boolean {
    return this.granularity !== 'date';
  }

  protected get selectedForEndpoint(): D | null {
    return this.activeEndpoint === 'start' ? this.value.start : this.value.end;
  }

  /** When editing "Hasta", the calendar can't go earlier than the current "Desde" (still respecting `[minDate]`). */
  protected get calendarMinDate(): D | null {
    return this.activeEndpoint === 'end' && this.value.start ? this.laterOf(this.minDate, this.value.start) : this.minDate;
  }

  /** When editing "Desde", the calendar can't go later than the current "Hasta" (still respecting `[maxDate]`). */
  protected get calendarMaxDate(): D | null {
    return this.activeEndpoint === 'start' && this.value.end ? this.earlierOf(this.maxDate, this.value.end) : this.maxDate;
  }

  /** Decorative in-range shading only — not part of validation. */
  protected get comparisonRange(): DateRange<D> {
    return new DateRange(this.value.start, this.value.end);
  }

  protected get timeValue(): NgxTimeValue {
    return getTimeValue(this.dateAdapter, this.selectedForEndpoint ?? this.dateAdapter.today());
  }

  protected onEndpointToggle(change: MatButtonToggleChange): void {
    this.activeEndpoint = change.value;
    this.activeEndpointChange.emit(change.value);
  }

  protected onCalendarSelected(date: D | null): void {
    if (!date) {
      return;
    }
    const base = this.selectedForEndpoint ?? this.dateAdapter.today();
    this.commit(applyTimeValue(this.dateAdapter, date, getTimeValue(this.dateAdapter, base)));
  }

  protected onTimeChange(time: NgxTimeValue): void {
    const base = this.selectedForEndpoint ?? this.dateAdapter.today();
    this.commit(applyTimeValue(this.dateAdapter, base, time));
  }

  private commit(date: D): void {
    const next: NgxDateTimeRange<D> =
      this.activeEndpoint === 'start' ? { ...this.value, start: date } : { ...this.value, end: date };
    this.valueChange.emit(next);
  }

  private earlierOf(a: D | null, b: D | null): D | null {
    if (!a) return b;
    if (!b) return a;
    return compareDateTime(this.dateAdapter, a, b) <= 0 ? a : b;
  }

  private laterOf(a: D | null, b: D | null): D | null {
    if (!a) return b;
    if (!b) return a;
    return compareDateTime(this.dateAdapter, a, b) >= 0 ? a : b;
  }
}
