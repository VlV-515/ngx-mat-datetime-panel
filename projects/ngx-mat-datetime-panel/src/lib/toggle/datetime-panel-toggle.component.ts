import { ChangeDetectionStrategy, Component, Input, booleanAttribute } from '@angular/core';
import { NgxDatetimePanelPanelBase } from '../core/types';

/**
 * Toggle button that opens/closes any panel implementing `NgxDatetimePanelPanelBase` — works
 * with both `NgxMatDatetimePanelComponent` and `NgxMatDatetimeRangePanelComponent`, the same
 * way `mat-datepicker-toggle`'s `[for]` accepts either a plain or range Material datepicker.
 */
@Component({
  selector: 'ngx-mat-datetime-panel-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './datetime-panel-toggle.component.html',
  styleUrl: './datetime-panel-toggle.component.scss',
  host: {
    class: 'ngx-mat-datetime-panel-toggle',
  },
})
export class NgxMatDatetimePanelToggleComponent {
  @Input({ required: true }) for!: NgxDatetimePanelPanelBase;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input('aria-label') ariaLabel = 'Open date time panel';

  protected onClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled) {
      return;
    }
    this.for.isOpen ? this.for.close() : this.for.open();
  }
}
