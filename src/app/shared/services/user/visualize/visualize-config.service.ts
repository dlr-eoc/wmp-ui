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

import {inject, Injectable} from '@angular/core';
import {ConfigService} from 'src/app/shared/services/config.service';
import {
    VISUAL_CONFIGURATION_TYPE,
    VisualConfiguration,
    VISUALIZE_CONFIG_DUMMY,
} from 'src/app/shared/services/user/models/VisualizeConfigData';
import {Observable, Subject} from 'rxjs';
import {
    getInfoVisualConfig,
    getTableVisualConfig,
} from 'src/app/shared/services/user/visualize/VisualizeConfigUtils';
import {VisualizeConfigHandler} from 'src/app/shared/services/user/visualize/VisualizeConfigHandler';

@Injectable({
    providedIn: 'root',
})
export class VisualizeConfigService {
    // private httpClient = inject(HttpClient);
    private configService = inject(ConfigService);

    private _apiUrl: string;
    private config: Map<VISUAL_CONFIGURATION_TYPE, VisualConfiguration | undefined>;
    private _config$: Subject<VisualizeConfigHandler> = new Subject();

    constructor() {
        this._apiUrl = this.configService.settings.jakartaURL;
        this.config = new Map();
    }

    get config$(): Observable<VisualizeConfigHandler> {
        return this._config$.asObservable();
    }

    async updateConfigForPage(pageName: string) {
        const params = {} as any;
        params['pageIdentifier'] = pageName;
        //TODO visual configuration activate the backend call if configurations available

        // return lastValueFrom(
        //     this.httpClient.get<Map<VISUAL_CONFIGURATION_TYPE, VisualConfiguration>>(
        //         `${this._apiUrl}/wmp/visualization/config`,
        //         {
        //             params,
        //         },
        //     ),
        // )
        //     .then((valueAsObjectFromJson) => {
        //     this.config = this.convertToMap(valueAsObjectFromJson);
        //     this._config$.next(new VisualizeConfigHandler(this.config));
        // });

        //FIXME visual configuration currently using dummy config
        this.config = VISUALIZE_CONFIG_DUMMY.configurations;
        this._config$.next(new VisualizeConfigHandler(this.config));
        return this.config;
    }

    private convertToMap(value: Map<VISUAL_CONFIGURATION_TYPE, VisualConfiguration>) {
        //convert to real maps
        const basicContentAsMap = new Map<VISUAL_CONFIGURATION_TYPE, VisualConfiguration | undefined>(
            Object.entries(value) as [VISUAL_CONFIGURATION_TYPE, VisualConfiguration][],
        );
        const tableConfigAsMap = getTableVisualConfig(basicContentAsMap);
        basicContentAsMap.set(VISUAL_CONFIGURATION_TYPE.TABLE, tableConfigAsMap);
        const infoVisualConfig = getInfoVisualConfig(basicContentAsMap);
        basicContentAsMap.set(VISUAL_CONFIGURATION_TYPE.INFO, infoVisualConfig);

        return basicContentAsMap;
    }
}
