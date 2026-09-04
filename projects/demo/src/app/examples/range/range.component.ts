import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  NgxDateTimeRange,
  NgxMatDatetimeRangePanelComponent,
  NgxMatDatetimeRangePanelInputDirective,
  NgxMatDatetimePanelToggleComponent,
} from 'ngx-mat-datetime-panel';

@Component({
  selector: 'app-range',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    JsonPipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    NgxMatDatetimeRangePanelComponent,
    NgxMatDatetimeRangePanelInputDirective,
    NgxMatDatetimePanelToggleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './range.component.html',
})
export class RangeExampleComponent {
  protected readonly control = new FormControl<NgxDateTimeRange<Date> | null>({ start: null, end: null });
}
