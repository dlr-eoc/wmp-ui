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

import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {
    BpmnCustomEventStore,
    EventClickEventType,
} from 'src/app/shared/services/bpmn/event/bpmn-custom-event-store.service';
import {WorkflowFilterService} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {AlertService, WmpAlertType} from 'src/app/shared/services/alert.service';
import {WorkflowFilterServiceBase} from 'src/app/components/workflow-page/service/WorkflowFilterServiceBase';
import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';

export class BpmnCustomEventHandlerService extends AsyncDestroyable {
    private readonly bpmnCustomEventStore: BpmnCustomEventStore;
    private readonly workflowFilterService: WorkflowFilterService | WorkflowFilterServiceBase;
    private readonly alertService: AlertService;
    private readonly wmpApiService: WmpApiService;

    constructor(
        bpmnCustomEventStore: BpmnCustomEventStore,
        workflowFilterService: WorkflowFilterService | WorkflowFilterServiceBase,
        alertService: AlertService,
        wmpApiService: WmpApiService,
    ) {
        super();
        this.bpmnCustomEventStore = bpmnCustomEventStore;
        this.workflowFilterService = workflowFilterService;
        this.alertService = alertService;
        this.wmpApiService = wmpApiService;
        this.subscribeToOverlayCallActivityClickStore();
        this.subscribeToStartEventOverlayStore();
        this.subscribeToRetryActivityStore();
    }
    private subscribeToRetryActivityStore() {
        this.subscribeWithDestroyHandler(
            this.bpmnCustomEventStore.overlayRetryActivityStore$,
            (clickEvent) => {
                if (clickEvent) {
                    switch (clickEvent.clickType) {
                        case EventClickEventType.RETRY_ACTIVITY:
                            const activityId = clickEvent.historicActivityDto.activityId;
                            const processInstanceId = clickEvent.historicActivityDto.processInstanceId;
                            //FIXME retry activity correctly
                            if (activityId && processInstanceId) {
                                //FIXME correct restart job, currently just no job found with id from backend
                                //maybe wrong id? historic job log could be wrong

                                this.wmpApiService
                                    .restartAtActivityId(processInstanceId, activityId)
                                    .then((_response) => {
                                        //TODO check what should happen afterwards

                                        //FIXME complete refresh of all data needed! not just a retrigger
                                        this.workflowFilterService.retriggerFilterAndUpdate();
                                    });
                            }
                            break;
                        default:
                            throw new Error('EventClickEventType not implemented: ' + clickEvent.clickType);
                    }
                }
            },
        );
    }

    private subscribeToStartEventOverlayStore() {
        this.subscribeWithDestroyHandler(
            this.bpmnCustomEventStore.overlayStartEventOverlayStore$,
            (clickEvent) => {
                if (clickEvent) {
                    switch (clickEvent.clickType) {
                        case EventClickEventType.START_EVENT_NAVIGATE_BACK:
                            const parentProcessInstanceId = clickEvent.processInstance.superProcessInstanceId;
                            if (parentProcessInstanceId)
                                this.workflowFilterService.mergeFilterAndUpdate({
                                    processInstanceId: parentProcessInstanceId,
                                    //reset process definition to prevent inconsistencies
                                    processDefinition: undefined,
                                    //reset activity selection - navigating to processInstance
                                    callActivity: undefined,
                                    activity: undefined,
                                });
                            else {
                                this.alertService.addAlert({
                                    type: WmpAlertType.WARN,
                                    text: 'No ProcessInstance found for given CallActivity',
                                });
                            }
                            break;
                        default:
                            throw new Error('EventClickEventType not implemented: ' + clickEvent.clickType);
                    }
                }
            },
        );
    }

    private subscribeToOverlayCallActivityClickStore() {
        this.subscribeWithDestroyHandler(
            this.bpmnCustomEventStore.overlayCallActivityClickEventStore$,
            (clickEvent) => {
                if (clickEvent) {
                    switch (clickEvent.clickType) {
                        case EventClickEventType.LINK_CALL_ACTIVITY:
                            const calledProcessInstanceId =
                                clickEvent.historicActivityDto.calledProcessInstanceId;

                            if (calledProcessInstanceId) {
                                this.workflowFilterService.mergeFilterAndUpdate({
                                    processInstanceId: calledProcessInstanceId,
                                    //reset process definition to prevent inconsistencies
                                    processDefinition: undefined,
                                    //reset activity selection - navigating to processInstance
                                    callActivity: undefined,
                                    activity: undefined,
                                });
                            } else {
                                this.alertService.addAlert({
                                    type: WmpAlertType.WARN,
                                    text: 'No ProcessInstance found for given CallActivity',
                                });
                            }
                            break;
                        default:
                            throw new Error('EventClickEventType not implemented: ' + clickEvent.clickType);
                    }
                }
            },
        );
    }
}
