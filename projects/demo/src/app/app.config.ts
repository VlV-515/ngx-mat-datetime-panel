import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

// Mirrors a real-world app-level date-format config: custom locale + formats provided once at
// the root, which `ngx-mat-datetime-panel` must respect via its `MAT_DATE_LOCALE`/`MAT_DATE_FORMATS`
// fallback (see `provideNgxDatetimePanelDateFallbacks` in the library).
const DEMO_DATE_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
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
