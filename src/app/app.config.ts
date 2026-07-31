import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
<<<<<<< HEAD
import { provideHttpClient } from '@angular/common/http';
=======
>>>>>>> 78eb154bd8c4728a50739bcb65e474a31627bd34
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
<<<<<<< HEAD
    provideHttpClient(),
=======
>>>>>>> 78eb154bd8c4728a50739bcb65e474a31627bd34
    provideRouter(routes)
  ]
};
