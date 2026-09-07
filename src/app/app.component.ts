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

import {registerLocaleData} from '@angular/common';
import localeDe from '@angular/common/locales/de';
import {Component} from '@angular/core';

import {ConfigService} from 'src/app/shared/services/config.service';
import {SharedModule} from 'src/app/shared/shared.module';
import {Toast} from 'primeng/toast';
import {TOAST_POSITION_BOTTOM_LEFT_KEY, TOAST_POSITION_BOTTOM_RIGHT_KEY} from './app.constants';

registerLocaleData(localeDe);

export function setBasePath(configService: ConfigService) {
    return configService.settings.jakartaURL + '/engine/default';
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    //TODO clarity cleanup after clarity got removed completely, shared module probably not needed anymore
    imports: [SharedModule, Toast],
})
export class AppComponent {
    constructor() {}
    protected readonly TOAST_POSITION_BOTTOM_RIGHT_KEY = TOAST_POSITION_BOTTOM_RIGHT_KEY;
    protected readonly TOAST_POSITION_BOTTOM_LEFT_KEY = TOAST_POSITION_BOTTOM_LEFT_KEY;
}
