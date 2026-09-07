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

import {ColumnDefSortAndFilterable} from 'src/app/shared/components/table/data/TableTypes';
import {LogFilter} from 'src/app/app-pages/log/models/LogModels';
import {WorkflowFilter} from 'src/app/components/workflow-page/service/workflow-filter.service';
export const LOGS_COLUMNS_ACTIVITY: ColumnDefSortAndFilterable[] = [
    {field: 'timestamp', header: 'Time'},
    {field: 'logLevel', header: 'LogLevel'},
    {field: 'message', header: 'Message'},
    {field: 'thread', header: 'thread'},
];
export const LOGS_COLUMNS_DEFAULT: ColumnDefSortAndFilterable[] = [
    {field: 'timestamp', header: 'Time'},
    {field: 'logLevel', header: 'LogLevel'},
    {field: 'message', header: 'Message'},
    //all columns below are optional defined by current openapi version
    {field: 'requestId', header: 'requestId'},
    {field: 'processInstanceId', header: 'processInstanceId'},
    {field: 'name', header: 'name'},
    {field: 'processDefinitionId', header: 'processDefinitionId'},
    {field: 'thread', header: 'thread'},
    {field: 'topicGroup', header: 'topicGroup'},
    {field: 'topic', header: 'topic'},
    {field: 'execution', header: 'execution'},
    {field: 'processBridge', header: 'processBridge'},
];
export function getQueryParamsForLogFilter(filter: LogFilter | undefined) {
    return {
        orderByField: filter?.orderByField,
        ascendingOrder: filter?.ascendingOrder,
        page: filter?.page,
        pageSize: filter?.pageSize,
        processInstanceId: filter?.processInstanceId,
        requestId: filter?.requestId,
        logLevel: filter?.logLevel,
        offset: filter?.offset,
    };
}

export function getLogFilterBody(logFilter: LogFilter, workflowFilter: WorkflowFilter) {
    const body = {} as Partial<any>;
    if (logFilter.offset !== undefined && logFilter.pageSize !== undefined) {
        body.pagination = {
            offset: logFilter.offset,
            limit: logFilter.pageSize,
        };
    }
    const constraints = {} as Partial<any>;
    if (workflowFilter.processInstanceId && workflowFilter.processInstanceId !== '') {
        const activityInstanceId = workflowFilter.activity?.activityInstance?.id;
        if (activityInstanceId && activityInstanceId !== '') {
            //only select activityInstanceId, no need for processInstanceId
            constraints.activityInstanceId = {
                matchValue: [activityInstanceId],
                matchType: 'ALL',
                caseSensitive: null,
            };
        } else {
            constraints.processInstanceId = {
                matchValue: [workflowFilter.processInstanceId ?? ''],
                matchType: 'ALL',
                caseSensitive: null,
            };
        }
    }

    if (workflowFilter.requestId && workflowFilter.requestId !== '') {
        constraints.requestId = {
            matchValue: [workflowFilter.requestId],
            matchType: 'ALL',
            caseSensitive: null,
        };
    }
    if (logFilter.logLevel && logFilter.logLevel !== '') {
        constraints.logLevel = {
            matchValue: [logFilter.logLevel],
            matchType: 'ALL',
            caseSensitive: null,
        };
    }

    body.constraints = constraints;
    return body;
}
