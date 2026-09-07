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
import {ApiCustomService} from 'src/app/shared/services/wmp-api/custom/api-custom-service';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from 'src/app/shared/services/config.service';
import {HistoricProcessInstanceDto} from 'src/app/shared/services/camunda-api';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class OperatonInstanceService extends ApiCustomService {
    private httpClient = inject(HttpClient);
    private configService: ConfigService;

    constructor() {
        const configService = inject(ConfigService);

        super(configService.settings.jakartaURL + '/engine/default', configService.settings.jakartaURL);

        this.configService = configService;
    }

    getProcessInstancesWithBusinessKey(businessKey: string): Observable<Array<HistoricProcessInstanceDto>> {
        const params = {} as any;
        params.sortBy = 'startTime';
        params.sortOrder = 'desc';
        params.processInstanceBusinessKey = businessKey;

        return this.httpClient.get<Array<HistoricProcessInstanceDto>>(
            `${this.baseUrl}/history/process-instance`,
            {
                params,
            },
        );
    }

    async restartAtActivityId(processInstanceId: string, activityId: string) {
        return this.httpClient.post(`${this.baseUrl}/process-instance/${processInstanceId}/modification`, {
            skipCustomListeners: true,
            skipIoMappings: true,
            instructions: [
                {
                    type: 'startBeforeActivity', // or "startAfterActivity"
                    activityId: activityId,
                },
            ],
            //important if currently a token present
            cancelCurrentActivity: true,
        });
    }
}
