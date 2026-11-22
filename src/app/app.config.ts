import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, TitleStrategy } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { authInterceptor } from './interceptors/auth.interceptor';
import { AppTitleStrategy } from './app-title.strategy';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        { provide: TitleStrategy, useClass: AppTitleStrategy },
        provideClientHydration(withEventReplay()),
        provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    ],
};
