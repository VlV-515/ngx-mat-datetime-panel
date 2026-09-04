import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { wrapClamp } from '../core/datetime.util';

/**
 * One column of the time spinner (hour, minute, or second): chevron-up, editable digit,
 * chevron-down. Not exported from `public-api.ts` — internal to `NgxTimeSpinnerComponent`.
 */
@Component({
  selector: 'ngx-mat-time-spinner-column',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './time-spinner-column.component.html',
  styleUrl: './time-spinner-column.component.scss',
  host: {
    class: 'ngx-time-spinner-column',
  },
})
export class NgxTimeSpinnerColumnComponent {
  @Input({ required: true }) value = 0;
  @Input({ required: true }) min = 0;
  @Input({ required: true }) max = 59;
  @Input() step = 1;
  @Input() disabled = false;
  @Input() label = '';

  @Output() readonly valueChange = new EventEmitter<number>();

  private digitBuffer = '';
  private digitBufferTimeout: ReturnType<typeof setTimeout> | null = null;

  protected get display(): string {
    return String(this.value).padStart(2, '0');
  }

  protected increment(step = this.step): void {
    if (this.disabled) {
      return;
    }
    this.emit(wrapClamp(this.value + step, this.min, this.max));
  }

  protected decrement(step = this.step): void {
    if (this.disabled) {
      return;
    }
    this.emit(wrapClamp(this.value - step, this.min, this.max));
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled) {
      return;
    }

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.increment();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.decrement();
        break;
      case 'PageUp':
        event.preventDefault();
        this.increment(this.step * 5);
        break;
      case 'PageDown':
        event.preventDefault();
        this.decrement(this.step * 5);
        break;
      case 'Home':
        event.preventDefault();
        this.emit(this.min);
        break;
      case 'End':
        event.preventDefault();
        this.emit(this.max);
        break;
      default:
        if (/^[0-9]$/.test(event.key)) {
          event.preventDefault();
          this.onDigit(event.key);
        }
        break;
    }
  }

  private onDigit(digit: string): void {
    this.digitBuffer = (this.digitBuffer + digit).slice(-2);
    const parsed = Number(this.digitBuffer);

    if (this.digitBufferTimeout) {
      clearTimeout(this.digitBufferTimeout);
    }

    if (this.digitBuffer.length === 2 || parsed * 10 > this.max) {
      this.emit(Math.min(parsed, this.max));
      this.digitBuffer = '';
      return;
    }

    this.emit(Math.min(parsed, this.max));
    this.digitBufferTimeout = setTimeout(() => {
      this.digitBuffer = '';
    }, 800);
  }

  private emit(value: number): void {
    if (value !== this.value) {
      this.valueChange.emit(value);
    }
  }
}
