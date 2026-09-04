import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgxTimeValue } from '../core/types';
import { NgxTimeSpinnerColumnComponent } from './time-spinner-column.component';

/**
 * Digital hour/minute[/second] spinner: three independent bounded dials, each with a
 * chevron-up, editable digit, chevron-down — never a dropdown/autocomplete list.
 * Operates purely on plain numbers, decoupled from any `DateAdapter` — the panel components
 * own the `D <-> {hour, minute, second}` conversion.
 */
@Component({
  selector: 'ngx-mat-time-spinner',
  standalone: true,
  imports: [NgxTimeSpinnerColumnComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './time-spinner.component.html',
  styleUrl: './time-spinner.component.scss',
  host: {
    class: 'ngx-mat-time-spinner',
  },
})
export class NgxTimeSpinnerComponent {
  @Input({ required: true }) hour = 0;
  @Input({ required: true }) minute = 0;
  @Input() second: number | null = null;
  @Input() showSeconds = false;
  @Input() minuteStep = 1;
  @Input() secondStep = 1;
  @Input() disabled = false;

  @Output() readonly timeChange = new EventEmitter<NgxTimeValue>();

  protected onHourChange(hour: number): void {
    this.timeChange.emit({ hour, minute: this.minute, second: this.second ?? 0 });
  }

  protected onMinuteChange(minute: number): void {
    this.timeChange.emit({ hour: this.hour, minute, second: this.second ?? 0 });
  }

  protected onSecondChange(second: number): void {
    this.timeChange.emit({ hour: this.hour, minute: this.minute, second });
  }
}
