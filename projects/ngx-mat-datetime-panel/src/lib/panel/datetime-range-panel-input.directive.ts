import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, booleanAttribute, inject } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NgControl, ValidationErrors, Validator } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { Subscription } from 'rxjs';
import { ngxDatetimeRangeValidator } from '../core/datetime-range.validators';
import { NgxDateTimeRange } from '../core/types';
import { NgxMatDatetimeRangePanelComponent } from './datetime-range-panel.component';

/**
 * Opens a `NgxMatDatetimeRangePanelComponent` from an `<input>` and binds it as a
 * `NgxDateTimeRange<D> | null` `ControlValueAccessor` + `Validator` — the "To >= From" check
 * (via `ngxDatetimeRangeValidator`, itself built on `DateAdapter` comparisons) runs
 * automatically and surfaces as `control.errors['ngxDateRangeInvalid']`, no extra wiring needed.
 */
@Directive({
  selector: 'input[ngxMatDatetimeRangePanel]',
  standalone: true,
  host: {
    class: 'ngx-mat-datetime-panel-input',
    'autocomplete': 'off',
    '[attr.disabled]': 'disabled ? "" : null',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur($event)',
  },
})
export class NgxMatDatetimeRangePanelInputDirective<D> implements ControlValueAccessor, Validator, OnInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly dateAdapter = inject<DateAdapter<D>>(DateAdapter, { optional: true });

  @Input('ngxMatDatetimeRangePanel') panel!: NgxMatDatetimeRangePanelComponent<D>;
  @Input() min: D | null = null;
  @Input() max: D | null = null;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input({ transform: booleanAttribute }) openOnFocus = true;

  @Output() readonly dateRangeChange = new EventEmitter<NgxDateTimeRange<D> | null>();
  @Output() readonly blurred = new EventEmitter<FocusEvent>();

  private value: NgxDateTimeRange<D> | null = null;
  private onChange: (value: NgxDateTimeRange<D> | null) => void = () => {};
  private onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};
  private valueSelectedSubscription = Subscription.EMPTY;

  constructor() {
    if (!this.dateAdapter) {
      throw Error(
        'NgxMatDatetimeRangePanel: no DateAdapter provided. Provide one in your app ' +
          '(e.g. `provideNativeDateAdapter()`, or `MomentDateAdapter` from `@angular/material-moment-adapter`).',
      );
    }
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    this.panel.registerConnectedOrigin(this.elementRef.nativeElement);
    this.valueSelectedSubscription = this.panel.valueSelected.subscribe((range) => this.commitValue(range));
    this.panel.writeSelected(this.value);
    this.renderValue();
  }

  ngOnDestroy(): void {
    this.valueSelectedSubscription.unsubscribe();
  }

  writeValue(value: NgxDateTimeRange<D> | null): void {
    this.value = value;
    this.panel?.writeSelected(value);
    this.renderValue();
  }

  registerOnChange(fn: (value: NgxDateTimeRange<D> | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  validate(control: AbstractControl<NgxDateTimeRange<D> | null>): ValidationErrors | null {
    return this.dateAdapter ? ngxDatetimeRangeValidator(this.dateAdapter)(control) : null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
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

  private commitValue(range: NgxDateTimeRange<D>): void {
    this.value = range;
    this.renderValue();
    this.onChange(range);
    this.onValidatorChange();
    this.dateRangeChange.emit(range);
  }

  private renderValue(): void {
    this.elementRef.nativeElement.value = this.panel.formatValue(this.value ?? { start: null, end: null });
  }
}
