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

import {ActivityStatisticsResultDto} from "src/app/shared/services/camunda-api";
import {WmpHistoricProcessInstanceStatisticsDto} from "src/app/shared/services/wmp-api/models/WmpHistoricProcessInstanceStatisticsDto";
import {BpmnDiagramOverlayLabel} from "src/app/models/bpmn-diagram.model";
import {
    COLOR_COMPLETED_LABEL,
    COLOR_INCIDENT,
    COLOR_RUNNING_LABEL,
    COLOR_WAITING_LABEL,
} from "src/app/shared/components/bpmn-diagram/bpmn-diagram.utils";

const offsetOneLabel = 17.42;
export function convertStatisticsToLabels(
    bpmnDocument: Document | undefined,
    activityStatistics: Array<ActivityStatisticsResultDto>,
    processDefinitionHistoryStatistics: Array<WmpHistoricProcessInstanceStatisticsDto>,
    activityHistoryStatistics: Array<WmpHistoricProcessInstanceStatisticsDto>,
) {
    const labels: BpmnDiagramOverlayLabel[] = [];
    const completeHistory = [...activityHistoryStatistics, ...processDefinitionHistoryStatistics];

    completeHistory.map((historyStatistic) => {
        const activityStatisticResult = activityStatistics.find((elem) => elem.id == historyStatistic.id);
        const processDefinitionHistory = processDefinitionHistoryStatistics.find(
            (elem) => elem.id == historyStatistic.id,
        );
        const activityHistory = activityHistoryStatistics.find((elem) => elem.id == historyStatistic.id);

        let currentOffset = 0;
        const isCurrentlyRunning = processDefinitionHistory !== undefined;

        if (isCurrentlyRunning) {
            labels.push({
                elementId: processDefinitionHistory.id || "",
                value: processDefinitionHistory?.instanceCount || 0,
                color: COLOR_RUNNING_LABEL,
                metadata: "active",
                description: "Running Instances",
                type: "label",
            } satisfies BpmnDiagramOverlayLabel);
            currentOffset += offsetOneLabel;
        }

        if (activityStatisticResult?.incidents?.length || 0 > 0) {
            const incidentCount = activityStatisticResult?.incidents?.reduce(
                (accumulator, current) => accumulator + (current?.incidentCount || 0),
                0,
            );
            labels.push({
                elementId: activityStatisticResult?.id || "",
                value: incidentCount || 0,
                color: COLOR_INCIDENT,
                metadata: "incident",
                offset: currentOffset,
                description: "Incidents",
                type: "label",
            });
            currentOffset += offsetOneLabel;
        }

        const numberSuccessful =
            (activityStatisticResult?.instances || 0) - (processDefinitionHistory?.instanceCount || 0);
        if (numberSuccessful > 0 && processDefinitionHistory) {
            labels.push({
                elementId: historyStatistic.id || "",
                value: numberSuccessful,
                color: COLOR_WAITING_LABEL,
                metadata: "waiting",
                offset: currentOffset,
                description: "Waiting Instances",
                type: "label",
            });
            currentOffset += offsetOneLabel;
        }

        if (activityHistory) {
            labels.push({
                elementId: activityHistory.id || "",
                value: activityHistory.instanceCount || 0,
                color: COLOR_COMPLETED_LABEL,
                metadata: "completed",
                description: "Historic",
                offset: isTaskActivity(activityHistory.id, bpmnDocument) ? currentOffset : 0,
                type: "label",
                historic: true,
            });
        }
    });
    return labels;
}

function isTaskActivity(activityId: string, bpmnDocument: Document | undefined) {
    if (bpmnDocument !== undefined) {
        const nodes = bpmnDocument.querySelectorAll(
            "task, serviceTask, receiveTask, sendTask, manualTask, businessRuleTask, userTask, scriptTask",
        );

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes.item(i);
            const bpmnActivityId = node?.getAttribute("id");
            if (activityId == bpmnActivityId) {
                return true;
            }
        }
    }
    return false;
}
