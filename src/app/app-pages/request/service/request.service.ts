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

import {inject, Injectable, OnDestroy} from '@angular/core';
import {RequestStatus, WMPRequest} from 'src/app/app-pages/request/models/WMPRequest';
import {isValidRequest, RequestFilter} from 'src/app/components/utils/table/request.utils';
import {BehaviorSubject, firstValueFrom, Observable, Subject} from 'rxjs';
import {WmpRequestService} from 'src/app/shared/services/wmp-api/custom/wmp-request.service';
import {OperatonInstanceService} from 'src/app/shared/services/wmp-api/custom/operaton-instance.service';
import {HistoricProcessInstanceDto} from 'src/app/shared/services/camunda-api';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {fillMapIfUndefined} from 'src/app/components/utils/map.utils';
import {
    WorkflowFilter,
    WorkflowFilterService,
} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {NavigationService} from 'src/app/shared/services/client/router/navigation/navigation.service';
import {APP_URL_REQUESTS} from 'src/app/app.constants';
import {RequestFilterService} from 'src/app/app-pages/request/service/request-filter.service';
import {
    BpmnManagerService,
    WORKFLOWS_BPMN_IDENTIFIER,
} from 'src/app/shared/services/bpmn/bpmn-manager.service';

export enum RequestFailureType {
    TERMINATED = 'TERMINATED',
    INCIDENT = 'INCIDENT',
}
@Injectable({
    providedIn: 'root',
})
export class RequestService extends AsyncDestroyable implements OnDestroy {
    private wmpService = inject(WmpRequestService);
    private operatonInstanceService = inject(OperatonInstanceService);
    private workflowFilterService = inject(WorkflowFilterService);
    private requestFilterService = inject(RequestFilterService);
    private navigationService = inject(NavigationService);

    //using same incident service as workflows, because same workflow filter used
    // maybe use own later
    private processInstanceIncidentService =
        inject(BpmnManagerService).getProcessInstanceHandlerService(WORKFLOWS_BPMN_IDENTIFIER)
            .processInstanceIncidentService;

    private _selectedRequest$ = new BehaviorSubject<WMPRequest | undefined>(undefined);
    private _selectedRequestInstances$: Subject<HistoricProcessInstanceDto[]> = new Subject();
    private _requests$: Subject<WMPRequest[]> = new Subject();
    private _requestCount$: Subject<number> = new Subject();
    private _loadingRequests$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _requestFailures$: Subject<Map<RequestFailureType, Map<string, boolean>>> = new Subject();
    private workflowFilter: WorkflowFilter | undefined = undefined;
    private requestFilter: RequestFilter | undefined = undefined;

    constructor() {
        super();

        this.subscribeWithDestroyHandler(this.workflowFilterService.filter$, (filter) => {
            this.workflowFilter = filter;
            //only update request data if on page
            if (filter?.shouldUpdate && this.navigationService.isCurrentPageSameAs(APP_URL_REQUESTS)) {
                this.updateRequestData().then((r) => r);
            }
        });
        this.subscribeWithDestroyHandler(this.requestFilterService.filter$, (filter) => {
            this.requestFilter = filter;
            if (filter?.shouldUpdate) {
                this.updateRequestData().then((r) => r);
            }
        });

        //on change of selected request start to load process instances of given request
        this.subscribeWithDestroyHandler(this._selectedRequest$, (requestSelected) => {
            const idRequest = requestSelected?.id;
            if (idRequest) {
                //ask backend for instances found with idRequest of request as business key stored in
                // process instance.
                this.subscribeWithDestroyHandler(
                    this.operatonInstanceService.getProcessInstancesWithBusinessKey(idRequest),
                    (value) => {
                        this._selectedRequestInstances$.next(value);
                    },
                );
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    async updateRequestCount() {
        const requestCount = await this.wmpService.getRequestCount();
        this._requestCount$.next(requestCount);
    }

    /**
     * Managing data handling for Requests on filter change. Reloading data from backend.
     * @private
     */
    private async updateRequestData() {
        this._loadingRequests$.next(true);

        const requestFilter = this.requestFilter;
        const workflowFilter = this.workflowFilter;
        const requests = await this.wmpService.getRequests(requestFilter);
        //TODO remove frontend filtering until backend implemented
        const filteredRequests = requests.filter((request) =>
            isValidRequest(requestFilter, workflowFilter?.requestId, request),
        );

        this.updateRequestFailures(filteredRequests)
            .then(() => this.updateRequestCount())
            .then(() => this.updateSelectedRequestsAndRequest(filteredRequests, workflowFilter?.requestId))
            .then(() => this._loadingRequests$.next(false));
    }

    private async updateRequestFailures(requests: WMPRequest[]) {
        return requests
            .reduce(async (incidentsOfRequestsPromise, request) => {
                const requestId = request?.id;
                const failureStates = await incidentsOfRequestsPromise;
                if (requestId) {
                    const historicProcessInstanceDtos = await firstValueFrom(
                        this.operatonInstanceService.getProcessInstancesWithBusinessKey(requestId),
                    );
                    if (request.status === RequestStatus.FAILED) {
                        const foundIncident = historicProcessInstanceDtos.find(async (instance) => {
                            const incidentsOfInstance =
                                await this.processInstanceIncidentService.getIncidentsOfProcessInstanceId(
                                    instance?.id ?? undefined,
                                );
                            return incidentsOfInstance && incidentsOfInstance.length > 0;
                        });

                        const incidents = fillMapIfUndefined(failureStates, RequestFailureType.INCIDENT);
                        incidents.set(requestId, !!foundIncident);
                        failureStates.set(RequestFailureType.INCIDENT, incidents);

                        const foundTerminate = historicProcessInstanceDtos.find(
                            (instance) =>
                                instance.state === 'EXTERNALLY_TERMINATED' ||
                                instance.state === 'INTERNALLY_TERMINATED',
                        );
                        const terminates = fillMapIfUndefined(failureStates, RequestFailureType.TERMINATED);
                        terminates.set(requestId, !!foundTerminate);
                        failureStates.set(RequestFailureType.TERMINATED, terminates);
                    }
                }
                return Promise.resolve(failureStates);
            }, Promise.resolve(new Map<RequestFailureType, Map<string, boolean>>()))
            .then((incidentMap) => this._requestFailures$.next(incidentMap));
    }

    private updateSelectedRequestsAndRequest(requests: WMPRequest[], requestId: string | undefined) {
        const foundRequest = requests.find((value) => value.id === requestId);
        this._requests$.next(requests);
        this._selectedRequest$.next(foundRequest);
    }

    get selectedRequest$(): Observable<WMPRequest | undefined> {
        return this._selectedRequest$.asObservable();
    }

    get selectedRequestInstances$(): Observable<HistoricProcessInstanceDto[]> {
        return this._selectedRequestInstances$.asObservable();
    }

    get requests$(): Subject<WMPRequest[]> {
        return this._requests$;
    }
    get requestCount$(): Observable<number> {
        return this._requestCount$.asObservable();
    }
    get requestFailures$(): Observable<Map<RequestFailureType, Map<string, boolean>>> {
        return this._requestFailures$.asObservable();
    }
}
