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

import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {
    WorkflowFilter,
    WorkflowFilterService,
} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {WorkflowFilterComponent} from 'src/app/app-pages/workflow-page/components/workflow-filter2/workflow-filter.component';
import {WorkflowActionBarComponent} from 'src/app/components/workflow-page/components/workflow-action-bar/workflow-action-bar.component';
import {WorkflowTableComponent} from 'src/app/components/workflow-page/components/workflow-table/workflow-table.component';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {BpmnDiagramContainerComponent} from 'src/app/shared/components/bpmn-diagram/bpmn-diagram-container.component';
import {WorkflowDataService} from 'src/app/app-pages/workflow-page/service/workflow-data.service';
import {ProcessInstanceDataComponent} from 'src/app/app-pages/workflow-page/components/process-instance/process-instance-data/process-instance-data.component';
import {ProcessInstanceDetailComponent} from 'src/app/components/process-instance-page/components/process-instance-page/process-instance-detail/process-instance-detail.component';
import {HistoricProcessInstanceDto} from 'src/app/shared/services/camunda-api';
import {Subject} from 'rxjs';
import {
    BpmnManagerService,
    WORKFLOWS_BPMN_IDENTIFIER,
} from 'src/app/shared/services/bpmn/bpmn-manager.service';

@Component({
    selector: 'app-workflow-page',
    imports: [
        WorkflowFilterComponent,
        WorkflowActionBarComponent,
        WorkflowTableComponent,
        BpmnDiagramContainerComponent,
        ProcessInstanceDataComponent,
        ProcessInstanceDetailComponent,
    ],
    templateUrl: './workflow-page.component.html',
    styleUrl: './workflow-page.component.scss',
})
export class WorkflowPageComponent extends AsyncDestroyable implements OnInit, OnDestroy {
    private workflowFilterService = inject(WorkflowFilterService);
    private workflowDataService = inject(WorkflowDataService);
    readonly bpmnManager = inject(BpmnManagerService).getBpmnManager(WORKFLOWS_BPMN_IDENTIFIER);
    private readonly processInstanceDataService =
        this.bpmnManager.processInstanceHandler.processInstanceDataService;

    filter: WorkflowFilter | undefined;

    loading: boolean = false;
    processInstance: HistoricProcessInstanceDto | undefined = undefined;
    onRefresh = new Subject<void>();

    bpmnDiagramHandlerService = this.bpmnManager.bpmnHandler;

    constructor() {
        super();
        this.subscribeWithDestroyHandler(
            this.bpmnDiagramHandlerService.bpmnDiagramService.loadingWorkflowData$,
            (loading) => (this.loading = loading),
        );
        this.subscribeWithDestroyHandler(
            this.processInstanceDataService.processInstance$,
            (processInstance) => (this.processInstance = processInstance),
        );
        this.subscribeWithDestroyHandler(this.workflowFilterService.filter$, (workflowFilter) => {
            this.filter = workflowFilter;
        });
        this.subscribeWithDestroyHandler(
            this.processInstanceDataService.dataUpdateRunning$,
            (updateRunning) => {
                this.loading = updateRunning;
            },
        );
    }

    ngOnInit() {
        this.workflowDataService.setupWorkflowDataAndFilter().then(() => {
            // this.bpmnManager.startFilterManagement();
        });
    }

    ngOnDestroy(): void {
        this.destroy();
    }
}
