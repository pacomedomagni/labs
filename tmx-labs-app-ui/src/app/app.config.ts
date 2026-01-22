import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideCui } from '@pgr-cla/core-ui-components';
import { provideNativeDateAdapter } from '@angular/material/core';
import { routes } from './app.routes';
import { AppLoadService } from './shared/services/configuration/config-load.service';
import { EnvConfigService } from './shared/services/configuration/env-config.service';
import { AppConfigService } from './shared/services/configuration/config.service';
import { provideHttpClient, withInterceptors, withJsonpSupport } from '@angular/common/http';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { loadingInterceptor } from './shared/services/http-interceptors/loading-interceptor';
import { errorInterceptor } from './shared/services/http-interceptors/error-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([loadingInterceptor, errorInterceptor]),
      withJsonpSupport()
    ),
    provideOAuthClient(),
    provideCui(),
    provideNativeDateAdapter(),
    provideAppInitializer(() => {
      const loadService = inject(AppLoadService);
      inject(EnvConfigService);
      inject(AppConfigService);
      return loadService.initializeApp();
    })
  ]
};

