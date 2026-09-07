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

import {Pipe, PipeTransform} from '@angular/core';
import {BPMNParameter} from 'src/app/components/process-instance-page/components/process-instance-page/process-instance-tab/process-instance-tab-bpmn-parameter.component';
import {
    HistoricActivityInstanceDto,
    HistoricJobLogDto,
    HistoricProcessInstanceDto,
    HistoricVariableInstanceDto,
} from 'src/app/shared/services/camunda-api';
import {HistoricIncidentDetails} from 'src/app/shared/services/wmp-api/custom/model/incidents-models';

@Pipe({name: 'ParameterFilterActivity', standalone: true})
export class ParameterFilterActivityPipe implements PipeTransform {
    transform(
        parameters: HistoricVariableInstanceDto[],
        activityInstance: HistoricActivityInstanceDto | undefined,
        bpmnParameters: BPMNParameter[],
    ): HistoricVariableInstanceDto[] {
        if (activityInstance?.id && activityInstance?.id !== '')
            return parameters.filter((parameter) => {
                if (parameter?.activityInstanceId === parameter?.processInstanceId) {
                    //case activityInstance&processInstance the same,
                    const parametersOfActivity = bpmnParameters.filter(
                        (v) =>
                            getActivityIdNameOnly(v.activityId) ===
                            getActivityIdNameOnly(activityInstance?.activityId),
                    );
                    //use name of parameter to identify with stored key
                    return !!parametersOfActivity.find((p) => parameter.name === p.key);
                }

                //example activity instance id: Activity_SleepTask1:175c8a33-8ba5-11ef-9e1a-00155df2635d
                const backendParameterIdOnly = getActivityInstanceIdOnly(parameter.activityInstanceId);
                const frontendSelectionIdOnly = getActivityInstanceIdOnly(activityInstance?.id);

                return (
                    backendParameterIdOnly &&
                    frontendSelectionIdOnly &&
                    frontendSelectionIdOnly === backendParameterIdOnly
                );
            });
        //case no selection, return all
        return parameters;
    }
}
function getActivityIdNameOnly(activityId: string | undefined | null) {
    //<name>:<id> always return the name before :
    return activityId?.split(':')[0];
}
function getActivityInstanceIdOnly(activityInstanceId: string | undefined | null) {
    if (!activityInstanceId) {
        return undefined;
    }
    const splitActivity = activityInstanceId.split(':');
    if (splitActivity.length == 2) {
        //case 1 <name>:<id> just return id
        return splitActivity[1];
    } else if (splitActivity.length == 1) {
        //case 2 <id> just return id
        return splitActivity[0];
    } else {
        throw new Error(`ActivityInstanceId could not be parsed: ${activityInstanceId}`);
    }
}
@Pipe({name: 'BPMNParameterFilterActivity', standalone: true})
export class BPMNParameterFilterActivityPipe implements PipeTransform {
    transform(parameters: BPMNParameter[], selectedActivityName: string): BPMNParameter[] {
        if (selectedActivityName && selectedActivityName !== '')
            return parameters.filter((parameter) => parameter.activityId === selectedActivityName);
        return parameters;
    }
}

@Pipe({name: 'IncidentsFilterActivity', standalone: true})
export class IncidentsFilterActivityPipe implements PipeTransform {
    transform(incidents: HistoricIncidentDetails[], selectedActivityName: string): HistoricIncidentDetails[] {
        if (selectedActivityName && selectedActivityName !== '')
            return incidents.filter((incident) => incident.activityId === selectedActivityName);
        return incidents;
    }
}

@Pipe({name: 'AuditLogFilter', standalone: true})
export class AuditLogFilterPipe implements PipeTransform {
    transform(
        historicActivity: HistoricActivityInstanceDto[],
        selectedActivityName: string,
    ): HistoricActivityInstanceDto[] {
        if (selectedActivityName && selectedActivityName !== '')
            return historicActivity.filter((incident) => incident.activityId === selectedActivityName);
        return historicActivity;
    }
}

@Pipe({name: 'JobLogFilter', standalone: true})
export class JobLogFilterPipe implements PipeTransform {
    transform(historicActivity: HistoricJobLogDto[], selectedActivityId: string): HistoricJobLogDto[] {
        if (selectedActivityId && selectedActivityId !== '')
            return historicActivity.filter((incident) => incident.activityId === selectedActivityId);
        return historicActivity;
    }
}

@Pipe({name: 'InstanceTitle', standalone: true})
export class InstanceTitlePipe implements PipeTransform {
    transform(processInstance: HistoricProcessInstanceDto | null | undefined): string {
        if (processInstance && processInstance.processDefinitionKey)
            return processInstance.processDefinitionKey;
        return '';
    }
}

@Pipe({name: 'InstanceRequestId', standalone: true})
export class InstanceRequestId implements PipeTransform {
    transform(processInstance: HistoricProcessInstanceDto | null | undefined): string {
        if (processInstance && processInstance.businessKey) return processInstance.businessKey;
        return '';
    }
}
