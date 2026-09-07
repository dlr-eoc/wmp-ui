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

import {HistoricProcessInstance} from 'src/app/components/workflow-page/models/HistoricProcessInstance';
import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';
import {AlertService, WmpAlertType} from 'src/app/shared/services/alert.service';
import {WmpHistoricProcessInstanceDto} from 'src/app/shared/services/wmp-api/models/WmpHistoricProcessInstanceDto';
import {HistoricIncidentDto, HistoricProcessInstanceDto} from 'src/app/shared/services/camunda-api';
import {OperatonJobService} from 'src/app/shared/services/wmp-api/custom/operaton-job.service';
import {OperatonExternalTaskService} from 'src/app/shared/services/wmp-api/custom/operaton-external-task.service';

export function isIncident(processInstance: HistoricProcessInstance | undefined) {
    if (!processInstance) {
        return false;
    }

    return (
        processInstance?.state == HistoricProcessInstanceDto.StateEnum.Active &&
        (processInstance.incidents?.length ?? 0) > 0
    );
}

export async function getIncidents(processInstanceId: string | null | undefined, api: WmpApiService) {
    return await api.getHistoricIncidents({
        processInstanceId: processInstanceId ?? undefined,
    });
}

export async function getInstanceWithIncidents(
    processInstance: WmpHistoricProcessInstanceDto,
    api: WmpApiService,
) {
    const incidents = (await getIncidents(processInstance.id, api)) ?? [];
    return {...processInstance, incidents: incidents} as HistoricProcessInstance;
}

export async function getInstancesWithIncidents(
    instances: WmpHistoricProcessInstanceDto[],
    api: WmpApiService,
) {
    return Promise.all(
        instances.map(async (processInstances) => {
            return await getInstanceWithIncidents(processInstances, api);
        }),
    );
}

/**
 * Restarting an instance with given api. Two cases are available: "failedJob" or "failedExternalTask".
 * Those need to be handled separately.
 * @param instance - the instance to restart
 * @param api - the api to use
 * @param alertService the alert service for messages on unsuccessful restarts
 */
export async function retryInstance(
    instance: HistoricProcessInstance,
    api: WmpApiService,
    alertService: AlertService,
) {
    const incidents = instance.incidents;
    if (incidents && incidents.length > 0) {
        return retryIncident(instance, incidents[0], api, alertService);
    }
    alertService.addAlert({
        text: 'Instance could not be restarted.',
        type: WmpAlertType.ERROR,
        id: 'workflow_utils_restart_instance',
    });
    return Promise.resolve();
}

//TODO use this retry incident and other functions in this utils class to restart/retry incidents or activities
/**
 * Restarting an instance with given api. Two cases are available: "failedJob" or "failedExternalTask".
 * Those need to be handled separately.
 * @param instance - the instance
 * @param incidentToRestart - the incident to use to restart
 * @param api - the api to use
 * @param alertService the alert service for messages on unsuccessful restarts
 */
export async function retryIncident(
    instance: HistoricProcessInstance,
    incidentToRestart: HistoricIncidentDto,
    api: WmpApiService,
    alertService: AlertService,
) {
    if (incidentToRestart.incidentType === 'failedJob') {
        if (instance.incidentJobId) {
            return api.restartJob(instance.incidentJobId);
        }
    }
    if (incidentToRestart.incidentType === 'failedExternalTask') {
        if (instance.id) {
            let externalTasks = await api.getExternalTask(instance.id);
            if (externalTasks.length !== 0 && externalTasks[0].id)
                return api.restartExternalTask(externalTasks[0].id);
            return;
        }
    }

    alertService.addAlert({
        text: 'Instance could not be restarted.',
        type: WmpAlertType.ERROR,
        id: 'workflow_utils_restart_instance',
    });
    return Promise.resolve();
}

/**
 * Restarting an instance with given jobService. Two cases are available: "failedJob" or "failedExternalTask".
 * Those need to be handled separately.
 * @param incidentToRestart - the incident to use to restart
 * @param jobService - the jobService to use
 * @param alertService the alert service for messages on unsuccessful restarts
 * @param externalTaskService
 */
export async function retryIncidentGiven(
    incidentToRestart: HistoricIncidentDto,
    jobService: OperatonJobService,
    alertService: AlertService,
    externalTaskService: OperatonExternalTaskService,
) {
    if (incidentToRestart.incidentType === 'failedJob') {
        return jobService.restartIncident(incidentToRestart);
    }
    if (incidentToRestart.incidentType === 'failedExternalTask') {
        return externalTaskService.restartExternalTask(incidentToRestart);
    }

    alertService.addAlert({
        text: 'Instance could not be restarted.',
        type: WmpAlertType.ERROR,
        id: 'workflow_utils_restart_instance',
    });
    return Promise.resolve();
}
