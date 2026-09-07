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
import {HistoricIncidentDto} from 'src/app/shared/services/camunda-api';
import {lastValueFrom} from 'rxjs';
import {HistoricIncidentDetails} from 'src/app/shared/services/wmp-api/custom/model/incidents-models';

// const MAX_LAST_INCIDENTS = 10;

@Injectable({
    providedIn: 'root',
})
export class OperatonIncidentService extends ApiCustomService {
    private httpClient = inject(HttpClient);

    constructor() {
        const configService = inject(ConfigService);

        super(configService.settings.jakartaURL + '/engine/default', configService.settings.jakartaURL);
    }

    async getLastIncidentsWithErrorDetails(processInstanceId: string | undefined | null) {
        const params = {open: true} as any;
        // params.maxResults = MAX_LAST_INCIDENTS;
        params.sortBy = 'createTime';
        params.sortOrder = 'desc';
        params.processInstanceId = processInstanceId ?? undefined;

        return Promise.all(
            await lastValueFrom(
                this.httpClient.get<Array<HistoricIncidentDto>>(`${this.baseUrl}/history/incident`, {
                    params,
                }),
            ).then((incidents) => {
                return incidents.map(async (incident) => {
                    if (incident.incidentType === 'failedExternalTask') {
                        const externalTaskId = incident.configuration;
                        if (externalTaskId) {
                            //load error details from external task, explicit response type text
                            const errorDetails = await lastValueFrom(
                                this.httpClient.request(
                                    'get',
                                    `${this.baseUrl}/external-task/${externalTaskId}/errorDetails`,
                                    {
                                        params: {
                                            contentType: 'text/plain',
                                            responseType: 'text/plain',
                                        },
                                        responseType: 'text',
                                    },
                                ),
                            );
                            return {
                                ...incident,
                                errorDetails: errorDetails,
                            } as HistoricIncidentDetails;
                        }
                    }
                    return {...incident} as HistoricIncidentDetails;
                });
            }),
        );
    }
}
