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
import {HistoricProcessInstance} from 'src/app/components/workflow-page/models/HistoricProcessInstance';
import {HistoricIncidentDto, HistoricProcessDefinitionService} from 'src/app/shared/services/camunda-api';
import {lastValueFrom} from 'rxjs';
import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';

@Injectable({
    providedIn: 'root',
})
export class OperatonProcessDefinitionService {
    private httpClient = inject(HttpClient);
    private configService = inject(ConfigService);
    private wmpApiService = inject(WmpApiService);
    private readonly historicProcessDefinitionService = inject(HistoricProcessDefinitionService);

    private baseUrl = '';
    private apiUrl = '';

    constructor() {
        this.apiUrl = this.configService.settings.jakartaURL;
        this.baseUrl = this.apiUrl + '/engine/default';
    }

    async restartProcessDefinition(
        instance: HistoricProcessInstance,
        incident: HistoricIncidentDto,
    ): Promise<void> {
        const instanceId = instance.id;
        const activityId = incident.activityId;
        const body = {
            instructions: [{type: 'startBeforeActivity', activityId: activityId}],
            processInstanceIds: [instanceId],
        };
        return new Promise(async (res) => {
            await lastValueFrom(
                this.httpClient.post(
                    `${this.baseUrl}/process-definition/${instance.processDefinitionId}/restart-async`,
                    body,
                ),
            );
            res();
        });
    }

    async getProcessDefinitionStatistics(processDefinitionId: string) {
        return await this.wmpApiService.getActivityStatisticsByProcessDefinitionId(processDefinitionId);
    }

    async getHistoricProcessDefinition(
        processDefinitionId: string | undefined,
        processDefinitionKey: string | undefined,
    ) {
        return this.historicProcessDefinitionService.getCleanableHistoricProcessInstanceReport(
            processDefinitionId,
            processDefinitionKey,
        );
    }
}
