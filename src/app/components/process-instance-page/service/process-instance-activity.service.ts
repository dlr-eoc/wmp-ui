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

import {HistoricActivityInstanceDto} from 'src/app/shared/services/camunda-api';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';
import {WorkflowFilter} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {AlertService} from 'src/app/shared/services/alert.service';
import {WorkflowFilterServiceBase} from 'src/app/components/workflow-page/service/WorkflowFilterServiceBase';

export class ProcessInstanceActivityService {
    private readonly api: WmpApiService;
    private readonly workflowFilterService: WorkflowFilterServiceBase;
    private readonly alertService: AlertService;

    constructor(
        api: WmpApiService,
        workflowFilterService: WorkflowFilterServiceBase,
        alertService: AlertService,
    ) {
        this.api = api;
        this.workflowFilterService = workflowFilterService;
        this.alertService = alertService;
    }

    private _processInstanceActivityLog$ = new BehaviorSubject<HistoricActivityInstanceDto[]>([]);
    private _processInstanceAuditLogsLoading$ = new Subject<boolean>();
    private _activityInstanceNameMap$ = new Subject<{[activityInstanceId: string]: string}>();

    async updateActivityData(processInstanceId: string): Promise<void> {
        this._processInstanceAuditLogsLoading$.next(true);

        const activityLog = await this.api.getHistoricProcessInstanceActitivity(processInstanceId);
        this._processInstanceActivityLog$.next(activityLog);

        this._processInstanceAuditLogsLoading$.next(false);

        const instanceMap: {[activityInstanceId: string]: string} = {};

        // Create mapping for variable scopes
        activityLog.forEach((a) => {
            if (
                a.id !== null &&
                a.id !== undefined &&
                a.activityName !== null &&
                a.activityName !== undefined
            )
                instanceMap[a.id] = a.activityName;
        });
        if (processInstanceId) {
            instanceMap[processInstanceId] = 'Process';
        }
        this._activityInstanceNameMap$.next(instanceMap);
    }

    updateActivityInstanceFromFilter(filter: WorkflowFilter | undefined) {
        const currentActivityLog = this._processInstanceActivityLog$.getValue();
        if (filter?.activity?.id) {
            if (currentActivityLog.length === 0) {
                //no current activities available, update filter with not instance stored
                this.workflowFilterService.mergeFilterAndUpdate({
                    activity: {id: filter.activity.id, name: filter.activity.name},
                });
                return;
            }
            const activityInstance = currentActivityLog.find(
                (activityInstance) => activityInstance.activityId === filter?.activity?.id,
            );
            //directly store activityInstance in Filter and start update; it's possible activityInstance not found
            if (!activityInstance) {
                this.alertService.addWarning({text: 'No activity instance found for selected Activity.'});
            }
            this.workflowFilterService.mergeFilterAndUpdate({
                activity: {...filter.activity, activityInstance: activityInstance},
                callActivity: undefined,
                sequenceFlow: undefined,
            });
        } else if (filter?.callActivity?.id) {
            const activityInstance = currentActivityLog.find(
                (activityInstance) => activityInstance.activityId === filter?.callActivity?.id,
            );
            //directly store activityInstance in Filter and start update; it's possible activityInstance not found
            if (!activityInstance) {
                this.alertService.addWarning({
                    text: 'No CallActivity instance found for selected CallActivity.',
                });
            }
            this.workflowFilterService.mergeFilterAndUpdate({
                activity: undefined,
                callActivity: {...filter.callActivity, activityInstance: activityInstance},
                sequenceFlow: undefined,
            });
        } else if (filter?.sequenceFlow) {
            this.workflowFilterService.mergeFilterAndUpdate({
                activity: undefined,
                callActivity: undefined,
                sequenceFlow: filter.sequenceFlow,
            });
        } else {
            this.workflowFilterService.mergeFilterAndUpdate({
                activity: undefined,
                callActivity: undefined,
                sequenceFlow: undefined,
            });
        }
    }

    get processInstanceActivityLog$(): Observable<HistoricActivityInstanceDto[]> {
        return this._processInstanceActivityLog$.asObservable();
    }

    get processInstanceAuditLogsLoading$(): Observable<boolean> {
        return this._processInstanceAuditLogsLoading$.asObservable();
    }

    get activityInstanceNameMap$(): Observable<{[p: string]: string}> {
        return this._activityInstanceNameMap$.asObservable();
    }
}
