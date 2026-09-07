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
import {generateQueryParams, RequestFilter} from 'src/app/components/utils/table/request.utils';
import {WMPRequest} from 'src/app/app-pages/request/models/WMPRequest';
import {ApiCustomService} from 'src/app/shared/services/wmp-api/custom/api-custom-service';
import {ConfigService} from 'src/app/shared/services/config.service';
import {lastValueFrom} from 'rxjs';
import {AuthenticationService} from 'src/app/shared/services/user/authentication.service';
import {AlertService} from 'src/app/shared/services/alert.service';

@Injectable({
    providedIn: 'root',
})
export class WmpRequestService extends ApiCustomService {
    private httpClient = inject(HttpClient);
    private configService: ConfigService;
    authenticationService = inject(AuthenticationService);
    private alertService = inject(AlertService);

    constructor() {
        const configService = inject(ConfigService);

        super(configService.settings.jakartaURL + '/engine/default', configService.settings.jakartaURL);

        this.configService = configService;
    }

    public getRequests(filter: RequestFilter | undefined): Promise<WMPRequest[]> {
        const params = generateQueryParams(filter);
        return new Promise(async (res) => {
            const requests = await lastValueFrom(
                this.httpClient.get<WMPRequest[]>(`${this.apiUrl}/wmp/requestlist/request`, {params: params}),
            );
            //fix requests and create a correct date format
            const fixedRequests = requests.map((value) => {
                return {...value, creationDate: new Date(value.creationDate)} satisfies WMPRequest;
            });
            res(fixedRequests);
        });
    }

    public getRequestCount(): Promise<number> {
        return new Promise(async (res) => {
            const requests = await lastValueFrom(
                this.httpClient.get<number>(`${this.apiUrl}/wmp/requestlist/request/count`),
            );
            res(requests);
        });
    }
    public sendCommand(requestId: string, command: string): Promise<Object> {
        //TODO implement sending commands
        return new Promise(() => this.alertService.addWarning('Sending commands not implemented'));
    }
}
