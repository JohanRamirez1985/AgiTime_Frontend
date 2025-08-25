import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { importProvidersFrom, LOCALE_ID } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { App } from './app/app';
import { routes } from './app/app.routes';
import { MatDialogModule } from '@angular/material/dialog';

// 👇 para que funcione MatDatepicker
import { provideNativeDateAdapter } from '@angular/material/core';

// 👇 importar y registrar locale español
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs);

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    importProvidersFrom(
      BrowserAnimationsModule,
      MatDialogModule
    ),
    { provide: LOCALE_ID, useValue: 'es-CO' }, // idioma y formato local
    provideNativeDateAdapter() // 👈 necesario para MatDatepicker
  ]
}).catch(err => console.error(err));