//
//   Copyright 2026 Deutsches Zentrum für Luft- und Raumfahrt e.V.
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//

import {
    enableProdMode,
    inject,
    LOCALE_ID,
    provideAppInitializer,
    provideZoneChangeDetection,
} from '@angular/core';
import {environment} from './environments/environment';
import {IAppConfig} from './app/shared/services/IAppConfig';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent, setBasePath} from 'src/app/app.component';
import {APP_CONFIG} from './app/app.constants';
import {BASE_PATH} from 'src/app/shared/services/camunda-api';
import {ConfigService} from 'src/app/shared/services/config.service';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {AuthenticationInterceptor} from 'src/app/interceptors/authentication.interceptor';
import {providePrimeNG} from 'primeng/config';
import {MessageService} from 'primeng/api';
import {provideAnimations} from '@angular/platform-browser/animations';
import {PrimeNgTheme} from 'src/app/utils/theme/PrimePresets';
import {provideRouter} from '@angular/router';
import {routes} from 'src/app/app-routing.module';

function initializeApp(): Promise<any> {
    const ignore = inject(ConfigService);
    return new Promise((resolve) => {
        resolve(true);
    });
}
fetch('/assets/config.json')
    .then((response) => response.json())
    .then((config: IAppConfig) => {
        if (environment.production) {
            enableProdMode();
        }
        bootstrapApplication(AppComponent, {
            providers: [
                {provide: LOCALE_ID, useValue: 'de-DE'},
                {provide: APP_CONFIG, useValue: config},
                provideAppInitializer(() => initializeApp()),
                {
                    provide: BASE_PATH,
                    useFactory: setBasePath,
                    deps: [ConfigService],
                    multi: false,
                },
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: AuthenticationInterceptor,
                    multi: true,
                },
                provideRouter(routes),
                provideHttpClient(withInterceptorsFromDi()),
                providePrimeNG(PrimeNgTheme),
                MessageService, //MessageService used for primeNG Toasts (https://primeng.org/toast)
                //FIXME Angular21 migration - added this for older zoneChangeDetection
                provideZoneChangeDetection({eventCoalescing: true}),
                //FIXME ProvideAnimations deprecated, used by clarity, resulting in errors for those parts
                //FIX: remove clarity or update?
                provideAnimations(),
            ],
        })
            .catch((err) => {
                console.error(err);
            })
            .then(() => {});

        // deprecated version
        // platformBrowser([{provide: APP_CONFIG, useValue: config}])
        //     .bootstrapModule(AppModule)
        //     .catch((err) => console.error(err));
    });
