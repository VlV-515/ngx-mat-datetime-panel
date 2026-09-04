import { Component } from '@angular/core';
import { BasicDatetimeExampleComponent } from './examples/basic-datetime/basic-datetime.component';
import { RangeExampleComponent } from './examples/range/range.component';
import { MomentAdapterExampleComponent } from './examples/moment-adapter/moment-adapter.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BasicDatetimeExampleComponent, RangeExampleComponent, MomentAdapterExampleComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
