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

import {inject, Injectable, OnDestroy} from '@angular/core';
import {WorkflowFilterSortElement} from 'src/app/components/utils/table/workflow.filter.utils';
import {FilterBase} from 'src/app/shared/services/utils/FilterManager';
import {FilterStorageService} from 'src/app/shared/services/client/filter/filter-storage.service';
import {NavigationService} from 'src/app/shared/services/client/router/navigation/navigation.service';
import {HistoricActivityInstanceDto} from 'src/app/shared/services/camunda-api';
import {ClickedBpmnElement} from 'src/app/models/bpmn-diagram.model';
import {WorkflowFilterServiceBase} from 'src/app/components/workflow-page/service/WorkflowFilterServiceBase';

@Injectable({
    providedIn: 'root',
})
/**
 * This Service is a global Filter for Workflows. It uses the {@link WorkflowFilterServiceBase}
 * without an identifier suffix.
 */
export class WorkflowFilterService extends WorkflowFilterServiceBase implements OnDestroy {
    constructor() {
        const filterStorageService = inject(FilterStorageService);
        const navigationService = inject(NavigationService);
        super(filterStorageService, navigationService);
    }

    ngOnDestroy(): void {
        super.destroy();
    }
}
export interface WorkflowFilter extends FilterBase {
    processDefinition?: WorkflowFilterProcessDefinition;
    processInstanceId?: string;
    requestId?: string;
    activity?: WorkflowFilterActivity;
    callActivity?: WorkflowFilterCallActivity;
    sequenceFlow?: ClickedBpmnElement;
    state?: string;
    dateRange?: DateRange;
    waitingOnly?: boolean;
    incidentsOnly?: boolean;
    messageFilter?: string;
    page?: number;
    pageSize?: number;
    sorting?: WorkflowFilterSortElement;
    showHistoricLabels?: boolean;
}

export enum DateRangeOptions {
    'last 7 days' = 'last 7 days',
    'last 14 days' = 'last 14 days',
    'last 2 months' = 'last 2 months',
    'current month' = 'current month',
    'custom' = 'custom',
}

export interface DateRange {
    presetName: DateRangeOptions | string;
    from?: Date;
    to?: Date;
}

export interface WorkflowFilterProcessDefinition {
    id?: string;
    key: string;
    version?: number;
}

export interface WorkflowFilterActivity {
    id: string;
    name?: string;
    activityInstance?: HistoricActivityInstanceDto;
}
export interface WorkflowFilterCallActivity {
    id: string;
    name: string;
    activityInstance?: HistoricActivityInstanceDto;
    calledProcess?: string; //parent process called
}
