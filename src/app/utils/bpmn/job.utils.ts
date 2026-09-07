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

import {HistoricJobLogDto, HistoricProcessInstanceDto} from "src/app/shared/services/camunda-api";
import {HistoricProcessInstance} from "src/app/components/workflow-page/models/HistoricProcessInstance";

export function allJobSelectionsTerminateAble(selectedEntries: HistoricProcessInstance[]) {
    if (!selectedEntries.length) {
        return false;
    }
    return selectedEntries.every(
        (instance: HistoricProcessInstance) =>
            instance.state !== HistoricProcessInstanceDto.StateEnum.ExternallyTerminated &&
            instance.state !== HistoricProcessInstanceDto.StateEnum.Completed,
    );
}

export function checkJobsCanBeUnsuspended(selectedEntries: HistoricProcessInstance[]) {
    if (!selectedEntries.length) {
        return false;
    }
    for (let entry of selectedEntries) {
        if (entry.state != HistoricProcessInstanceDto.StateEnum.Suspended) {
            return false;
        }
    }
    return true;
}
export function checkJobsCanBeSuspended(selectedEntries: HistoricProcessInstance[]) {
    if (!selectedEntries.length) {
        return false;
    }
    for (let entry of selectedEntries) {
        if (
            entry.state == HistoricProcessInstanceDto.StateEnum.Suspended ||
            entry.state == HistoricProcessInstanceDto.StateEnum.Completed ||
            entry.state == HistoricProcessInstanceDto.StateEnum.ExternallyTerminated
        ) {
            return false;
        }
    }
    return true;
}

/**
 * Sorting JobLogs into a Record using a filter.
 * @param jobLogs - The jobLogs to sort
 * @param arrayFilter - A filter to get only relevant jobLogs
 * @return A Record with sorted <activityId(string),HistoricJobLogDto[]>
 */
export function getSortedJobLogs(
    jobLogs: HistoricJobLogDto[],
    arrayFilter: (log: HistoricJobLogDto) => boolean | null | undefined,
) {
    return jobLogs.filter(arrayFilter).reduce(
        (previousValue, currentValue) => {
            const activityId = currentValue.activityId;
            if (activityId) {
                const copyJobLogs = [...(previousValue[activityId] || [])];
                copyJobLogs.push(currentValue);
                previousValue[activityId] = copyJobLogs;
            }
            return previousValue;
        },
        {} as Record<string, HistoricJobLogDto[]>,
    );
}
