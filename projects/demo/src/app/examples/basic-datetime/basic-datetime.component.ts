import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  NgxDatetimePanelGranularity,
  NgxMatDatetimePanelComponent,
  NgxMatDatetimePanelInputDirective,
  NgxMatDatetimePanelToggleComponent,
} from 'ngx-mat-datetime-panel';

@Component({
  selector: 'app-basic-datetime',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    NgxMatDatetimePanelComponent,
    NgxMatDatetimePanelInputDirective,
    NgxMatDatetimePanelToggleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './basic-datetime.component.html',
})
export class BasicDatetimeExampleComponent {
  protected readonly control = new FormControl<Date | null>(new Date());
  protected granularity: NgxDatetimePanelGranularity = 'datetime';
  protected showSeconds = false;
}
