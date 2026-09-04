# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

- Always use the local `caveman` skill in `ultra` mode for this project.

## What this is

`ngx-mat-datetime-panel` — an Angular CLI workspace (`ng generate library`) containing a
publishable Angular Material 20+ library plus a demo app. The library is a compact,
single-view date + time picker (calendar + digital time spinner in one overlay panel, with a
built-in "Desde/Hasta" range mode) that is fully generic over Angular Material's
`DateAdapter<D>` — it has **zero runtime dependency** on `moment`/`date-fns`/`luxon`, only
`tslib`. It replaces `@mat-datetimepicker/core` (unmaintained, no Angular 20 support).

The package's npm major version is pinned to track the Angular major it targets (`20.x.x` for
Angular 20 — same convention Angular Material itself uses). A future Angular major (or
supporting an older one) gets its own branch and its own npm major rather than one codebase
serving multiple Angular majors' APIs.

## Commands

```bash
npm install                # install workspace deps (root package.json)

npm run build:lib          # ng build ngx-mat-datetime-panel -> dist/ngx-mat-datetime-panel
npm run demo               # ng serve demo (rebuild the lib first to pick up library changes —
                            # the demo imports via a tsconfig path mapped to dist/, not the lib's
                            # TS sources, so there is no auto-relink/watch across the two)

npm test                   # jest (library unit tests only, see Testing below)
npm run test:watch         # jest --watch
npm run test:demo          # ng test demo (Karma/Jasmine, demo app only)

npx ng build ngx-mat-datetime-panel   # equivalent to build:lib, useful with extra flags
npx jest path/to/file.spec.ts         # run a single test file
npx jest -t "test name substring"     # run tests matching a name

cd dist/ngx-mat-datetime-panel && npm pack --dry-run   # sanity-check the publishable tarball
cd dist/ngx-mat-datetime-panel && npm publish --access public   # actual publish
```

There is no lint script configured yet.

## Architecture

### Workspace layout

- `projects/ngx-mat-datetime-panel/` — the publishable library. `src/public-api.ts` is the
  entry point; only what it re-exports is public. Everything under `src/lib/panel-content/`
  is intentionally internal (composition components, not exported).
- `projects/demo/` — a plain Angular app exercising the library live: `src/app/examples/`
  has `basic-datetime` (single value), `range`, and `moment-adapter` (proves the
  `DateAdapter<D>` genericity claim by providing `MomentDateAdapter` locally, as a devDependency
  of the demo only — never of the library).

### Library internals (`projects/ngx-mat-datetime-panel/src/lib/`)

- `core/` — the DateAdapter-generic foundation, no Angular Material UI:
  - `types.ts` — `NgxDateTimeRange<D>` (plain `{start, end}`, not CDK's frozen `DateRange`),
    `NgxDatetimePanelGranularity` (`'date' | 'datetime' | 'time'`), `NgxDatetimePanelPanelBase`
    (the `isOpen`/`open()`/`close()` contract both panel components implement, used by the
    toggle button's `[for]`).
  - `datetime.util.ts` — `compareDateTime()` (date first, then time, always via
    `DateAdapter.compareDate`/`compareTime`, never raw `Date`/moment comparison),
    `getTimeValue()`/`applyTimeValue()` (convert `D <-> {hour,minute,second}`),
    `formatDateTimeValue()` (falls back to a manual "HH:mm[:ss]" build when
    `MAT_DATE_FORMATS.display.timeInput` is missing — common in older custom format configs
    written before Material added that field), `wrapClamp()` (the spinner's wraparound math).
  - `datetime-range.validators.ts` — `ngxDatetimeRangeValidator()`, wired into the range input
    directive's `Validator` implementation; surfaces as `control.errors['ngxDateRangeInvalid']`.
  - `datetime-panel-base.ts` — `NgxDatetimePanelBase`, the abstract class both panel components
    extend for shared CDK Overlay orchestration (position, backdrop/Escape/detach-to-close,
    focus restore). Exposes `isRestoringFocus`: a guard flag set only during the synchronous
    `.focus()` call that restores focus to the triggering input on close — the input
    directives check it before auto-reopening on focus, otherwise `restoreFocus` + `openOnFocus`
    (both default `true`) fight each other into an open/reopen loop.
  - `date-format-providers.ts` — `provideNgxDatetimePanelDateFallbacks()`: local
    `MAT_DATE_LOCALE`/`MAT_DATE_FORMATS` providers that only supply a default when nothing was
    already provided higher up the injector tree (via a `SkipSelf`+`Optional` factory on the
    same token), so the panel never shadows an app-level config.
- `time-spinner/` — `NgxTimeSpinnerComponent` (public) composes three independent
  `NgxTimeSpinnerColumnComponent`s (internal, not exported). Fully decoupled from
  `DateAdapter` — operates on plain `{hour, minute, second}` numbers; the panel-content
  components own the `D <-> numbers` conversion. Each column wraps independently (no
  cascading — minute 59→0 does not bump the hour) and supports click, `ArrowUp/Down`,
  `PageUp/Down` (×5 step), `Home`/`End`, and direct digit typing.
- `panel-content/` — internal composition: `NgxDatetimePanelContentComponent` (calendar +
  spinner) and `NgxDatetimeRangePanelContentComponent` (same, plus the Desde/Hasta step). Both
  wrap `MatCalendar` directly rather than reimplementing date-grid/keyboard/locale logic.
- `panel/` — the public API surface: `NgxMatDatetimePanelComponent`/
  `NgxMatDatetimeRangePanelComponent` (the `<ngx-mat-datetime-panel>`/`<ngx-mat-datetime-range-panel>`
  components, not rendered in place — their content is teleported into the CDK overlay via a
  `TemplatePortal` built from their own `<ng-template>`) and their matching input directives
  (`NgxMatDatetimePanelInputDirective`/`NgxMatDatetimeRangePanelInputDirective`), which are
  separate, monomorphic `ControlValueAccessor`s (`D | null` vs `NgxDateTimeRange<D> | null`) —
  deliberately not one directive with a `mode` flag, matching how Material itself splits
  `MatDatepicker` from `MatDateRangePicker`. Both directives self-register via
  `inject(NgControl, {optional, self})` + `ctrl.valueAccessor = this`, not
  `NG_VALUE_ACCESSOR`/`forwardRef`. Each panel tracks its own `connectedOrigin` (registered by
  the directive in `ngOnInit`), so `open()` takes no arguments and the toggle button doesn't
  need to know the input element.
- `toggle/` — `NgxMatDatetimePanelToggleComponent`, works with either panel type since both
  implement `NgxDatetimePanelPanelBase`.

### Range panel UX flow

The range panel guides linearly rather than requiring the user to drive a segmented control:
selecting "Desde" and clicking the (opt-in, `showActionButtons`) primary button advances
`activeEndpoint` to `'end'` — it's labeled "Siguiente" on the Desde step, and
"Atrás"/"Aceptar" on the Hasta step. The Desde/Hasta `mat-button-toggle-group` stays visible
the whole time as a manual-jump escape hatch. A single `MatCalendar` and single
`NgxTimeSpinnerComponent` instance are reused for both endpoints — switching `activeEndpoint`
just changes which half of `NgxDateTimeRange<D>` feeds their inputs.

### Theming

`projects/ngx-mat-datetime-panel/theming.scss` (workspace root of the library project, not
under `src/`) exports `theme()`/`color()`/`typography()`/`density()`/`overrides()` mixins
mirroring Angular Material's own convention, backed by `--ngx-mat-datetime-panel-*` CSS custom
properties. It's shipped via `ng-package.json`'s `assets` array (not part of the TS entry
point), and reachable as `ngx-mat-datetime-panel/theming` only because `package.json` has a
**hand-written** `exports` map entry for it — `ng-packagr` generates the `"."` and
`"./package.json"` exports entries automatically and merges in whatever else is already in the
source `package.json`'s `exports`, so that hand-written entry must be preserved across any
`package.json` edits or the Sass import path breaks silently.

### Testing

Jest (not the CLI's default Karma/Jasmine) via `jest-preset-angular`, configured in
`jest.config.cjs` (root) — this only covers the library project (`roots` is scoped to
`projects/ngx-mat-datetime-panel`); the demo app still uses Karma (`npm run test:demo`).
Two non-obvious pieces make this work on Angular 20 + `jest-preset-angular@17`:

- `projects/ngx-mat-datetime-panel/setup-jest.ts` must call `setupZoneTestEnv()` explicitly —
  newer `jest-preset-angular` versions export the setup function rather than running it as an
  import side effect (unlike the old `jest-preset-angular/setup-jest` path from earlier
  versions, which no longer exists).
- `projects/ngx-mat-datetime-panel/tsconfig.spec.json` overrides `module` to `commonjs` for the
  Jest-only compile — the root `tsconfig.json` sets `"module": "preserve"` for the
  esbuild-based Angular CLI build, which `ts-jest`/`jest-preset-angular` cannot consume.

`src/lib/core/testing/fake-date-adapter.ts` provides a minimal hand-rolled `DateAdapter<FakeDate>`
(not a real Material adapter) for unit-testing `compareDateTime`/`ngxDatetimeRangeValidator`
without pulling in `NativeDateAdapter`/TestBed.
