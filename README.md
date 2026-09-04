# ngx-mat-datetime-panel

[![npm version](https://img.shields.io/npm/v/ngx-mat-datetime-panel.svg)](https://www.npmjs.com/package/ngx-mat-datetime-panel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Angular](https://img.shields.io/badge/Angular-20-dd0031.svg)](https://angular.dev)

A compact, **single-view** date + time picker for **Angular Material 20+**.

Calendar and a digital hour/minute spinner sit in **one panel at the same time** — never a
multi-step wizard, never a dropdown/autocomplete-style time list. Built-in **range mode** from
v1, with a "Desde | Hasta" segmented control in the same panel. Generic over `DateAdapter<D>` —
works with the native `Date` adapter, `MomentDateAdapter`, or any other Angular Material date
adapter. **Zero dependency on `moment`, `date-fns`, or `luxon`.**

It replaces the abandoned [`@mat-datetimepicker/core`](https://github.com/h2qutc/angular-material-components)
family for apps on Angular 20+ — a fresh implementation, not a fork, and not affiliated with it.

## Why

Angular Material's own `MatDatepicker` only picks a date, and `MatTimepicker`
(`@angular/material/timepicker`, 19+) picks a time as a dropdown/autocomplete list. Neither
covers "pick a date **and** a time in one compact interaction," and the community package that
used to fill that gap doesn't support Angular 20. This library is that gap, filled from
scratch: one panel, one interaction, calendar and time together.

## Features

- **One panel, no wizard** — calendar grid (via Material's own `MatCalendar`) and a digital
  hour/minute/[second] spinner, visible together.
- **Real spinner, not a dropdown** — chevron-up, editable digit, chevron-down per unit; mouse,
  click-and-hold-free wrap (0↔23h, 0↔59min/sec), and full keyboard support (arrows, Page Up/Down,
  Home/End, typing digits directly).
- **Range mode built in** — a "Desde | Hasta" segmented control switches which endpoint of the
  range is being edited, sharing the same calendar and spinner. Cross-field validation (`end >=
  start`) runs automatically as an Angular `Validator`.
- **Fully generic over `DateAdapter<D>`** — the exact same mechanism `MatDatepicker` uses. Bring
  `NativeDateAdapter`, `MomentDateAdapter`, or your own; the library never imports a date
  library itself.
- **Standard Angular Forms integration** — `ControlValueAccessor` via the modern self-registering
  pattern (`inject(NgControl)`), works with `formControl`/`ngModel` like any other input.
- **Zero runtime dependencies** beyond `tslib` — peer dependencies only
  (`@angular/{core,common,cdk,material}`).
- **Themeable** — Sass `theme()`/`color()`/`typography()` mixins in the same style as Angular
  Material's own components, backed by CSS custom properties.

## Packages in this workspace

| Path | What it is |
|---|---|
| [`projects/ngx-mat-datetime-panel`](projects/ngx-mat-datetime-panel) | The publishable library. See [its README](projects/ngx-mat-datetime-panel/README.md) for install instructions, the full API reference, and theming docs. |
| [`projects/demo`](projects/demo) | A demo/showcase app exercising the library: a basic single-value example, a range example, and a `MomentDateAdapter` example proving the library's genericity. |

## Quick taste

```ts
import { NgxMatDatetimePanelComponent, NgxMatDatetimePanelInputDirective, NgxMatDatetimePanelToggleComponent } from 'ngx-mat-datetime-panel';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, NgxMatDatetimePanelComponent, NgxMatDatetimePanelInputDirective, NgxMatDatetimePanelToggleComponent],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>Pick a date &amp; time</mat-label>
      <input matInput readonly [ngxMatDatetimePanel]="picker" [formControl]="control" />
      <ngx-mat-datetime-panel-toggle matSuffix [for]="picker" />
    </mat-form-field>
    <ngx-mat-datetime-panel #picker />
  `,
})
export class MyComponent {
  control = new FormControl<Date | null>(new Date());
}
```

See the [library README](projects/ngx-mat-datetime-panel/README.md) for the range-mode example,
full API tables, and theming guide.

## Development

```bash
npm install
npm run build:lib   # builds the library into dist/ngx-mat-datetime-panel
npm run demo        # serves the demo app (rebuild the library first to pick up lib changes)
npm test            # runs the library's Jest suite
```

## Versioning

The package's major version tracks the Angular major it targets — `20.x.x` for Angular 20,
mirroring how Angular Material itself is versioned. Support for a future Angular major (21+)
or an older one will live on its own branch, publishing under its own npm major, rather than
one codebase trying to serve multiple Angular majors' APIs at once.

## Publishing

Bump the `version` field in **both** `package.json` (root) and
`projects/ngx-mat-datetime-panel/package.json` first, then:

```bash
npm run publish:lib
```

Equivalent to running manually:

```bash
npm run build:lib
cd dist/ngx-mat-datetime-panel
npm publish --access public
```

## Contributing

Issues and pull requests welcome. Please run `npm test` and `npm run build:lib` before
submitting.

## License

MIT — see [LICENSE](LICENSE).
