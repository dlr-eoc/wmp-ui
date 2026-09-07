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
import {ActivityNames, BpmnDocumentService} from 'src/app/shared/services/bpmn/diagram/bpmn-document.service';
import {OperatonHistoryService} from 'src/app/shared/services/api/operaton-history.service';
import {
    WorkflowFilter,
    WorkflowFilterActivity,
} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {Subject} from 'rxjs';
import {HistoricProcessInstanceDto, ProcessDefinitionDto} from 'src/app/shared/services/camunda-api';
import {ProcessInstanceParameterService} from 'src/app/components/process-instance-page/service/process-instance-parameter.service';
import {ProcessInstanceVisualizationService} from 'src/app/components/process-instance-page/service/process-instance-visualization.service';
import {BpmnHandlerService} from 'src/app/shared/services/bpmn/bpmn-handler.service';
import {BpmnDiagramContainerService} from 'src/app/shared/services/bpmn/container/bpmn-diagram-container.service';
import {BpmnDiagramService} from 'src/app/shared/services/bpmn/diagram/bpmn-diagram.service';
import {BpmnViewSelectionService} from 'src/app/shared/services/bpmn/overlay/bpmn-view-selection.service';

/**
 * This service handles visualization changes driven by different Workflow Filter Changes
 */
export class WorkflowBpmnService extends AsyncDestroyable {
    private readonly parameterService: ProcessInstanceParameterService;

    //BPMN Services
    private readonly historyService: OperatonHistoryService;
    private readonly bpmnDiagramContainerService: BpmnDiagramContainerService;
    private readonly bpmnDocumentService: BpmnDocumentService;
    private readonly bpmnDiagramService: BpmnDiagramService;
    private readonly bpmnViewSelectionService: BpmnViewSelectionService;

    //ProcessInstanceVisualization
    private readonly processInstanceVisualizationService: ProcessInstanceVisualizationService;

    private _activitiesOfCurrentProcessDefinition$: Subject<WorkflowFilterActivity[]> = new Subject();
    private activityNames: ActivityNames = {};

    constructor(
        parameterService: ProcessInstanceParameterService,
        processInstanceVisualizationService: ProcessInstanceVisualizationService,
        bpmnHandlerService: BpmnHandlerService,
        historyService: OperatonHistoryService,
    ) {
        super();
        this.parameterService = parameterService;
        this.processInstanceVisualizationService = processInstanceVisualizationService;
        this.historyService = historyService;
        this.bpmnDiagramContainerService = bpmnHandlerService.bpmnDiagramContainerService;
        this.bpmnDocumentService = bpmnHandlerService.bpmnDocumentService;
        this.bpmnDiagramService = bpmnHandlerService.bpmnDiagramService;
        this.bpmnViewSelectionService = bpmnHandlerService.bpmnViewSelectionService;
        this.subscribeWithDestroyHandler(this.bpmnDocumentService.activityNames$, (value) => {
            this.activityNames = value;
        });
    }

    async updateBPMNFromProcessDefinition(filter: WorkflowFilter) {
        if (filter.processDefinition?.id) {
            this.bpmnDiagramContainerService.initializeForContainerUpdate(true, true);
            const document = await this.bpmnDocumentService.updateBPMNDocumentFromPDId(
                filter.processDefinition.id,
            );
            await this.historyService.updateLabelsFromProcessDefinition(filter, document);
            this.checkActivityNameChanges(filter);
            this.bpmnDiagramContainerService.bpmnUpdateCompleted();
        } else {
            throw new Error('Invalid filter processDefinition given to update BPMN Document');
        }
    }

    async updateProcessDefinitionBPMNIfNecessary(
        filter: WorkflowFilter,
        processInstance?: HistoricProcessInstanceDto,
        processDefinitionDto?: ProcessDefinitionDto,
    ) {
        this.bpmnDiagramContainerService.initializeForContainerUpdate(true, true);
        const processDefinitionIdFromFilter = filter.processDefinition?.id;
        const processDefinitionId = processDefinitionIdFromFilter
            ? processDefinitionIdFromFilter
            : processInstance?.processDefinitionId;

        if (processDefinitionId) {
            //case changed process definition, update BPMN
            if (processDefinitionId) {
                return await this.bpmnDocumentService.updateBPMNDocumentFromPDId(processDefinitionId);
            } else {
                //case same diagram, but clearing all overlays to assure overlays won't overlap.
                //Later implementation with both overlays possible - remove this line below
                this.bpmnDiagramService.clearOverlays();
            }
        } else {
            throw new Error('No ProcessDefinitionId present, unable to load processInstance');
        }
        return undefined;
    }

    async updateBPMNFromProcessInstance(
        filter: WorkflowFilter,
        processInstance: HistoricProcessInstanceDto,
        processDefinitionDto: ProcessDefinitionDto,
    ) {
        this.bpmnDiagramContainerService.initializeForContainerUpdate(true, true);
        const bpmnDocumentUpdated = await this.updateProcessDefinitionBPMNIfNecessary(
            filter,
            processInstance,
            processDefinitionDto,
        );

        //case bpmnDocumentUpdated, assure to update parameters
        if (bpmnDocumentUpdated) {
            await this.parameterService.updateBpmnParameterOfDocument(bpmnDocumentUpdated);
        }

        this.checkActivityNameChanges(filter);

        //this has to be called after data update happens
        this.processInstanceVisualizationService.updateVisualization(processInstance);
        this.bpmnDiagramContainerService.bpmnUpdateCompleted();
        this.bpmnDiagramService.zoomHome(); //zoomHome afterwards
    }

    updateSelectedElement(filter: WorkflowFilter | undefined) {
        if (filter?.activity?.id) {
            this.bpmnViewSelectionService.onActivitySelection(filter.activity.id);
        } else if (filter?.callActivity?.id) {
            this.bpmnViewSelectionService.onActivitySelection(filter?.callActivity?.id);
        } else if (filter?.sequenceFlow) {
            this.bpmnViewSelectionService.onSequenceFlowSelection(filter?.sequenceFlow);
        } else {
            this.bpmnViewSelectionService.removeSelection();
        }
    }

    /**
     * This function retrieves the ActivityNames from the current bpmn and updates the results
     * This function should be called after loading the BPMN else it would use old data to update the list.
     * @private
     */
    private checkActivityNameChanges(filter: WorkflowFilter) {
        //check for activities if process definition and update filter and activities
        if (filter?.processDefinition?.id) {
            const newActivityNames: WorkflowFilterActivity[] = Object.entries(this.activityNames).map(
                (entry) => {
                    return {id: entry[0], name: entry[1]} satisfies WorkflowFilterActivity;
                },
            );

            if (this.activityNames[filter?.activity?.id || ''] === undefined) {
                filter.activity = undefined;
            }
            this._activitiesOfCurrentProcessDefinition$.next(newActivityNames);
        } else {
            filter.activity = undefined;
            this._activitiesOfCurrentProcessDefinition$.next([]);
        }
        return filter;
    }

    get activitiesOfCurrentProcessDefinition$(): Subject<WorkflowFilterActivity[]> {
        return this._activitiesOfCurrentProcessDefinition$;
    }

    updateLoading(isLoading: boolean) {
        this.bpmnDiagramService.updateLoading(isLoading);
    }
    destroy(): void {
        super.destroy();
    }
}
