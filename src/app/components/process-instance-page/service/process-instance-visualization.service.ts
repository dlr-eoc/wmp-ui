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

import {getRunningActivitiesWithNoIncident} from 'src/app/utils/bpmn/activity.utils';
import {BpmnConnectionStyle} from 'src/app/models/bpmn-diagram.model';
import {notEmpty} from 'src/app/components/utils/common.utils';
import ElementRegistry from 'diagram-js/lib/core/ElementRegistry';
import {ProcessInstanceIncidentService} from 'src/app/components/process-instance-page/service/process-instance-incident.service';
import {ProcessInstanceActivityService} from 'src/app/components/process-instance-page/service/process-instance-activity.service';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {
    HistoricActivityInstanceDto,
    HistoricIncidentDto,
    HistoricProcessInstanceDto,
} from 'src/app/shared/services/camunda-api';
import {BpmnHandlerService} from 'src/app/shared/services/bpmn/bpmn-handler.service';
import {BpmnActivityStyleStorageService} from 'src/app/shared/services/bpmn/overlay/storage/bpmn-activity-style-storage.service';
import {BpmnSelectionService} from 'src/app/shared/services/bpmn/diagram/bpmn-selection.service';
import {BpmnDiagramService} from 'src/app/shared/services/bpmn/diagram/bpmn-diagram.service';
import {BpmnCustomOverlayService} from 'src/app/shared/services/bpmn/overlay/bpmn-custom-overlay.service';

export class ProcessInstanceVisualizationService extends AsyncDestroyable {
    private readonly bpmnActivityStyleStorageService: BpmnActivityStyleStorageService;
    private readonly bpmnSelectionService: BpmnSelectionService;
    private readonly bpmnDiagramService: BpmnDiagramService;
    private readonly bpmnCustomOverlayService: BpmnCustomOverlayService;

    private incidents: HistoricIncidentDto[] = [];
    private activityLog: HistoricActivityInstanceDto[] = [];

    constructor(
        processInstanceIncidentService: ProcessInstanceIncidentService,
        processInstanceActivityService: ProcessInstanceActivityService,
        bpmnHandler: BpmnHandlerService,
    ) {
        super();
        this.bpmnActivityStyleStorageService = bpmnHandler.bpmnActivityStyleStorageService;
        this.bpmnSelectionService = bpmnHandler.bpmnSelectionService;
        this.bpmnDiagramService = bpmnHandler.bpmnDiagramService;
        this.bpmnCustomOverlayService = bpmnHandler.bpmnCustomOverlayService;
        this.subscribeWithDestroyHandler(
            processInstanceActivityService.processInstanceActivityLog$,
            (updatedValue) => {
                this.activityLog = updatedValue;
                this.checkUpdate();
            },
        );
        this.subscribeWithDestroyHandler(
            processInstanceIncidentService.processInstanceIncidents$,
            (updatedValue) => (this.incidents = updatedValue),
        );
    }
    destroy(): void {
        super.destroy();
    }

    updateVisualization(processInstance: HistoricProcessInstanceDto) {
        this.bpmnCustomOverlayService.updateProcessInstance(processInstance);

        const historicIncidents = [...this.incidents];

        const historicActivityInstances = this.activityLog.filter((value) =>
            this.incidents.find((incident) => incident.activityId === value.activityId),
        );

        const mixedIncidentElements = [...historicIncidents, ...historicActivityInstances];

        const completedActivities: HistoricActivityInstanceDto[] = this.activityLog
            .filter((activity) => activity.endTime)
            .filter(notEmpty);

        const runningActivitiesWithNoIncident = getRunningActivitiesWithNoIncident(
            this.activityLog,
            this.incidents,
        );

        this.bpmnActivityStyleStorageService.setActivityStyles(
            runningActivitiesWithNoIncident,
            mixedIncidentElements,
            completedActivities,
        );

        const elementRegistry =
            this.bpmnDiagramService.bpmnViewerHandler.get<ElementRegistry>('elementRegistry');
        const connections = completedActivities.reduce((prev, currentActivity) => {
            const activity = elementRegistry.get(currentActivity.activityId ?? '');
            const incomingList: any[] = activity?.businessObject.incoming || [];
            const completedArrows: BpmnConnectionStyle[] = incomingList
                .filter((incomingArrow) =>
                    completedActivities.find((value) => value === incomingArrow.sourceRef.id),
                )
                .map((incomingCompleteArrow) => {
                    return {id: incomingCompleteArrow.id, isCompleted: true} satisfies BpmnConnectionStyle;
                });
            const unCompletedArrows = incomingList.filter(
                (incomingArrow) => !completedActivities.find((value) => value === incomingArrow.sourceRef.id),
            );

            return prev.concat(completedArrows);
        }, [] as BpmnConnectionStyle[]);
        this.bpmnSelectionService.setConnectionElements(connections);
    }

    private checkUpdate = () => {
        if (this.activityLog && this.incidents) {
        }
    };
}
