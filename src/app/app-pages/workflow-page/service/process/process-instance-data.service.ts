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

import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';
import {ProcessInstanceParameterService} from 'src/app/components/process-instance-page/service/process-instance-parameter.service';
import {ProcessInstanceJobService} from 'src/app/components/process-instance-page/service/process-instance-job.service';
import {ProcessInstanceIncidentService} from 'src/app/components/process-instance-page/service/process-instance-incident.service';
import {ProcessInstanceActivityService} from 'src/app/components/process-instance-page/service/process-instance-activity.service';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {HistoricProcessInstanceDto, ProcessDefinitionDto} from 'src/app/shared/services/camunda-api';
import {
    WorkflowFilter,
    WorkflowFilterProcessDefinition,
} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {AlertService} from 'src/app/shared/services/alert.service';
import {WorkflowBpmnService} from 'src/app/app-pages/workflow-page/service/workflow-bpmn.service';

export class ProcessInstanceDataService {
    private readonly wmpApiService: WmpApiService;

    private readonly parameterService: ProcessInstanceParameterService;
    private readonly jobService: ProcessInstanceJobService;
    private readonly incidentService: ProcessInstanceIncidentService;
    private readonly activityService: ProcessInstanceActivityService;
    private readonly alertService: AlertService;
    private readonly workflowBpmnService: WorkflowBpmnService;

    private _processInstance$ = new BehaviorSubject<HistoricProcessInstanceDto | undefined>(undefined);
    private _processInstanceErrorMessage$: Subject<string> = new Subject();
    private _processInstanceInfoMessage$: Subject<string> = new Subject();
    private _processDefinition$: Subject<ProcessDefinitionDto> = new Subject();
    private _dataUpdateRunning$: Subject<boolean> = new Subject();

    constructor(
        wmpApiService: WmpApiService,
        parameterService: ProcessInstanceParameterService,
        jobService: ProcessInstanceJobService,
        incidentService: ProcessInstanceIncidentService,
        activityService: ProcessInstanceActivityService,
        alertService: AlertService,
        workflowBpmnService: WorkflowBpmnService,
    ) {
        this.wmpApiService = wmpApiService;
        this.parameterService = parameterService;
        this.jobService = jobService;
        this.incidentService = incidentService;
        this.activityService = activityService;
        this.alertService = alertService;
        this.workflowBpmnService = workflowBpmnService;
    }

    async updateDataForProcessInstanceId(filter: WorkflowFilter, isChangedProcessDefinitionId: boolean) {
        this._dataUpdateRunning$.next(true);
        const processInstanceId = filter ? filter?.processInstanceId : undefined;

        if (processInstanceId) {
            let filterToOverWrite: Partial<WorkflowFilter> | undefined = undefined;
            const processInstance = await this.getProcessInstanceFromId(processInstanceId);
            if (processInstance && processInstance?.processDefinitionId && processInstance?.id) {
                if (processInstance?.state == HistoricProcessInstanceDto.StateEnum.ExternallyTerminated) {
                    this._processInstanceInfoMessage$.next('This process instance was terminated.');
                    this.alertService.addWarning({text: 'This process instance was terminated.'});
                }
                await this.updateInstanceData(processInstance, processInstance.id);
                if (isChangedProcessDefinitionId) {
                    //case both changed, check for correct processDefinitionId
                    if (processInstance?.processDefinitionId !== filter.processDefinition?.id) {
                        console.debug('Invalid process definition id found in filter.');
                    }
                }
                filterToOverWrite = this.updateProcessDefinitionFromInstance(processInstance, filter);
            } else {
                this.alertService.addWarning({text: 'No process instance found.'});
                this._processInstance$.next(undefined);
            }
            this._dataUpdateRunning$.next(false);
            return filterToOverWrite;
        }

        this._dataUpdateRunning$.next(false);
        return filter;
    }

    private async updateInstanceData(processInstance: HistoricProcessInstanceDto, processInstanceId: string) {
        this._processInstance$.next(processInstance);

        //updating all data for tables below bpmn

        await this.parameterService.updateInstanceParameter(processInstanceId);

        await this.activityService.updateActivityData(processInstanceId);

        await this.incidentService.updateIncidentData(processInstanceId);

        await this.jobService.updateJobInfo(processInstanceId);
    }

    private async updateProcessDefinitionFromInstance(
        processInstance: HistoricProcessInstanceDto,
        filter: WorkflowFilter,
    ) {
        let filterToOverwriteOldFilter = filter;
        if (processInstance && processInstance.processDefinitionId) {
            //retrieve processDefinitionDto from available id given by instance
            return this.wmpApiService
                .getProcessDefinition(processInstance.processDefinitionId)
                .then(async (processDefinitionDto) => {
                    if (processDefinitionDto) {
                        //needed for updates while navigating with call activities
                        this._processDefinition$.next(processDefinitionDto);
                        const processDefinitionForFilter =
                            this.getWorkflowFilterProcessDefinition(processDefinitionDto);
                        // Case no process definition present in filter but found for process instance
                        // - update old filter to assure no change detected in next update cycle
                        filterToOverwriteOldFilter = {
                            ...filterToOverwriteOldFilter,
                            processDefinition: processDefinitionForFilter,
                        };
                    }
                    await this.workflowBpmnService.updateBPMNFromProcessInstance(
                        filter,
                        processInstance,
                        processDefinitionDto,
                    );
                    return filterToOverwriteOldFilter;
                });
        } else {
            //case data update wrong, handle here if needed later
            return filter;
        }
    }

    private async getProcessInstanceFromId(piId: string) {
        let processInstance;
        try {
            processInstance = await this.wmpApiService.getHistoricProcessInstance(piId);
        } catch (error: any) {
            console.error(error);
            if (error?.status === 404) {
                this._processInstanceErrorMessage$.next(`Process Instance with Id: ${piId} does not exist.`);
            } else {
                this._processInstanceErrorMessage$.next(
                    `Error while retrieving Process Instance with Id: ${piId}`,
                );
            }
        }
        return processInstance;
    }
    /**
     * @param processDefinitionDto - the found processDefinition
     * @private
     */
    private getWorkflowFilterProcessDefinition(processDefinitionDto: ProcessDefinitionDto) {
        return {
            id: processDefinitionDto.id,
            key: processDefinitionDto.key,
            version: processDefinitionDto.version,
        } satisfies WorkflowFilterProcessDefinition;
    }
    get dataUpdateRunning$(): Observable<boolean> {
        return this._dataUpdateRunning$.asObservable();
    }

    get processInstance$(): Observable<HistoricProcessInstanceDto | undefined> {
        return this._processInstance$.asObservable();
    }
}
