import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { importProvidersFrom, LOCALE_ID } from '@angular/core'; // 👈 agregas LOCALE_ID
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { App } from './app/app';
import { routes } from './app/app.routes';
import { MatDialogModule } from '@angular/material/dialog';

// 👇 importar y registrar locale español
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs); // 👈 aquí se registra

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    importProvidersFrom(
      BrowserAnimationsModule,
      CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
      MatDialogModule
    ),
    { provide: LOCALE_ID, useValue: 'es-CO' } // 👈 aquí se define el idioma a usar
  ]
}).catch(err => console.error(err));