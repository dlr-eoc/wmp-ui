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
    DateRange,
    WorkflowFilter,
    WorkflowFilterActivity,
    WorkflowFilterProcessDefinition,
} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {ActivatedRouteSnapshot} from '@angular/router';
import {getNumberFromStringOrAlternative} from 'src/app/components/utils/number.utils';
import {ColumnDefSortAndFilterable} from 'src/app/shared/components/table/data/TableTypes';

export function getDataFromSnapshot(routeSnapshot: ActivatedRouteSnapshot, key: string) {
    return routeSnapshot.queryParamMap.get(key) || undefined;
}

export async function buildInitialWorkflowFilter(
    routeSnapshot: ActivatedRouteSnapshot,
    oldPageSize: number,
    oldPage: number,
    activity: WorkflowFilterActivity | undefined,
    processDefinition: WorkflowFilterProcessDefinition | undefined,
) {
    // Retrieve queryParams

    const processInstanceId = getDataFromSnapshot(routeSnapshot, 'processInstanceId');

    const presetName = getDataFromSnapshot(routeSnapshot, 'presetName');
    const after = getDataFromSnapshot(routeSnapshot, 'after');
    const before = getDataFromSnapshot(routeSnapshot, 'before');

    const state = getDataFromSnapshot(routeSnapshot, 'state');
    const messageFilter = getDataFromSnapshot(routeSnapshot, 'message');
    const page = getDataFromSnapshot(routeSnapshot, 'page');
    const pageSize = getDataFromSnapshot(routeSnapshot, 'pageSize');

    const incidentOnly = getDataFromSnapshot(routeSnapshot, 'incident') == 'true';
    const waitingOnly = getDataFromSnapshot(routeSnapshot, 'waiting') == 'true';

    const currentPageSize = getNumberFromStringOrAlternative(pageSize, oldPageSize);
    const currentPage = getNumberFromStringOrAlternative(page, oldPage);

    return {
        activity,
        state: state || undefined,
        incidentsOnly: incidentOnly ?? false,
        waitingOnly: waitingOnly ?? false,
        messageFilter: messageFilter || undefined,
        page: currentPage,
        pageSize: currentPageSize,
        processDefinition,
        processInstanceId: processInstanceId,
        dateRange:
            presetName && after && before
                ? {
                      presetName: presetName ?? 'custom',
                      from: new Date(after),
                      to: new Date(before),
                  }
                : undefined,
    } satisfies WorkflowFilter;
}

export function getQueryParamsFromWorkflowFilter(filter: WorkflowFilter) {
    return {
        processDefinitionId: filter?.processDefinition?.id,
        processInstanceId: filter?.processInstanceId,
        activityId: filter?.activity?.id,
        presetName: filter?.dateRange?.presetName,
        state: filter?.state,
        message: filter?.messageFilter === '' ? undefined : filter?.messageFilter,
        after: filter?.dateRange?.from?.toISOString(),
        before: filter?.dateRange?.to?.toISOString(),
        page: filter?.page,
        pageSize: filter?.pageSize,
        incident: filter?.incidentsOnly,
        waiting: filter?.waitingOnly,
    };
}
export const getWorkflowFilterFromStorage = (filterRaw: WorkflowFilter) => {
    if (filterRaw.dateRange) {
        //this date range is currently just a string, assure to convert to correct date!
        const dateRangeMuddy = {
            ...filterRaw.dateRange,
        } satisfies DateRange;
        if (dateRangeMuddy.from) dateRangeMuddy.from = new Date(dateRangeMuddy.from);
        if (dateRangeMuddy.to) dateRangeMuddy.to = new Date(dateRangeMuddy.to);
        return {...filterRaw, dateRange: dateRangeMuddy} satisfies WorkflowFilter;
    }
    return filterRaw;
};

export const WORKFLOW_COLUMNS_DEFAULT: ColumnDefSortAndFilterable[] = [
    {field: 'processDefinitionKey', header: 'Process Key', isFilterable: true},
    {field: 'id', header: 'Process Instance'},
    {field: 'businessKey', header: 'Request ID'},
    // {field: "deploymentId", header: "Deployment Id"},
    {field: 'state', header: 'State'},
    {field: 'startTime', header: 'Start Time', isSortable: true},
    {field: 'latestStartTime', header: 'Last Activity Start', isSortable: true},
    {field: 'latestEndTime', header: 'Last Activity End', isSortable: true},

    {field: 'incidentMessage', header: 'Message'},
];
