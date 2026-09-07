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

import {Component, inject, OnDestroy} from '@angular/core';
import {ProcessBridgeService} from 'src/app/app-pages/bridge/service/process-bridge.service';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {TableModule} from 'primeng/table';
import {TableComponent} from 'src/app/shared/components/table/table.component';
import {ColumnDefSortAndFilterable} from 'src/app/shared/components/table/data/TableTypes';
import {PROCESS_BRIDGE_INSTANCE_COLUMNS_DEFAULT} from 'src/app/app-pages/bridge/components/process-bridge/process-bridge-instance-table/ProcessBridgeInstanceTableUtils';
import {HistoricIncidentDto} from 'src/app/shared/services/camunda-api';
import {Button} from 'primeng/button';
import {Menu} from 'primeng/menu';
import {
    getWorkflowTableMenuItems,
    JOB_ACTION_LABEL,
} from 'src/app/components/workflow-page/components/workflow-table/WorkflowTableUtils';
import {MenuItem} from 'primeng/api';
import {HistoricProcessInstance} from 'src/app/components/workflow-page/models/HistoricProcessInstance';
import {JobHandlerService} from 'src/app/shared/services/api/job-handler.service';
import {ProcessBridgeModel} from 'src/app/app-pages/bridge/models/WMPBridge';
import {WorkflowFilterService} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {WorkflowFilterSelectionGroupComponent} from 'src/app/shared/components/workflow/workflow-filter-selection-group/workflow-filter-selection-group.component';

@Component({
    selector: 'app-process-bridge-instance-table',
    imports: [TableModule, TableComponent, Button, Menu, WorkflowFilterSelectionGroupComponent],
    templateUrl: './process-bridge-instance-table.component.html',
    styleUrl: './process-bridge-instance-table.component.scss',
})
export class ProcessBridgeInstanceTableComponent extends AsyncDestroyable implements OnDestroy {
    private readonly processBridgeService = inject(ProcessBridgeService);
    private readonly jobHandlerService = inject(JobHandlerService);
    readonly workflowFilterService = inject(WorkflowFilterService);

    instances: HistoricIncidentDto[] = [];
    model: ProcessBridgeModel = {} as ProcessBridgeModel;

    columnsOfTable: ColumnDefSortAndFilterable[] = PROCESS_BRIDGE_INSTANCE_COLUMNS_DEFAULT;
    constructor() {
        super();
        this.subscribeWithDestroyHandler(this.processBridgeService.processBridgeInstances$, (value) => {
            this.instances = value;
        });
        this.subscribeWithDestroyHandler(this.processBridgeService.selectedModelProcessBridge$, (value) => {
            this.model = value;
        });
    }

    handleJob(item: MenuItem, entry: HistoricProcessInstance) {
        switch (item.label) {
            case JOB_ACTION_LABEL.RETRY:
                return Promise.resolve(() => this.jobHandlerService.restartJob(entry));
            case JOB_ACTION_LABEL.SUSPEND:
                return this.jobHandlerService.suspendJobChange(entry, true);
            case JOB_ACTION_LABEL.ACTIVATE:
                return this.jobHandlerService.suspendJobChange(entry, false);
            case JOB_ACTION_LABEL.TERMINATE:
                return Promise.resolve(() => this.jobHandlerService.terminateJob(entry));
            default:
                throw new Error('Unknown label ' + item.label);
        }
    }
    handleClickMenu(item: MenuItem, entry: HistoricProcessInstance) {
        if (this.model !== undefined) {
            this.handleJob(item, entry).then(() =>
                this.processBridgeService.selectProcessBridgeModel(this.model),
            );
        }
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    protected readonly getWorkflowTableMenuItems = getWorkflowTableMenuItems;
}
