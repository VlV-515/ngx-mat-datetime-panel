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
import { NgxDatetimePanelGranularity, NgxDatetimePanelPanelBase } from '../core/types';
import { NgxDatetimePanelContentComponent } from '../panel-content/datetime-panel-content.component';

/**
 * The single-value datetime panel: `<ngx-mat-datetime-panel #picker>`. Not rendered in place —
 * its content is teleported into a CDK overlay when opened by `[ngxMatDatetimePanel]`.
 */
@Component({
  selector: 'ngx-mat-datetime-panel',
  standalone: true,
  imports: [NgxDatetimePanelContentComponent],
  providers: [provideNgxDatetimePanelDateFallbacks()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'ngxMatDatetimePanel',
  templateUrl: './datetime-panel.component.html',
  styleUrl: './datetime-panel.component.scss',
})
export class NgxMatDatetimePanelComponent<D> extends NgxDatetimePanelBase implements NgxDatetimePanelPanelBase, OnDestroy {
  private readonly dateAdapter = inject<DateAdapter<D>>(DateAdapter);
  private readonly dateFormats = inject<MatDateFormats>(MAT_DATE_FORMATS);

  @ViewChild(TemplateRef, { static: true }) private readonly templateRef!: TemplateRef<unknown>;

  @Input() startAt: D | null = null;
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

  @Output() readonly opened = new EventEmitter<void>();
  @Output() readonly closed = new EventEmitter<void>();

  /** Internal channel: the `[ngxMatDatetimePanel]` input directive subscribes to this for value commits. */
  readonly valueSelected = new EventEmitter<D>();

  protected selected: D | null = null;
  private connectedOrigin: HTMLElement | null = null;

  constructor() {
    super();
    this.panelClosed.pipe(takeUntilDestroyed()).subscribe(() => this.closed.emit());
  }

  /** Called by the `[ngxMatDatetimePanel]` input directive once, in its `ngOnInit`, so `open()` knows where to anchor the overlay. */
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
  writeSelected(value: D | null): void {
    this.selected = value;
  }

  /**
   * Formats `value` for the triggering `<input>`'s text, using this panel's own (locally
   * resolved, app-fallback-aware) `MAT_DATE_LOCALE`/`MAT_DATE_FORMATS` — the input directive
   * itself is a template-variable sibling of the panel, not a DOM descendant, so it cannot see
   * the panel's local providers directly and delegates formatting here instead.
   */
  formatValue(value: D): string {
    return formatDateTimeValue(this.dateAdapter, this.dateFormats, value, this.granularity, this.showSeconds);
  }

  protected onContentSelected(date: D): void {
    this.selected = date;
    this.valueSelected.emit(date);
  }

  protected selectNow(): void {
    this.onContentSelected(this.dateAdapter.today());
  }

  ngOnDestroy(): void {
    this.destroyOverlay();
  }
}
