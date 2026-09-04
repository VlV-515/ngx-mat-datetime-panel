import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
  booleanAttribute,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TemplatePortal } from '@angular/cdk/portal';
import { DateAdapter, MAT_DATE_FORMATS, MatDateFormats } from '@angular/material/core';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { NgxDatetimePanelBase } from '../core/datetime-panel-base';
import { provideNgxDatetimePanelDateFallbacks } from '../core/date-format-providers';
import { formatDateTimeValue } from '../core/datetime.util';
import { NgxDateTimeRange, NgxDatetimePanelGranularity, NgxDatetimePanelPanelBase, NgxDatetimeRangeEndpoint } from '../core/types';
import { NgxDatetimeRangePanelContentComponent } from '../panel-content/datetime-range-panel-content.component';

const EMPTY_RANGE = { start: null, end: null };

/**
 * The range datetime panel: `<ngx-mat-datetime-range-panel #rangePicker>`. Same overlay/CDK
 * machinery as the single panel, but its content adds the "Desde | Hasta" segmented control.
 */
@Component({
  selector: 'ngx-mat-datetime-range-panel',
  standalone: true,
  imports: [NgxDatetimeRangePanelContentComponent],
  providers: [provideNgxDatetimePanelDateFallbacks()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'ngxMatDatetimeRangePanel',
  templateUrl: './datetime-range-panel.component.html',
  styleUrl: './datetime-range-panel.component.scss',
})
export class NgxMatDatetimeRangePanelComponent<D> extends NgxDatetimePanelBase implements NgxDatetimePanelPanelBase, OnDestroy {
  private readonly dateAdapter = inject<DateAdapter<D>>(DateAdapter);
  private readonly dateFormats = inject<MatDateFormats>(MAT_DATE_FORMATS);

  @ViewChild(TemplateRef, { static: true }) private readonly templateRef!: TemplateRef<unknown>;

  @Input() startView: 'month' | 'year' | 'multi-year' = 'month';
  @Input() granularity: NgxDatetimePanelGranularity = 'datetime';
  @Input() showSeconds = false;
  @Input() timeStep = 1;
  @Input() dateFilter?: (date: D) => boolean;
  @Input() dateClass: MatCalendarCellClassFunction<D> = () => '';
  @Input() panelClass?: string | string[];
  @Input() restoreFocus = true;
  @Input({ transform: booleanAttribute }) showActionButtons = false;
  @Input() minDate: D | null = null;
  @Input() maxDate: D | null = null;
  @Input() disabled = false;
  @Input() startEndpointLabel = 'Desde';
  @Input() endEndpointLabel = 'Hasta';
  @Input() activeEndpoint: NgxDatetimeRangeEndpoint = 'start';

  @Output() readonly activeEndpointChange = new EventEmitter<NgxDatetimeRangeEndpoint>();
  @Output() readonly opened = new EventEmitter<void>();
  @Output() readonly closed = new EventEmitter<void>();

  /** Internal channel: the `[ngxMatDatetimeRangePanel]` input directive subscribes to this for value commits. */
  readonly valueSelected = new EventEmitter<NgxDateTimeRange<D>>();

  protected value: NgxDateTimeRange<D> = { ...EMPTY_RANGE };
  private connectedOrigin: HTMLElement | null = null;

  constructor() {
    super();
    this.panelClosed.pipe(takeUntilDestroyed()).subscribe(() => this.closed.emit());
  }

  /** Called by the `[ngxMatDatetimeRangePanel]` input directive once, in its `ngOnInit`, so `open()` knows where to anchor the overlay. */
  registerConnectedOrigin(origin: HTMLElement): void {
    this.connectedOrigin = origin;
  }

  open(): void {
    if (this.isOpen || !this.connectedOrigin) {
      return;
    }
    this.openOverlay(this.connectedOrigin, new TemplatePortal(this.templateRef, this.viewContainerRef), {
      panelClass: this.panelClass,
      restoreFocus: this.restoreFocus,
    });
    this.opened.emit();
  }

  close(): void {
    this.closeOverlay();
  }

  /** Called by the input directive whenever the bound `FormControl`/`ngModel` value changes externally. */
  writeSelected(value: NgxDateTimeRange<D> | null): void {
    this.value = value ?? { ...EMPTY_RANGE };
  }

  /** Formats `value` for the triggering `<input>`'s text — see `NgxMatDatetimePanelComponent.formatValue` for why this lives here. */
  formatValue(value: NgxDateTimeRange<D>): string {
    if (!value.start && !value.end) {
      return '';
    }
    const format = (date: D | null) =>
      date ? formatDateTimeValue(this.dateAdapter, this.dateFormats, date, this.granularity, this.showSeconds) : '…';
    return `${format(value.start)} – ${format(value.end)}`;
  }

  protected onContentValueChange(value: NgxDateTimeRange<D>): void {
    this.value = value;
    this.valueSelected.emit(value);
  }

  protected onActiveEndpointChange(endpoint: NgxDatetimeRangeEndpoint): void {
    this.activeEndpoint = endpoint;
    this.activeEndpointChange.emit(endpoint);
  }

  ngOnDestroy(): void {
    this.destroyOverlay();
  }
}
