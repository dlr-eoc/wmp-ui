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

import {provideRouter} from '@angular/router';
import {APP_CONFIG} from 'src/app/app.constants';
import {MessageService} from 'primeng/api';
import {routes} from 'src/app/app-routing.module';

import {vi} from 'vitest';

const ResizeObserverMock = vi.fn(
    class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
    },
);

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

const IntersectionObserverMock = vi.fn(
    class {
        disconnect = vi.fn();
        observe = vi.fn();
        takeRecords = vi.fn();
        unobserve = vi.fn();
    },
);
//`IntersectionObserver` accessible with  `window.IntersectionObserver`
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

export function getCommonComponentTestProviders() {
    return [
        provideRouter(routes),
        {provide: APP_CONFIG, useValue: {}},
        {provide: MessageService, useValue: {}},
    ];
}
