import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MAT_MOMENT_DATE_FORMATS, provideMomentDateAdapter } from '@angular/material-moment-adapter';
import moment, { Moment } from 'moment';
import {
  NgxMatDatetimePanelComponent,
  NgxMatDatetimePanelInputDirective,
  NgxMatDatetimePanelToggleComponent,
} from 'ngx-mat-datetime-panel';

/**
 * Proves `ngx-mat-datetime-panel` is generic over `DateAdapter<D>`: this example provides
 * `MomentDateAdapter` (`D = Moment`) LOCALLY, at this component only — the library itself
 * never imports `moment` or `@angular/material-moment-adapter`, only the demo does, as a
 * devDependency, to exercise this.
 */
@Component({
  selector: 'app-moment-adapter',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    NgxMatDatetimePanelComponent,
    NgxMatDatetimePanelInputDirective,
    NgxMatDatetimePanelToggleComponent,
  ],
  providers: [provideMomentDateAdapter(MAT_MOMENT_DATE_FORMATS)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './moment-adapter.component.html',
})
export class MomentAdapterExampleComponent {
  protected readonly control = new FormControl<Moment | null>(moment());
}
