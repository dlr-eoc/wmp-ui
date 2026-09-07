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
import {HttpClient} from '@angular/common/http';
import {ConfigService} from 'src/app/shared/services/config.service';
import {ExternalTaskDto, HistoricIncidentDto} from 'src/app/shared/services/camunda-api';
import {ApiCustomService} from 'src/app/shared/services/wmp-api/custom/api-custom-service';
import {lastValueFrom} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class OperatonExternalTaskService extends ApiCustomService {
    private httpClient = inject(HttpClient);
    private configService: ConfigService;

    constructor() {
        const configService = inject(ConfigService);

        super(configService.settings.jakartaURL + '/engine/default', configService.settings.jakartaURL);

        this.configService = configService;
    }

    async getExternalTasks(incident: HistoricIncidentDto): Promise<ExternalTaskDto[]> {
        const processInstanceId = incident.processInstanceId;
        return lastValueFrom(
            this.httpClient.post<ExternalTaskDto[]>(`${this.baseUrl}/external-task`, {
                processInstanceId: processInstanceId,
            }),
        );
    }

    restartExternalTask(incidentToRestart: HistoricIncidentDto) {
        return lastValueFrom(
            this.httpClient.put(`${this.baseUrl}/external-task/${incidentToRestart.configuration}/retries`, {
                retries: 1,
            }),
        );
    }
}
