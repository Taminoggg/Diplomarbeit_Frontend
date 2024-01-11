import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { ApiModule, BASE_PATH } from './shared/swagger';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@ngneat/transloco';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    importProvidersFrom(ApiModule),
    { provide: BASE_PATH, useValue: environment.apiRoot },
    provideAnimations(),
    provideAnimations(),
    provideAnimations(), provideHttpClient(), provideTransloco({
        config: { 
          availableLangs: ['en', 'de', 'pl'],
          defaultLang: 'de',
          reRenderOnLangChange: true,
          prodMode: !isDevMode(),
        },
        loader: TranslocoHttpLoader
      })
]
};

console.log('Based on Angular17 Template v17.0.4 [2023-11-22]');
