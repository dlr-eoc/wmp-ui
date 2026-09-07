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

import {Component, inject, input, OnInit} from '@angular/core';
import {
    WorkflowFilterSelectionComponent,
    WorkflowFilterSelectionType,
} from 'src/app/shared/components/workflow/workflow-filter-selection/workflow-filter-selection.component';
import {WorkflowFilter} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {NavigationService} from 'src/app/shared/services/client/router/navigation/navigation.service';
import {APP_URL_LOG, APP_URL_REQUESTS, APP_URL_WORKFLOWS} from 'src/app/app.constants';

@Component({
    selector: 'app-workflow-filter-selection-group',
    imports: [WorkflowFilterSelectionComponent],
    templateUrl: './workflow-filter-selection-group.component.html',
    styleUrl: './workflow-filter-selection-group.component.scss',
})
export class WorkflowFilterSelectionGroupComponent implements OnInit {
    $workFlowFilterElementSting = input.required<string | undefined>();
    $workFlowFilterKey = input.required<keyof WorkflowFilter>();
    $shouldDisplayText = input<boolean>(true);
    isWorkflowPage = false;
    navigationService = inject(NavigationService);
    isRequestIdKey: boolean = false;
    useInFilterSelectionType: keyof typeof WorkflowFilterSelectionType | undefined = undefined;
    readonly isLogPage: boolean;

    key: keyof WorkflowFilter | undefined = undefined;
    elementString: string | undefined = undefined;

    constructor() {
        //check for workflow page rendering
        this.isWorkflowPage = this.navigationService.isCurrentPageSameAs(APP_URL_WORKFLOWS);
        this.isLogPage = this.navigationService.isCurrentPageSameAs(APP_URL_LOG);
        //case workflow or log page, auto update data on selection
        this.useInFilterSelectionType =
            this.isWorkflowPage || this.isLogPage
                ? 'USE_IN_WORKFLOW_FILTER_AND_UPDATE'
                : 'USE_IN_WORKFLOW_FILTER';
    }

    ngOnInit(): void {
        this.key = this.$workFlowFilterKey();
        this.elementString = this.$workFlowFilterElementSting();
        this.isRequestIdKey = this.key === 'requestId';
    }

    protected readonly APP_URL_REQUESTS = APP_URL_REQUESTS;
    protected readonly APP_URL_WORKFLOWS = APP_URL_WORKFLOWS;
    protected readonly WorkflowFilterSelectionType = WorkflowFilterSelectionType;
}
