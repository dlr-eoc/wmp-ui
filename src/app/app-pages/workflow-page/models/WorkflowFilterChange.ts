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

import {WorkflowFilter} from 'src/app/components/workflow-page/service/workflow-filter.service';

export interface WorkflowFilterChange {
    isChangedProcessInstanceId: boolean;
    isChangedProcessDefinitionId: boolean;
    isRemovedProcessInstanceId: boolean;
    isRemovedProcessDefinition: boolean;
    isNoInstanceOrDefinitionId: boolean;
    isElementSelectionChange: boolean;
    isChangedHistoricLabels: boolean;
    isChangedTimeRange: boolean;
}

export function getWorkflowFilterChange(
    filter: WorkflowFilter | undefined,
    oldFilter: WorkflowFilter | undefined,
): WorkflowFilterChange | undefined {
    if (!filter) {
        return undefined;
    }
    const processInstanceId = filter.processInstanceId;
    const processDefinitionId = filter.processDefinition?.id;
    return {
        isChangedProcessInstanceId:
            processInstanceId !== undefined && processInstanceId !== oldFilter?.processInstanceId,
        isChangedProcessDefinitionId:
            processDefinitionId !== undefined && processDefinitionId !== oldFilter?.processDefinition?.id,
        isRemovedProcessInstanceId:
            processInstanceId === undefined &&
            processDefinitionId !== undefined &&
            oldFilter?.processInstanceId !== undefined,
        isRemovedProcessDefinition:
            processDefinitionId === undefined && oldFilter?.processDefinition?.id !== undefined,
        isNoInstanceOrDefinitionId: processDefinitionId === undefined && processInstanceId === undefined,
        isElementSelectionChange:
            filter.activity?.id !== oldFilter?.activity?.id ||
            filter.callActivity?.id !== oldFilter?.callActivity?.id ||
            filter.sequenceFlow?.id !== oldFilter?.sequenceFlow?.id,
        isChangedHistoricLabels: filter.showHistoricLabels !== oldFilter?.showHistoricLabels,
        isChangedTimeRange:
            filter.dateRange?.from?.toISOString() !== oldFilter?.dateRange?.from?.toISOString() ||
            filter.dateRange?.to?.toISOString() !== oldFilter?.dateRange?.to?.toISOString(),
    } satisfies WorkflowFilterChange;
}
