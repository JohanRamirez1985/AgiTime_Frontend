import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http'; // 👈 IMPORTANTE

import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { App } from './app/app';
import { routes } from './app/app.routes';
import { MatDialogModule } from '@angular/material/dialog';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    importProvidersFrom(
      BrowserAnimationsModule,
      CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
      MatDialogModule 
    )
  ]
}).catch(err => console.error(err));
