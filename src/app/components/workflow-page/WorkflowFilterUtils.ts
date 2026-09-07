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
import {formatDate} from '@angular/common';

export function getFilterValues(key: keyof WorkflowFilter, workflowFilter: WorkflowFilter, locale: string) {
    switch (key) {
        case 'waitingOnly':
            if (workflowFilter[key]) {
                return {
                    name: key,
                    value: 'Waiting instances',
                } satisfies WorkflowFilterDataElement;
            }
            break;
        case 'incidentsOnly':
            if (workflowFilter[key]) {
                return {
                    name: key,
                    value: 'Incidents only',
                } satisfies WorkflowFilterDataElement;
            }
            break;
        case 'activity':
        case 'callActivity':
            const activity = workflowFilter[key] as WorkflowFilterActivity;
            if (activity) {
                return {
                    name: key,
                    value: 'Activity (' + (activity?.name ?? activity.id ?? '') + ')',
                } satisfies WorkflowFilterDataElement;
            }
            break;

        case 'state':
            const state = workflowFilter[key] as string | undefined;
            if (state) {
                return {
                    name: key,
                    value: 'State (' + state + ')',
                } satisfies WorkflowFilterDataElement;
            }
            break;
        case 'dateRange':
            const dateRange: DateRange | undefined = workflowFilter[key] as DateRange | undefined;
            if (dateRange && dateRange.from && dateRange.to) {
                return {
                    name: key,
                    value:
                        'Date: From (' +
                        formatDate(dateRange.from, 'medium', locale) +
                        ') To (' +
                        formatDate(dateRange.to, 'medium', locale) +
                        ')',
                } satisfies WorkflowFilterDataElement;
            }
            break;
        case 'processInstanceId':
            const processInstanceId = workflowFilter[key] as string | undefined;
            if (processInstanceId) {
                return {
                    name: key,
                    value: 'ProcessInstance (' + processInstanceId + ')',
                } satisfies WorkflowFilterDataElement;
            }
            break;
        case 'processDefinition':
            const processDefinition = workflowFilter[key] as WorkflowFilterProcessDefinition | undefined;
            if (processDefinition) {
                return {
                    name: key,
                    value: 'Process Definition (' + processDefinition.key + ')',
                } satisfies WorkflowFilterDataElement;
            }
            break;
    }
    return undefined;
}

export interface WorkflowFilterDataElement {
    name: keyof WorkflowFilter;
    value: string;
}
