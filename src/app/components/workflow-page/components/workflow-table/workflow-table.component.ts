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
import {TableLazyLoadEvent, TableModule} from 'primeng/table';
import {HistoricProcessInstance} from 'src/app/components/workflow-page/models/HistoricProcessInstance';
import {
    getWorkflowTableMenuItems,
    JOB_ACTION_LABEL,
} from 'src/app/components/workflow-page/components/workflow-table/WorkflowTableUtils';
import {MenuItem} from 'primeng/api';
import {JobHandlerService} from 'src/app/shared/services/api/job-handler.service';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {WorkflowFilterService} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {getSortingFromPrimeNGTableState} from 'src/app/components/utils/table/workflow.filter.utils';
import {WORKFLOW_COLUMNS_DEFAULT} from 'src/app/components/workflow-page/workflow.utils';
import {TableComponent} from 'src/app/shared/components/table/table.component';
import {ColumnDefSortAndFilterable} from 'src/app/shared/components/table/data/TableTypes';
import {Menu} from 'primeng/menu';
import {Button} from 'primeng/button';
import {WorkflowDataService} from 'src/app/app-pages/workflow-page/service/workflow-data.service';
import {WorkflowFilterSelectionGroupComponent} from 'src/app/shared/components/workflow/workflow-filter-selection-group/workflow-filter-selection-group.component';

@Component({
    selector: 'app-workflow-table',
    imports: [TableModule, TableComponent, Menu, Button, WorkflowFilterSelectionGroupComponent],
    templateUrl: './workflow-table.component.html',
    styleUrl: './workflow-table.component.scss',
})
export class WorkflowTableComponent extends AsyncDestroyable implements OnDestroy {
    private jobHandlerService = inject(JobHandlerService);
    private workflowService = inject(WorkflowDataService);
    private workflowFilterService = inject(WorkflowFilterService);

    protected readonly getWorkflowTableMenuItems = getWorkflowTableMenuItems;

    selectedElements: HistoricProcessInstance[] = [];
    availableProcessInstances: HistoricProcessInstance[] = [];
    totalAvailableCount: number = 0;

    columnsOfTable: ColumnDefSortAndFilterable[] = WORKFLOW_COLUMNS_DEFAULT;

    constructor() {
        super();
        this.subscribeWithDestroyHandler(this.workflowService.availableProcessInstances$, (value) => {
            this.availableProcessInstances = value;
        });
        this.subscribeWithDestroyHandler(
            this.workflowService.countAvailableEntries$,
            (value) => (this.totalAvailableCount = value),
        );
        this.subscribeWithDestroyHandler(this.workflowService.selectedProcessInstances$, (value) => {
            this.selectedElements = value;
        });
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    handleClickMenu(item: MenuItem, entry: HistoricProcessInstance) {
        switch (item.label) {
            case JOB_ACTION_LABEL.RETRY:
                this.jobHandlerService.restartJob(entry);
                break;
            case JOB_ACTION_LABEL.SUSPEND:
                this.jobHandlerService.suspendJobChange(entry, true);
                break;
            case JOB_ACTION_LABEL.ACTIVATE:
                this.jobHandlerService.suspendJobChange(entry, false);
                break;
            case JOB_ACTION_LABEL.TERMINATE:
                this.jobHandlerService.terminateJob(entry);
                break;
            default:
                throw new Error('Unknown label ' + item.label);
        }
    }

    handleSelectionChange(selections: HistoricProcessInstance[]) {
        this.workflowService.setSelectedProcessInstances(selections);
    }

    /**
     * this function is called after a filter change,
     * assure to merge filter only if the filter changes
     * @param $event
     */
    handleLazyLoad($event: TableLazyLoadEvent) {
        const entries = $event.first ?? 10;
        const numberOfRows = $event.rows ?? 10;
        const sortingFromPrimeNGTableState = getSortingFromPrimeNGTableState($event);

        this.workflowFilterService.mergeFilterIfChanged({
            page: entries / numberOfRows + 1,
            pageSize: numberOfRows,
            sorting: sortingFromPrimeNGTableState ? sortingFromPrimeNGTableState : undefined,
        });
    }
}
