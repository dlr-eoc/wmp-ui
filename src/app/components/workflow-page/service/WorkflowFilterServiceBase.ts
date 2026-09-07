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

import {
    isSameWorkflowFilterSortElement,
    WorkflowFilterSortElement,
} from 'src/app/components/utils/table/workflow.filter.utils';
import {FilterBase} from 'src/app/shared/services/utils/FilterManager';
import {FilterStorageService} from 'src/app/shared/services/client/filter/filter-storage.service';
import {FilterHandler} from 'src/app/shared/services/client/filter/filter-handler';
import {NavigationService} from 'src/app/shared/services/client/router/navigation/navigation.service';
import {
    getQueryParamsFromWorkflowFilter,
    getWorkflowFilterFromStorage,
} from 'src/app/components/workflow-page/workflow.utils';
import {HistoricActivityInstanceDto} from 'src/app/shared/services/camunda-api';
import {BehaviorSubject, Observable} from 'rxjs';
import {objectToUrlWithQueryParameter} from 'src/app/utils/ObjectUtils';
import {APP_URL_WORKFLOWS} from 'src/app/app.constants';
import {ClickedBpmnElement} from 'src/app/models/bpmn-diagram.model';

export class WorkflowFilterServiceBase extends FilterHandler<WorkflowFilter> {
    private _workflowFilterLink$ = new BehaviorSubject<string | undefined>(undefined);
    /**
     * This class is used to create a WorkflowFilter.
     * @param filterStorageService - the service that handles filter storage (session or local)
     * @param navigationService - the navigation service that handles all page navigations or url adjustments
     * @param filterSuffix - the filter suffix that determines whether a global ("") or a specific filter will be created
     */
    constructor(
        readonly filterStorageService: FilterStorageService,
        readonly navigationService: NavigationService,
        readonly filterSuffix: string = '', //filter suffix - different Workflow filter could be created
    ) {
        super(
            filterStorageService,
            navigationService,
            WORKFLOW_FILTER_IDENTIFIER + filterSuffix,
            getQueryParamsFromWorkflowFilter,
            getWorkflowFilterFromStorage,
        );
        //update workflow filter link
        this.subscribeWithDestroyHandler(this.filter$, (value) => {
            if (value === undefined) {
                this._workflowFilterLink$.next(undefined);
            } else if (value.shouldUpdate) {
                //update on every page, used in header
                this._workflowFilterLink$.next(
                    objectToUrlWithQueryParameter(
                        getQueryParamsFromWorkflowFilter(value),
                        //desired page is workflow page
                        navigationService.hostNameAndPort + '/' + APP_URL_WORKFLOWS,
                    ),
                );
            }
        });
    }

    mergeFilterIfChanged(partialWorkflowFilter: {
        page: number;
        pageSize: number;
        sorting: WorkflowFilterSortElement | undefined;
    }) {
        const currentFilter = this.currentFilter();

        if (
            currentFilter.page !== partialWorkflowFilter.page ||
            currentFilter.pageSize !== partialWorkflowFilter.pageSize ||
            !isSameWorkflowFilterSortElement(partialWorkflowFilter.sorting, currentFilter.sorting)
        ) {
            this.mergeFilterAndUpdate(partialWorkflowFilter as WorkflowFilter);
        } else {
            //just ignore
        }
    }

    async cleanupOldFilterStates(filter: WorkflowFilter): Promise<Partial<WorkflowFilter> | undefined> {
        if (filter.processInstanceId) {
            //case processInstanceIdSelected, clean-up processDefinitionFilter
            const valuesToResetOnProcessInstanceId = {
                //remove all
                waitingOnly: undefined,
                incidentsOnly: undefined,
                state: undefined,
                dateRange: undefined,
                showHistoricLabels: undefined,
            } satisfies Partial<WorkflowFilter>;
            //update filter to assure correctly updated
            this.mergeFilter({...valuesToResetOnProcessInstanceId, shouldUpdate: false});
            //return valuesToReset
            return valuesToResetOnProcessInstanceId;
        }
        return undefined;
    }

    get workflowFilterLink$(): Observable<string | undefined> {
        return this._workflowFilterLink$.asObservable();
    }
}
export const WORKFLOW_FILTER_IDENTIFIER = 'WorkflowFilter';
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
    custom = 'custom',
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
