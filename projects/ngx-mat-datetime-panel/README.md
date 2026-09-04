# ngx-mat-datetime-panel

A compact, single-view date + time picker for **Angular Material 20+**.

Calendar and a digital hour/minute spinner sit in **one panel at the same time** — never a
multi-step wizard, never a dropdown/autocomplete-style time list. Built-in **range mode** from
v1, with a "Desde | Hasta" segmented control in the same panel. Generic over
[`DateAdapter<D>`](https://material.angular.io/components/datepicker/overview#choosing-a-date-implementation-and-date-format-settings) —
works with the native `Date` adapter, `MomentDateAdapter`, or any other Angular Material date
adapter. **Zero dependency on `moment`, `date-fns`, or `luxon`.**

Replaces the abandoned [`@mat-datetimepicker/core`](https://github.com/h2qutc/angular-material-components)
family for apps on Angular 20+ — a fresh implementation, not a fork.

## Requirements

- **Node.js** `^20.19.0 || ^22.12.0 || >=24.0.0` (same range Angular 20 itself requires).
- An existing **Angular 20** app or workspace, generated with `ng new`/`ng generate application`
  on `@angular/cli@^20.0.0`.
- **Angular Material 20** already added — `ng add @angular/material` (this gives you
  `@angular/material` and `@angular/cdk`, both required peers).
- A `DateAdapter<D>` provided somewhere in your app (see below) — this library doesn't ship one.

If you're targeting an older or newer Angular major, see [Versioning](#versioning) in the
[workspace README](../../README.md) — this package's major version tracks Angular's.

## Install

```bash
npm install ngx-mat-datetime-panel
```

Peer dependencies (already in any Angular Material 20 app): `@angular/core`, `@angular/common`,
`@angular/cdk`, `@angular/material`, all `^20.0.0`. `npm install` will refuse to resolve these
if your app is on a different Angular major — that's intentional, see Versioning above.

You also need a `DateAdapter<D>` provided in your app — the same one `MatDatepicker` uses:

```ts
// app.config.ts
import { provideNativeDateAdapter } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [provideNativeDateAdapter(), /* ... */],
};
```

## Quick start — single value

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

`control.value` is a plain `D` (e.g. `Date`) — no wrapper object.

## Quick start — range

```ts
import { NgxDateTimeRange, NgxMatDatetimeRangePanelComponent, NgxMatDatetimeRangePanelInputDirective, NgxMatDatetimePanelToggleComponent } from 'ngx-mat-datetime-panel';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, NgxMatDatetimeRangePanelComponent, NgxMatDatetimeRangePanelInputDirective, NgxMatDatetimePanelToggleComponent],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>Pick a range</mat-label>
      <input matInput readonly [ngxMatDatetimeRangePanel]="rangePicker" [formControl]="control" />
      <ngx-mat-datetime-panel-toggle matSuffix [for]="rangePicker" />
    </mat-form-field>
    <ngx-mat-datetime-range-panel #rangePicker />
  `,
})
export class MyComponent {
  control = new FormControl<NgxDateTimeRange<Date> | null>({ start: null, end: null });
}
```

The "To >= From" check runs automatically (via `Validator`, using `DateAdapter` comparisons) and
surfaces as `control.errors['ngxDateRangeInvalid']`.

The range panel guides you linearly: pick "Desde", the panel header reads **Desde**; with
`showActionButtons`, a **Siguiente** button advances to **Hasta** (same panel, same calendar and
spinner). On the **Hasta** step you get **Atrás**/**Aceptar**. The Desde/Hasta segmented control
stays available the whole time if you want to jump between endpoints directly instead.

## API

### `<ngx-mat-datetime-panel>` / `<ngx-mat-datetime-range-panel>`

| Input | Type | Default | Notes |
|---|---|---|---|
| `granularity` | `'date' \| 'datetime' \| 'time'` | `'datetime'` | `'date'` hides the spinner, `'time'` hides the calendar |
| `showSeconds` | `boolean` | `false` | Adds a third spinner column |
| `timeStep` | `number` | `1` | Minute/second increment step |
| `startView` | `'month' \| 'year' \| 'multi-year'` | `'month'` | Forwarded to the embedded `MatCalendar` |
| `minDate` / `maxDate` | `D \| null` | `null` | Forwarded to `MatCalendar` |
| `dateFilter` | `(date: D) => boolean` | — | Forwarded to `MatCalendar` |
| `showActionButtons` | `boolean` | `false` | Adds an "Ahora / Aceptar" footer instead of pure live-binding |
| `restoreFocus` | `boolean` | `true` | Restores focus to the triggering input on close |
| `panelClass` | `string \| string[]` | — | CSS class(es) on the overlay pane |

Range panel adds `startEndpointLabel`/`endEndpointLabel` (default "Desde"/"Hasta") and
`activeEndpoint: 'start' | 'end'` (two-way bindable).

### `[ngxMatDatetimePanel]` / `[ngxMatDatetimeRangePanel]`

Applied to an `<input>`. `ControlValueAccessor` — value is `D | null` (single) or
`NgxDateTimeRange<D> | null` (range). Inputs: `min`, `max`, `disabled`, `openOnFocus` (default
`true`). Outputs: `dateChange`/`dateRangeChange`, `blurred`.

### `<ngx-mat-datetime-panel-toggle [for]="picker">`

Works with either panel type.

## Usage inside a custom form-field wrapper

If you wrap `input[ngxMatDatetimePanel]` inside your own reusable component (e.g. an
`<app-datetime-field>` that also renders `<mat-label>`/`<mat-error>`), `NgControl`/error-state
lives on **your wrapper's host**, not on the inner `<input>` — so `<mat-error>` inside the
wrapper won't automatically pick up the inner control's validity. This is inherent to Angular
Forms (the same thing happens if you wrap `matInput` itself), not something this library can fix
without implementing the heavier `MatFormFieldControl` interface. Workaround: bind an error
hint manually, e.g. `<mat-hint *ngIf="control.invalid && control.touched">...</mat-hint>`.

## Theming

```scss
@use 'ngx-mat-datetime-panel/theming' as ngx-datetime-panel;

@include ngx-datetime-panel.theme($my-angular-material-theme);
```

Or override the underlying CSS custom properties directly (`--ngx-mat-datetime-panel-*`) —
see `theming.scss` for the full list. The embedded calendar already themes itself through
Material's own `--mat-datepicker-*`/`--mat-calendar-*` variables.

## License

MIT
