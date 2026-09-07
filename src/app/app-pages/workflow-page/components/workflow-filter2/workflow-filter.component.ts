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
import {Accordion, AccordionContent, AccordionHeader, AccordionPanel} from 'primeng/accordion';
import {Chip} from 'primeng/chip';
import {
    WorkflowFilter,
    WorkflowFilterService,
} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {notEmpty} from 'src/app/utils/ArrayUtils';
import {
    getFilterValues,
    WorkflowFilterDataElement,
} from 'src/app/components/workflow-page/WorkflowFilterUtils';
import {ProcessDefinitionSelectorComponent} from 'src/app/components/workflow-page/components/process-definition-selector/process-definition-selector.component';
import {ProcessInstanceFilterComponent} from 'src/app/app-pages/workflow-page/components/process-instance/process-instance-filter/process-instance-filter.component';
import {ProcessFilterComponent} from 'src/app/app-pages/workflow-page/components/process-filter/process-filter.component';
import {WorkflowDataService} from 'src/app/app-pages/workflow-page/service/workflow-data.service';

@Component({
    selector: 'app-workflow-filter',
    imports: [
        Accordion,
        AccordionPanel,
        AccordionHeader,
        AccordionContent,
        Chip,
        ProcessDefinitionSelectorComponent,
        ProcessInstanceFilterComponent,
        ProcessFilterComponent,
    ],
    templateUrl: './workflow-filter.component.html',
    styleUrl: './workflow-filter.component.scss',
})
export class WorkflowFilterComponent extends AsyncDestroyable implements OnDestroy {
    private workflowFilterService = inject(WorkflowFilterService);
    private workflowService = inject(WorkflowDataService);

    workflowFilterModel: WorkflowFilter = {};
    filtersToDisplay: WorkflowFilterDataElement[] = [];

    availableProcessInstancesCount: number = 0;

    constructor() {
        const locale = inject(LOCALE_ID);

        super();
        this.subscribeWithDestroyHandler(
            this.workflowService.countAvailableEntries$,
            (value) => (this.availableProcessInstancesCount = value),
        );
        this.subscribeWithDestroyHandler(this.workflowFilterService.filter$, (workflowFilter) => {
            this.workflowFilterModel = workflowFilter ?? {};
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

    removeFilter(filter: WorkflowFilterDataElement, $event: MouseEvent) {
        //assure do not open accordion, don't handle event "below" the remove icon
        $event.stopPropagation();
        const currentFilter = this.workflowFilterService.currentFilter();
        currentFilter[filter.name] = undefined;
        this.workflowFilterService.mergeFilterAndUpdate(currentFilter);
    }
}
