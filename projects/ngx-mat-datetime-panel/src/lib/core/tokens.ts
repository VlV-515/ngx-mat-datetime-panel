import { InjectionToken } from '@angular/core';
import { NgxDatetimePanelGranularity } from './types';

export interface NgxDatetimePanelDefaultOptions {
  /** Default granularity for panels that don't set `[granularity]` explicitly. */
  granularity?: NgxDatetimePanelGranularity;
  /** Whether the time spinner shows a seconds column by default. */
  showSeconds?: boolean;
  /** Whether the panel opens automatically when its input is focused. */
  openOnFocus?: boolean;
}

/** App-wide defaults for every `ngx-mat-datetime-panel` in the injector tree. Optional — every option also has a per-panel input override. */
export const NGX_DATETIME_PANEL_DEFAULT_OPTIONS = new InjectionToken<NgxDatetimePanelDefaultOptions>(
  'NGX_DATETIME_PANEL_DEFAULT_OPTIONS',
);
