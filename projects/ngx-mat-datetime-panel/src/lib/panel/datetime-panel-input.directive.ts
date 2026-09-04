import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, booleanAttribute, inject } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { Subscription } from 'rxjs';
import { compareDateTime } from '../core/datetime.util';
import { NgxMatDatetimePanelComponent } from './datetime-panel.component';

/**
 * Opens a `NgxMatDatetimePanelComponent` from an `<input>` and binds it as a `D | null`
 * `ControlValueAccessor` — the self-registering pattern (`inject(NgControl, {optional, self})`
 * + `ctrl.valueAccessor = this`), not `NG_VALUE_ACCESSOR`/`forwardRef`.
 */
@Directive({
  selector: 'input[ngxMatDatetimePanel]',
  standalone: true,
  host: {
    class: 'ngx-mat-datetime-panel-input',
    'autocomplete': 'off',
    '[attr.disabled]': 'disabled ? "" : null',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur($event)',
  },
})
export class NgxMatDatetimePanelInputDirective<D> implements ControlValueAccessor, OnInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly dateAdapter = inject<DateAdapter<D>>(DateAdapter, { optional: true });

  @Input('ngxMatDatetimePanel') panel!: NgxMatDatetimePanelComponent<D>;
  @Input() min: D | null = null;
  @Input() max: D | null = null;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input({ transform: booleanAttribute }) openOnFocus = true;

  @Output() readonly dateChange = new EventEmitter<D | null>();
  @Output() readonly blurred = new EventEmitter<FocusEvent>();

  private value: D | null = null;
  private onChange: (value: D | null) => void = () => {};
  private onTouched: () => void = () => {};
  private valueSelectedSubscription = Subscription.EMPTY;

  constructor() {
    if (!this.dateAdapter) {
      throw Error(
        'NgxMatDatetimePanel: no DateAdapter provided. Provide one in your app ' +
          '(e.g. `provideNativeDateAdapter()`, or `MomentDateAdapter` from `@angular/material-moment-adapter`).',
      );
    }
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    this.panel.registerConnectedOrigin(this.elementRef.nativeElement);
    this.valueSelectedSubscription = this.panel.valueSelected.subscribe((date) => this.commitValue(date));
    this.panel.writeSelected(this.value);
    this.renderValue();
  }

  ngOnDestroy(): void {
    this.valueSelectedSubscription.unsubscribe();
  }

  writeValue(value: D | null): void {
    this.value = value;
    this.panel?.writeSelected(value);
    this.renderValue();
  }

  registerOnChange(fn: (value: D | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  protected onFocus(): void {
    if (this.openOnFocus && !this.disabled && !this.panel.isRestoringFocus) {
      this.panel.open();
    }
  }

  protected onBlur(event: FocusEvent): void {
    this.onTouched();
    this.blurred.emit(event);
  }

  private commitValue(date: D): void {
    if (this.dateAdapter && ((this.min && compareDateTime(this.dateAdapter, date, this.min) < 0) ||
        (this.max && compareDateTime(this.dateAdapter, date, this.max) > 0))) {
      return;
    }
    this.value = date;
    this.renderValue();
    this.onChange(date);
    this.dateChange.emit(date);
  }

  private renderValue(): void {
    this.elementRef.nativeElement.value = this.value !== null ? this.panel.formatValue(this.value) : '';
  }
}
