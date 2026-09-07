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

import {WorkflowFilterActivity} from "src/app/components/workflow-page/service/workflow-filter.service";
import {notEmpty} from "src/app/components/utils/common.utils";
import {HistoricActivityInstanceDto, HistoricIncidentDto} from "src/app/shared/services/camunda-api";
import {getActivityNamesFromDocument} from "src/app/utils/bpmn/BPMNFormatUtils";

export function getActivityFilter(
    bpmnDocument: Document | undefined,
    activityId: string | undefined,
): undefined | WorkflowFilterActivity {
    if (activityId && bpmnDocument) {
        const activityNamesFromDocument = getActivityNamesFromDocument(bpmnDocument);
        return {
            id: activityId,
            name: activityNamesFromDocument[activityId],
        } satisfies WorkflowFilterActivity;
    }
    if (activityId) {
        //only id present, no document
        return {
            id: activityId,
            name: undefined,
        } satisfies WorkflowFilterActivity;
    }
    return undefined;
}

function isRunningActivity(
    activity: HistoricActivityInstanceDto,
    processInstanceIncidents: HistoricIncidentDto[],
) {
    return (
        !activity.endTime &&
        !processInstanceIncidents.find((incident) => incident.activityId === activity.activityId)
    );
}

export function getRunningActivitiesWithNoIncident(
    processInstanceAuditLog: HistoricActivityInstanceDto[],
    processInstanceIncidents: HistoricIncidentDto[],
) {
    return processInstanceAuditLog
        .filter((activity) => isRunningActivity(activity, processInstanceIncidents))
        .map((activity) => activity)
        .filter(notEmpty);
}
