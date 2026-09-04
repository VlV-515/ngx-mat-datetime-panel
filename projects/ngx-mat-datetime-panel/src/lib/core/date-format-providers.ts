import { Optional, Provider, SkipSelf } from '@angular/core';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_NATIVE_DATE_FORMATS, MatDateFormats } from '@angular/material/core';

/**
 * Local `MAT_DATE_LOCALE`/`MAT_DATE_FORMATS` providers that fall back to whatever the app
 * already provided higher up the injector tree, and only default (`'en-US'` / native formats)
 * when nothing was found — so the panel never silently shadows an app-level configuration.
 */
export function provideNgxDatetimePanelDateFallbacks(): Provider[] {
  return [
    {
      provide: MAT_DATE_LOCALE,
      useFactory: (existing: string | null) => existing ?? 'en-US',
      deps: [[new Optional(), new SkipSelf(), MAT_DATE_LOCALE]],
    },
    {
      provide: MAT_DATE_FORMATS,
      useFactory: (existing: MatDateFormats | null) => existing ?? MAT_NATIVE_DATE_FORMATS,
      deps: [[new Optional(), new SkipSelf(), MAT_DATE_FORMATS]],
    },
  ];
}
