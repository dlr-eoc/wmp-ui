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

import {Component, inject, LOCALE_ID, OnDestroy} from '@angular/core';
import {DatePicker} from 'primeng/datepicker';
import {Panel} from 'primeng/panel';
import {Select} from 'primeng/select';
import {ToggleSwitch} from 'primeng/toggleswitch';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {
    DateRange,
    WorkflowFilter,
    WorkflowFilterActivity,
    WorkflowFilterService,
} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {
    getFilterValues,
    WorkflowFilterDataElement,
} from 'src/app/components/workflow-page/WorkflowFilterUtils';
import {HistoricProcessInstanceDto} from 'src/app/shared/services/camunda-api';
import {notEmpty} from 'src/app/utils/ArrayUtils';
import {FormsModule} from '@angular/forms';
import {WorkflowDataService} from 'src/app/app-pages/workflow-page/service/workflow-data.service';
import {
    BpmnManagerService,
    WORKFLOWS_BPMN_IDENTIFIER,
} from 'src/app/shared/services/bpmn/bpmn-manager.service';

@Component({
    selector: 'app-process-filter',
    imports: [DatePicker, Panel, Select, ToggleSwitch, FormsModule],
    templateUrl: './process-filter.component.html',
    styleUrl: './process-filter.component.scss',
})
export class ProcessFilterComponent extends AsyncDestroyable implements OnDestroy {
    private workflowFilterService = inject(WorkflowFilterService);
    private workflowService = inject(WorkflowDataService);

    private processInstanceHandlerService =
        inject(BpmnManagerService).getProcessInstanceHandlerService(WORKFLOWS_BPMN_IDENTIFIER);
    private workflowBpmnService = this.processInstanceHandlerService.workflowBpmnService;
    private processInstanceActivityService =
        this.processInstanceHandlerService.processInstanceActivityService;

    workflowFilterModel: WorkflowFilter = {};
    activityFromWorkflow: WorkflowFilterActivity | undefined = undefined;

    activityId: string = '';
    filtersToDisplay: WorkflowFilterDataElement[] = [];
    availableStates: HistoricProcessInstanceDto.StateEnum[] = Object.values(
        HistoricProcessInstanceDto.StateEnum,
    );
    fromDate = new Date();
    toDate = new Date();

    // activitiesOfCurrentProcessDefinition$ = this.workflowService.activitiesOfCurrentProcessDefinition$;
    activities: WorkflowFilterActivity[] = [];
    activityIds: string[] = [];
    availableProcessInstancesCount: number = 0;

    constructor() {
        const locale = inject(LOCALE_ID);

        super();
        this.subscribeWithDestroyHandler(
            this.workflowService.countAvailableEntries$,
            (value) => (this.availableProcessInstancesCount = value),
        );
        this.subscribeWithDestroyHandler(
            this.workflowBpmnService.activitiesOfCurrentProcessDefinition$,
            (activities) => {
                this.activities = activities;
                this.activityIds = activities.map((ac) => ac.id);
            },
        );
        this.subscribeWithDestroyHandler(this.workflowFilterService.filter$, (workflowFilter) => {
            this.workflowFilterModel = workflowFilter ?? {};

            if (this.workflowFilterModel?.activity?.id) {
                //convert to simple model without instance
                this.activityFromWorkflow = {
                    id: this.workflowFilterModel.activity.id,
                    name: this.workflowFilterModel.activity?.name,
                };
            }

            const dateRange: DateRange | undefined = this.workflowFilterModel.dateRange;
            this.fromDate = dateRange?.from ?? new Date();
            this.toDate = dateRange?.to ?? new Date();
            this.filtersToDisplay = (Object.keys(this.workflowFilterModel) as (keyof WorkflowFilter)[])
                .map((keyOfFilter) => {
                    return getFilterValues(keyOfFilter, this.workflowFilterModel, locale);
                })
                .filter(notEmpty);
        });
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    /**
     * Special case for activityChange. Using stored activity Information
     * without ActivityInstance information.
     */
    handleActivityChange() {
        this.processInstanceActivityService.updateActivityInstanceFromFilter({
            activity: this.activityFromWorkflow,
        });
    }
    handleFilterChange() {
        // const currentFilter = this.workflowFilterService.currentFilter();
        if (this.fromDate.valueOf() !== this.toDate.valueOf()) {
            //synchronize workflow filter before merging!
            this.workflowFilterModel.dateRange = {
                to: this.toDate,
                from: this.fromDate,
                presetName: this.workflowFilterModel.dateRange?.presetName ?? 'custom',
            } satisfies DateRange;
        }

        //data in this.workflowFilter already changed on this event happening, just use the data from the model
        this.workflowFilterService.mergeFilterAndUpdate(this.workflowFilterModel);
    }
}
