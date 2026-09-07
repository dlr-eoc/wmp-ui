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

import {inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ConfigService} from "src/app/shared/services/config.service";
import {forkJoin, lastValueFrom, mergeMap, Observable, of} from "rxjs";
import {WMPProcessBridgeDataDto} from "src/app/app-pages/bridge/models/WMPBridge";
import {WmpHistoricProcessInstanceDto} from "src/app/shared/services/wmp-api/models/WmpHistoricProcessInstanceDto";

@Injectable({
    providedIn: "root",
})
export class WmpBridgeController {
    private httpClient = inject(HttpClient);

    jakartaURL: string;

    constructor() {
        const configService = inject(ConfigService);

        this.jakartaURL = configService.settings.jakartaURL;
    }

    getBridges(): Promise<WMPProcessBridgeDataDto[]> {
        // const params = generateQueryParams(filter);
        return new Promise(async (res) => {
            const requests = await lastValueFrom(
                this.httpClient.get<WMPProcessBridgeDataDto[]>(`${this.jakartaURL}/wmp/bridge`),
            );
            res(requests);
        });
    }

    getProcessInstancesOfBridge(modelName: string) {
        return this.httpClient.get<Array<WmpHistoricProcessInstanceDto>>(
            `${this.jakartaURL}/wmp/history/process-instance`,
            {
                params: {processDefinitionKey: modelName},
            },
        );
    }
    getProcessInstancesOfBridges(currentBridge: WMPProcessBridgeDataDto) {
        const models = currentBridge.models;
        const modelsAsArray = Object.keys(models);
        return of(modelsAsArray).pipe(
            mergeMap((modelKeys) =>
                forkJoin(
                    modelKeys.map((value) => {
                        return this.httpClient.get<Array<WmpHistoricProcessInstanceDto>>(
                            `${this.jakartaURL}/wmp/history/process-instance`,
                            {
                                params: {processDefinitionKey: value},
                            },
                        ) as unknown as WmpHistoricProcessInstanceDto[];
                    }) as WmpHistoricProcessInstanceDto[][],
                ),
            ),
        ) as Observable<WmpHistoricProcessInstanceDto[][]>;
    }

    updateBridgeActive(enabled: boolean, currentBridge: WMPProcessBridgeDataDto | undefined) {
        if (currentBridge) {
            // http://localhost:8080/engine-rest/wmp/bridge/<name>?enabled=true
            return lastValueFrom(
                this.httpClient.put(
                    `${this.jakartaURL}/wmp/bridge/${currentBridge.name}?enabled=${enabled.toString()}`,
                    {},
                ),
            );
        }
        return Promise.resolve();
    }
}
