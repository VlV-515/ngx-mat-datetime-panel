import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { MatCalendar, MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { DateAdapter } from '@angular/material/core';
import { applyTimeValue, getTimeValue } from '../core/datetime.util';
import { NgxDatetimePanelGranularity, NgxTimeValue } from '../core/types';
import { NgxTimeSpinnerComponent } from '../time-spinner/time-spinner.component';

/**
 * Calendar + time spinner shown simultaneously in one panel — the single-value picker's content.
 * Internal: not exported from `public-api.ts`, used only by `NgxMatDatetimePanelComponent`.
 */
@Component({
  selector: 'ngx-mat-datetime-panel-content',
  standalone: true,
  imports: [MatCalendar, NgxTimeSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './datetime-panel-content.component.html',
  host: {
    class: 'ngx-mat-datetime-panel-content',
  },
})
export class NgxDatetimePanelContentComponent<D> {
  private readonly dateAdapter = inject<DateAdapter<D>>(DateAdapter);

  @Input() selected: D | null = null;
  @Input() startAt: D | null = null;
  @Input() startView: 'month' | 'year' | 'multi-year' = 'month';
  @Input() minDate: D | null = null;
  @Input() maxDate: D | null = null;
  @Input() dateFilter?: (date: D) => boolean;
  @Input() dateClass: MatCalendarCellClassFunction<D> = () => '';
  @Input() granularity: NgxDatetimePanelGranularity = 'datetime';
  @Input() showSeconds = false;
  @Input() timeStep = 1;
  @Input() disabled = false;

  @Output() readonly selectedChange = new EventEmitter<D>();

  protected get showCalendar(): boolean {
    return this.granularity !== 'time';
  }

  protected get showSpinner(): boolean {
    return this.granularity !== 'date';
  }

  protected get timeValue(): NgxTimeValue {
    return getTimeValue(this.dateAdapter, this.referenceDate());
  }

  protected onCalendarSelected(date: D | null): void {
    if (!date) {
      return;
    }
    this.selectedChange.emit(applyTimeValue(this.dateAdapter, date, getTimeValue(this.dateAdapter, this.referenceDate())));
  }

  protected onTimeChange(time: NgxTimeValue): void {
    this.selectedChange.emit(applyTimeValue(this.dateAdapter, this.referenceDate(), time));
  }

  private referenceDate(): D {
    return this.selected ?? this.startAt ?? this.dateAdapter.today();
  }
}
