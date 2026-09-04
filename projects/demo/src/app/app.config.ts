import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats, provideNativeDateAdapter } from '@angular/material/core';

// Mirrors a real-world app-level date-format config: custom locale + formats provided once at
// the root, which `ngx-mat-datetime-panel` must respect via its `MAT_DATE_LOCALE`/`MAT_DATE_FORMATS`
// fallback (see `provideNgxDatetimePanelDateFallbacks` in the library). `NativeDateAdapter`
// formats via `Intl.DateTimeFormat`, so these are `Intl.DateTimeFormatOptions`, not moment
// tokens — deliberately omits `timeInput` (older custom `MAT_DATE_FORMATS` configs often
// predate that field) to exercise the library's own "HH:mm" fallback formatting.
const DEMO_DATE_FORMATS: MatDateFormats = {
  parse: { dateInput: { day: 'numeric', month: 'numeric', year: 'numeric' } },
  display: {
    dateInput: { day: 'numeric', month: 'numeric', year: 'numeric' },
    monthYearLabel: { month: 'short', year: 'numeric' },
    dateA11yLabel: { day: 'numeric', month: 'long', year: 'numeric' },
    monthYearA11yLabel: { month: 'long', year: 'numeric' },
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-MX' },
    { provide: MAT_DATE_FORMATS, useValue: DEMO_DATE_FORMATS },
  ],
};
