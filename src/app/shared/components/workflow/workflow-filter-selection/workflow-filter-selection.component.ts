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
import {Button} from 'primeng/button';
import {
    WorkflowFilter,
    WorkflowFilterService,
} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {Tooltip} from 'primeng/tooltip';
import {NavigationService} from 'src/app/shared/services/client/router/navigation/navigation.service';
import {APP_URL_REQUESTS, APP_URL_WORKFLOWS} from 'src/app/app.constants';
import {
    ICON_COPY_PRIME,
    ICON_FILTER_PRIME,
    ICON_LINK_PRIME,
} from 'src/app/shared/components/p/icon/IconConstants';
import {getDisplayNameFromMainURL} from 'src/app/shared/services/client/router/data/RouterServiceUtils';
import {AlertService} from 'src/app/shared/services/alert.service';

@Component({
    selector: 'app-workflow-filter-selection',
    imports: [Button, Tooltip],
    templateUrl: './workflow-filter-selection.component.html',
    styleUrl: './workflow-filter-selection.component.scss',
})
export class WorkflowFilterSelectionComponent implements OnInit {
    private readonly workflowFilterService = inject(WorkflowFilterService);
    private readonly navigationService = inject(NavigationService);
    private readonly alertService = inject(AlertService);

    workFlowFilterElementSting = input.required<string | undefined>();
    workFlowFilterKey = input.required<keyof WorkflowFilter>();
    workflowFilterSelectionType = input.required<keyof typeof WorkflowFilterSelectionType>();
    urlToNavigateInstead = input<string | undefined>(undefined);

    text: string | undefined = undefined;
    icon: string | undefined = undefined;
    type: WorkflowFilterSelectionType | undefined = undefined;
    private urlToNavigate: string = APP_URL_WORKFLOWS;

    ngOnInit(): void {
        this.urlToNavigate = this.urlToNavigateInstead() ?? this.getURLFromGivenKey(this.workFlowFilterKey());
        this.type = getWorkflowFilterSelectionTypeFromString(this.workflowFilterSelectionType());
        this.text = this.getTextFromFilterKey(this.workFlowFilterKey(), this.type);
        this.icon = this.geIconFromType(this.type);
    }

    handleOnClickButton() {
        switch (this.workflowFilterSelectionType()) {
            case WorkflowFilterSelectionType.USE_IN_WORKFLOW_FILTER:
                this.workflowFilterService.mergeFilter({
                    [this.workFlowFilterKey()]: this.workFlowFilterElementSting() ?? undefined,
                });
                break;
            case WorkflowFilterSelectionType.USE_IN_WORKFLOW_FILTER_AND_UPDATE:
                this.workflowFilterService.mergeFilterAndUpdate({
                    [this.workFlowFilterKey()]: this.workFlowFilterElementSting() ?? undefined,
                });
                break;
            case WorkflowFilterSelectionType.NAVIGATE_TO:
                this.workflowFilterService.mergeFilterAndUpdate({
                    [this.workFlowFilterKey()]: this.workFlowFilterElementSting() ?? undefined,
                });
                this.navigationService.navigateByUrl(this.urlToNavigate);
                break;
            case WorkflowFilterSelectionType.COPY_ELEMENT:
                this.alertService.addWarning('Copy Element not implemented.');
                throw new Error('Copy Element not implemented.');
            default:
                this.workflowFilterService.mergeFilter({
                    [this.workFlowFilterKey()]: this.workFlowFilterElementSting() ?? undefined,
                });
                break;
        }
    }

    private getTextFromFilterKey(key: keyof WorkflowFilter, type: WorkflowFilterSelectionType) {
        switch (key) {
            case 'processInstanceId':
                return this.getTextFromType('ProcessInstanceId', type);
            case 'requestId':
                return this.getTextFromType('RequestId', type);
            default:
                return undefined;
        }
    }

    private getTextFromType(keyName: string, type: WorkflowFilterSelectionType) {
        switch (type) {
            case WorkflowFilterSelectionType.USE_IN_WORKFLOW_FILTER:
            case WorkflowFilterSelectionType.USE_IN_WORKFLOW_FILTER_AND_UPDATE:
                return `Add this ${keyName} to the Filter`;
            case WorkflowFilterSelectionType.NAVIGATE_TO:
                const displayNameOfURL = getDisplayNameFromMainURL(this.urlToNavigate);
                return `Navigate to ${displayNameOfURL} with changed ${keyName}`;
            case WorkflowFilterSelectionType.COPY_ELEMENT:
                return `Copy ${keyName} to clipboard (${this.workFlowFilterElementSting()})`;
            default:
                return undefined;
        }
    }

    private geIconFromType(type: WorkflowFilterSelectionType) {
        switch (type) {
            case WorkflowFilterSelectionType.USE_IN_WORKFLOW_FILTER:
            case WorkflowFilterSelectionType.USE_IN_WORKFLOW_FILTER_AND_UPDATE:
                return ICON_FILTER_PRIME;
            case WorkflowFilterSelectionType.NAVIGATE_TO:
                return ICON_LINK_PRIME;
            case WorkflowFilterSelectionType.COPY_ELEMENT:
                return ICON_COPY_PRIME;
            default:
                return undefined;
        }
    }

    /**
     * This function returns the url depending on given key to use in filter
     * @param workflowFilterKeyToNavigate
     * @private
     */
    private getURLFromGivenKey(workflowFilterKeyToNavigate: keyof WorkflowFilter) {
        switch (workflowFilterKeyToNavigate) {
            case 'processInstanceId':
                return APP_URL_WORKFLOWS;
            case 'requestId':
                return APP_URL_REQUESTS;
            default:
                return APP_URL_WORKFLOWS;
        }
    }
}
export enum WorkflowFilterSelectionType {
    USE_IN_WORKFLOW_FILTER = 'USE_IN_WORKFLOW_FILTER',
    USE_IN_WORKFLOW_FILTER_AND_UPDATE = 'USE_IN_WORKFLOW_FILTER_AND_UPDATE',
    NAVIGATE_TO = 'NAVIGATE_TO',
    COPY_ELEMENT = 'COPY_ELEMENT',
}
export function getWorkflowFilterSelectionTypeFromString(
    typeAsString: keyof typeof WorkflowFilterSelectionType,
) {
    return WorkflowFilterSelectionType[typeAsString];
}
