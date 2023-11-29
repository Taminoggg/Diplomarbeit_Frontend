import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { ApiModule, BASE_PATH } from './shared/swagger';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    importProvidersFrom(ApiModule),
    { provide: BASE_PATH, useValue: environment.apiRoot },
    provideAnimations(),
    provideAnimations()
]
};

console.log('Based on Angular17 Template v17.0.4 [2023-11-22]');
