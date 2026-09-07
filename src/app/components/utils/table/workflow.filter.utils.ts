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

import {ClrDatagridComparatorInterface, ClrDatagridStateInterface} from '@clr/angular';
import {TableLazyLoadEvent} from 'primeng/table';

export enum WorkFlowFilterSortDefinition {
    instanceId = 'instanceId',
    definitionId = 'definitionId',
    businessKey = 'businessKey',
    startTime = 'startTime',
    //unclear if implemented completely in backend, use with cautious
    latestStartTime = 'latestStartTime',
    //unclear if implemented completely in backend, use with cautious
    latestEndTime = 'latestEndTime',
    endTime = 'endTime',
    duration = 'duration',
    definitionKey = 'definitionKey',
    definitionName = 'definitionName',
    definitionVersion = 'definitionVersion',
    tenantId = 'tenantId',
}

export enum SortOrder {
    asc = 'asc',
    desc = 'desc',
}

export interface WorkflowFilterSortElement {
    sortBy: WorkFlowFilterSortDefinition;
    sortOrder: SortOrder;
}

function getDefinitionByString(by: string | ClrDatagridComparatorInterface<any> | undefined) {
    return WorkFlowFilterSortDefinition[by as keyof typeof WorkFlowFilterSortDefinition];
}

/**
 * Creates a single element of a WorkflowFilterSortElement in an array. This Element represents how the backend should sort the data.
 * Currently only one sort per data grid is provided.
 */
export function getSortingFromClrDataGridState(
    state: ClrDatagridStateInterface,
): WorkflowFilterSortElement[] | undefined {
    if (!state.sort) {
        return undefined;
    }
    return [
        {
            sortBy: getDefinitionByString(state.sort?.by),
            sortOrder: state.sort?.reverse ? SortOrder.desc : SortOrder.asc,
        } satisfies WorkflowFilterSortElement,
    ];
}

export function getSortingFromPrimeNGTableState(
    state: TableLazyLoadEvent,
): WorkflowFilterSortElement | undefined {
    if (state.sortField && typeof state.sortField === 'string') {
        return {
            sortBy: getDefinitionByString(state.sortField),
            sortOrder: state.sortOrder === 1 ? SortOrder.asc : SortOrder.desc,
        } satisfies WorkflowFilterSortElement;
    }
    return undefined;
}
export function isSameWorkflowFilterSortElement(
    sorting: WorkflowFilterSortElement | undefined,
    sorting2: WorkflowFilterSortElement | undefined,
) {
    return sorting?.sortBy === sorting2?.sortBy && sorting?.sortOrder === sorting2?.sortOrder;
}
