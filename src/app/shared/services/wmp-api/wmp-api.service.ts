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

import {HttpClient, HttpHeaders} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {addDays, addMonths} from 'date-fns';
import {formatInTimeZone} from 'date-fns-tz';
import {
    DateRange,
    DateRangeOptions,
    WorkflowFilter,
} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {
    ActivityStatisticsResultDto,
    Configuration,
    CountResultDto,
    ExternalTaskDto,
    HistoricActivityInstanceDto,
    HistoricIncidentDto,
    HistoricJobLogDto,
    HistoricProcessInstanceService,
    HistoricVariableInstanceDto,
    JobDefinitionDto,
    JobDto,
    ProcessDefinitionService,
    ProcessInstanceDto,
    ProcessInstanceService,
    TaskDto,
    VariableValueDto,
} from 'src/app/shared/services/camunda-api';
import {ConfigService} from 'src/app/shared/services/config.service';
import {WmpHistoricActivityInstanceStatisticsDto} from 'src/app/shared/services/wmp-api/models/WmpHistoricActivityInstanceStatisticsDto';
import {WmpHistoricProcessInstanceDto} from 'src/app/shared/services/wmp-api/models/WmpHistoricProcessInstanceDto';
import {WmpHistoricProcessInstanceStatisticsDto} from 'src/app/shared/services/wmp-api/models/WmpHistoricProcessInstanceStatisticsDto';
import {SituationViewModel} from 'src/app/shared/services/wmp-api/SituationViewModel';
import {TopicGroupDto} from 'src/app/shared/services/wmp-api/models/TopicGroupDto';
import {ExecutionDto} from 'src/app/shared/services/wmp-api/models/ExecutionDto';
import {lastValueFrom} from 'rxjs';
import {fillEmptyRecordArrayIfUndefined} from 'src/app/components/utils/record.utils';

@Injectable({
    providedIn: 'root',
})
export class WmpApiService {
    private httpClient = inject(HttpClient);
    private configService = inject(ConfigService);

    private processDefinitionService: ProcessDefinitionService;
    private processInstanceService: ProcessInstanceService;
    private historicProcessInstanceService: HistoricProcessInstanceService;
    private apiUrl = '';
    private baseUrl = '';

    constructor() {
        this.apiUrl = this.configService.settings.jakartaURL;
        this.baseUrl = this.apiUrl + '/engine/default';

        this.getApiVersion().catch((reason) => {
            window.alert(
                `Could not access wmp-api (${this.apiUrl})
Error:
${JSON.stringify(reason.message)} `,
            );
        });

        const config = new Configuration({
            // password: 'demo',
            // username: 'demo',
        });
        this.processDefinitionService = new ProcessDefinitionService(this.httpClient, this.baseUrl, config);
        this.processInstanceService = new ProcessInstanceService(this.httpClient, this.baseUrl, config);
        this.historicProcessInstanceService = new HistoricProcessInstanceService(
            this.httpClient,
            this.baseUrl,
            config,
        );
    }

    /**
     * @deprecated use bpmn document service to update from bpmn correctly
     */
    async getTimerJobDefinitions(): Promise<Array<JobDefinitionExtendedDto>> {
        return new Promise(async (res) => {
            let timers = await lastValueFrom(
                this.httpClient.get<Array<JobDefinitionDto>>(`${this.baseUrl}/job-definition`),
            );
            timers = timers.filter((t) => t.jobType?.includes('timer'));

            const collector: JobDefinitionExtendedDto[] = [];

            for (const t of timers) {
                if (t.processDefinitionId && t.activityId) {
                    const activityName = await this.getActivityName(
                        t.processDefinitionId || '',
                        t.activityId,
                    );

                    const lastActivity = (await this.getLastActivityForJobDefinition(t.id || ''))?.timestamp;

                    const dueDate = (await this.getLatestDueTimer(t.id || ''))?.dueDate;

                    collector.push(
                        Object.assign(t, {
                            activityName,
                            lastActivity: lastActivity ? new Date(lastActivity) : undefined,
                            dueDate: dueDate ? new Date(dueDate) : undefined,
                        }),
                    );
                }
            }

            res(collector);
        });
    }
    /**
     * @deprecated use bpmn document service to update from bpmn correctly
     */
    async getActivityName(processDefinitionId: string, activityId: string) {
        throw new Error('Deprecated function, use bpmn document service instead!');
        // if (!this.activityNames[activityId]) {
        //
        //     const bpmnDocument = await this.getProcessDefinitionAsDocument(processDefinitionId || "");
        //
        //     const node = bpmnDocument.querySelector(`#${activityId}`);
        //
        //     const activityName = node?.getAttribute("name");
        //     this.activityNames[activityId] = activityName || "";
        // }
        //
        return 'Error';
    }

    async suspendTimer(jobDefinitionId: string, includeJobs: boolean, suspended: boolean): Promise<void> {
        return new Promise(async (res) => {
            await lastValueFrom(
                this.httpClient.put<Array<JobDefinitionDto>>(
                    `${this.baseUrl}/job-definition/${jobDefinitionId}/suspended`,
                    {
                        includeJobs,
                        suspended,
                    },
                ),
            );
            res();
        });
    }

    async getLatestDueTimer(jobDefinitionId: string): Promise<JobDto> {
        return new Promise(async (res) => {
            const nextDueJob = await lastValueFrom(
                this.httpClient.get<Array<JobDto>>(`${this.baseUrl}/job`, {
                    params: {
                        active: true,
                        timers: true,
                        jobDefinitionId,
                        sortBy: 'jobDueDate',
                        sortOrder: 'desc',
                        maxResults: 1,
                    },
                }),
            );
            res(nextDueJob[0]);
        });
    }

    async getJobDefinition(jobDefinitionId: string): Promise<JobDefinitionDto> {
        return lastValueFrom(
            this.httpClient.get<JobDefinitionDto>(`${this.baseUrl}/job-definition/${jobDefinitionId}`),
        );
    }

    private formatQueryDate(date: Date): string {
        return formatInTimeZone(date, 'UTC', "yyyy-MM-dd'T'HH:mm:ss.sssXXX");
    }

    async getApiVersion(): Promise<string> {
        return lastValueFrom(this.httpClient.get<any>(`${this.baseUrl}/version`)).then((res) => res.version);
    }

    async getProcessDefinitions() {
        return lastValueFrom(this.processDefinitionService.getProcessDefinitions());
    }

    async getProcessDefinitionByKey(key: string) {
        return lastValueFrom(this.processDefinitionService.getProcessDefinitionByKey(key));
    }

    async getProcessDefinition(id: string) {
        return lastValueFrom(this.processDefinitionService.getProcessDefinition(id));
    }

    async getParameterMapOfProcessDefinition(bpmnDocument: Document) {
        let inputOutputMap: InputOutputMap = {};
        let inputParameters = bpmnDocument.getElementsByTagName('camunda:inputParameter');
        let outputParameters = bpmnDocument.getElementsByTagName('camunda:outputParameter');

        for (let i = 0; i < inputParameters.length; i++) {
            let activityId = (inputParameters[i].parentNode?.parentNode?.parentNode as any).id;

            let newInputs = inputOutputMap[activityId]?.inputs || [];
            newInputs.push({
                name: (inputParameters[i] as any).attributes.name.value,
                value: (inputParameters[i] as any).textContent,
            });
            if (inputOutputMap[activityId]) {
                inputOutputMap[activityId].inputs = newInputs;
            } else {
                inputOutputMap[activityId] = {inputs: newInputs, outputs: []};
            }
        }

        for (let i = 0; i < outputParameters.length; i++) {
            let activityId = (outputParameters[i].parentNode?.parentNode?.parentNode as any).id;

            let newOutputs = inputOutputMap[activityId]?.outputs || [];
            newOutputs.push({
                name: (outputParameters[i] as any).attributes.name.value,
                value: (outputParameters[i] as any).textContent,
            });
            if (inputOutputMap[activityId]) {
                inputOutputMap[activityId].outputs = newOutputs;
            } else {
                inputOutputMap[activityId] = {inputs: [], outputs: newOutputs};
            }
        }

        return inputOutputMap;
    }

    /**
     *
     * @param f - the workflowFilter to use
     */
    async getProcessInstancesWithActivities(f: WorkflowFilter | undefined) {
        const params = {} as any;
        const processDefinitionId = f?.processDefinition?.id;
        //using activityId or callActivityId if no activity defined
        const activityId = f?.activity?.id ?? f?.callActivity?.id;
        const waitingOnly: boolean | undefined = f?.waitingOnly;
        const dateRange = f?.dateRange;
        if (processDefinitionId) {
            params.processDefinitionId = processDefinitionId;
        }
        if (activityId) {
            if (waitingOnly) {
                params.executedActivityIdIn = activityId;
            } else {
                params.activeActivityIdIn = activityId;
            }
        }
        let startTimeAfterString: string | undefined = undefined;
        let startTimeBeforeString: string | undefined = undefined;
        const page: number | undefined = f?.page;
        const pageSize: number | undefined = f?.pageSize;
        const state: string | undefined = f?.state;
        const messageFilter: string | undefined = f?.messageFilter;
        const incidentOnly: boolean | undefined = f?.incidentsOnly;

        if (dateRange?.presetName) {
            switch (dateRange?.presetName) {
                case DateRangeOptions['last 7 days']:
                    startTimeAfterString = this.formatQueryDate(addDays(new Date(), -7));
                    break;
                case DateRangeOptions['last 14 days']:
                    startTimeAfterString = this.formatQueryDate(addDays(new Date(), -14));
                    break;
                case DateRangeOptions['last 2 months']:
                    startTimeAfterString = this.formatQueryDate(addMonths(new Date(), -2));
                    break;
                case DateRangeOptions['current month']:
                    const today = new Date();
                    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    startTimeAfterString = this.formatQueryDate(firstDayOfMonth);
                    break;
                case DateRangeOptions['custom']:
                    if (dateRange.from) {
                        startTimeAfterString = this.formatQueryDate(dateRange.from);
                    }

                    if (dateRange.to) {
                        startTimeBeforeString = this.formatQueryDate(dateRange.to);
                    }

                    break;
                default:
                    break;
            }
        }
        if (startTimeAfterString) {
            params.startedAfter = startTimeAfterString;
        }
        if (startTimeBeforeString) {
            params.startedBefore = startTimeBeforeString;
        }
        if (state) {
            params[state.toLocaleLowerCase()] = true;
        }
        if (incidentOnly) {
            params.incidentStatus = 'open';
        }
        if (messageFilter) {
            params.incidentMessageLike = '%' + messageFilter + '%';
        }

        if (page && pageSize) {
            params.firstResult = (page - 1) * pageSize;
        }

        if (pageSize) {
            params.maxResults = pageSize;
        }

        if (f?.processInstanceId) {
            params.processInstanceId = f?.processInstanceId;
        }

        //careful! currently just sorting of one element available
        if (f?.sorting) {
            const sorting = f?.sorting;
            params.sortBy = sorting.sortBy;
            params.sortOrder = sorting.sortOrder;
        }

        return lastValueFrom(
            this.httpClient.get<Array<WmpHistoricProcessInstanceDto>>(
                `${this.apiUrl}/wmp/history/process-instance`,
                {
                    params,
                },
            ),
        );
    }

    async deleteProcessInstance(processInstanceId: string | undefined | null) {
        return lastValueFrom(
            this.httpClient.delete<string>(
                `${this.baseUrl}/process-instance/${encodeURIComponent(String(processInstanceId))}`,
            ),
        );
    }

    async suspendProcessInstance(suspended: boolean, processInstanceId: string | undefined | null) {
        return lastValueFrom(
            this.httpClient.put<boolean>(
                `${this.baseUrl}/process-instance/${encodeURIComponent(String(processInstanceId))}/suspended`,
                {
                    suspended,
                },
            ),
        );
    }

    async getExternalTask(processInstanceId: string) {
        return lastValueFrom(
            this.httpClient.post<ExternalTaskDto[]>(`${this.baseUrl}/external-task`, {
                processInstanceId: processInstanceId,
            }),
        );
    }

    async getExecutionCount(processInstanceId: string) {
        return lastValueFrom(
            this.httpClient.post<CountResultDto>(`${this.baseUrl}/execution/count`, {
                processInstanceId: processInstanceId,
            }),
        ).then((value) => value.count);
    }

    async getProcessInstanceCount(f: WorkflowFilter | undefined) {
        const params = {} as any;
        const processDefinitionId = f?.processDefinition?.id;
        const activityId = f?.activity?.id;
        const dateRange = f?.dateRange;
        if (processDefinitionId) {
            params.processDefinitionId = processDefinitionId;
        }
        if (activityId) {
            params.activeActivityIdIn = activityId;
        }
        let startTimeAfterString: string | undefined = undefined;
        let startTimeBeforeString: string | undefined = undefined;
        const page: number | undefined = f?.page;
        const pageSize: number | undefined = f?.pageSize;
        const state: string | undefined = f?.state;
        const messageFilter: string | undefined = f?.messageFilter;
        const incidentOnly: boolean | undefined = f?.incidentsOnly;

        if (dateRange?.presetName) {
            switch (dateRange?.presetName) {
                case DateRangeOptions['last 7 days']:
                    startTimeAfterString = this.formatQueryDate(addDays(new Date(), -7));
                    break;
                case DateRangeOptions['last 14 days']:
                    startTimeAfterString = this.formatQueryDate(addDays(new Date(), -14));
                    break;
                case DateRangeOptions['last 2 months']:
                    startTimeAfterString = this.formatQueryDate(addMonths(new Date(), -2));
                    break;
                case DateRangeOptions['current month']:
                    const today = new Date();
                    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    startTimeAfterString = this.formatQueryDate(firstDayOfMonth);
                    break;
                case DateRangeOptions['custom']:
                    if (dateRange.from) {
                        startTimeAfterString = this.formatQueryDate(dateRange.from);
                    }

                    if (dateRange.to) {
                        startTimeBeforeString = this.formatQueryDate(dateRange.to);
                    }

                    break;
                default:
                    break;
            }
        }
        if (startTimeAfterString) {
            params.startedAfter = startTimeAfterString;
        }
        if (startTimeBeforeString) {
            params.startedBefore = startTimeBeforeString;
        }
        if (state) {
            params[state.toLocaleLowerCase()] = true;
        }
        if (incidentOnly) {
            params.incidentStatus = 'open';
        }
        if (messageFilter) {
            params.incidentMessageLike = '%' + messageFilter + '%';
        }

        if (page && pageSize) {
            params.firstResult = (page - 1) * pageSize;
        }

        if (pageSize) {
            params.maxResults = pageSize;
        }

        return lastValueFrom(
            this.httpClient.get<CountResultDto>(`${this.apiUrl}/wmp/history/process-instance/count`, {
                params,
            }),
        );
    }

    async getHistoricProcessInstance(instanceId: string) {
        return lastValueFrom(this.historicProcessInstanceService.getHistoricProcessInstance(instanceId));
    }

    async getHistoricProcessInstancesByParentAndDefinition(
        parentInstanceId: string | undefined,
        processDefinitionKey: string | undefined,
    ) {
        if (parentInstanceId !== undefined && processDefinitionKey != undefined) {
            const params = {
                superProcessInstanceId: parentInstanceId,
                processDefinitionKey: processDefinitionKey,
            } as any;

            return lastValueFrom(
                this.httpClient.get<Array<WmpHistoricProcessInstanceDto>>(
                    `${this.apiUrl}/wmp/history/process-instance`,
                    {
                        params,
                    },
                ),
            );
        }

        return new Array<WmpHistoricProcessInstanceDto>();
    }

    async getProcessInstancesForProcessDefinitionId(pdId: string) {
        return new Promise(async (res) => {
            const processInstances = lastValueFrom(
                await this.httpClient.get<Array<ProcessInstanceDto>>(`${this.baseUrl}/process-instance`, {
                    params: {
                        processDefinitionId: pdId || '',
                    },
                }),
            );
            res(processInstances);
        });
    }

    async getProcessInstance(id: string) {
        return lastValueFrom(this.processInstanceService.getProcessInstance(id));
    }

    async getLastTaskForProcess(pdId: string): Promise<TaskDto | undefined> {
        return new Promise(async (res) => {
            const tasks = await lastValueFrom(
                this.httpClient.get<Array<TaskDto>>(`${this.baseUrl}/history/activity-instance`, {
                    params: {
                        processDefinitionId: pdId || '',
                        sortOrder: 'desc',
                        maxResults: 1,
                        sortBy: 'endTime',
                    },
                }),
            );
            if (tasks.length) {
                res(tasks[0]);
            } else {
                res(undefined);
            }
        });
    }

    async getHistoricProcessInstanceActitivity(
        processInstanceId?: string,
    ): Promise<HistoricActivityInstanceDto[]> {
        const params = {
            sortOrder: 'asc',
            sortBy: 'startTime',
        } as any;
        if (processInstanceId) {
            params.processInstanceId = processInstanceId;
        }
        return new Promise(async (res) => {
            const tasks = await lastValueFrom(
                this.httpClient.get<Array<HistoricActivityInstanceDto>>(
                    `${this.baseUrl}/history/activity-instance`,
                    {
                        params,
                    },
                ),
            );
            if (tasks) {
                res(tasks);
            } else {
                res([]);
            }
        });
    }

    async getLastActivityForJobDefinition(jobDefinitionId: string): Promise<JobLogDto> {
        return new Promise(async (res) => {
            const activity = await lastValueFrom(
                this.httpClient.get<Array<JobLogDto>>(`${this.baseUrl}/history/job-log`, {
                    params: {
                        jobDefinitionId,
                        sortOrder: 'desc',
                        maxResults: 1,
                        sortBy: 'timestamp',
                    },
                }),
            );
            res(activity[0]);
        });
    }

    async getVariablesForProcessInstance(piId: string): Promise<{[key: string]: VariableValueDto}> {
        return new Promise(async (res) => {
            const variables = await lastValueFrom(
                this.httpClient.get<{
                    [key: string]: VariableValueDto;
                }>(`${this.baseUrl}/process-instance/${piId}/variables`),
            );
            res(variables);
        });
    }

    async getSituationViewModel(): Promise<Record<string, SituationViewModel[]>> {
        let viewModelList: SituationViewModel[] = [];
        // processDefinition - SituationViewModel
        const viewModelRecord = {} as Record<string, SituationViewModel[]>;
        const procDefinitions = await lastValueFrom(this.processDefinitionService.getProcessDefinitions());

        const promises = procDefinitions.map((pd) => {
            const statisticsPromise = lastValueFrom(
                this.processDefinitionService.getActivityStatisticsByProcessDefinitionKey(pd.key, true, true),
            );
            return statisticsPromise.then((statistics) => {
                const pdId = pd.id;
                const taskOfProcessPromise = this.getLastTaskForProcess(pd.id as any);
                return taskOfProcessPromise.then((task) => {
                    const endTime = (task as any)?.endTime;
                    if (statistics.length && statistics.length > 0) {
                        statistics.forEach((s: ActivityStatisticsResultDto) => {
                            const model = {
                                incidents:
                                    s.incidents?.reduce<number>((c, i) => c + (i.incidentCount || 0), 0) || 0,
                                lastTime: endTime,
                                requests: s.instances,
                                version: pd.version || undefined,
                                workflowName: pd.name || pd.key,
                                processDefinitionId: pdId || undefined,
                            } satisfies SituationViewModel;
                            fillEmptyRecordArrayIfUndefined(viewModelRecord, pdId);
                            viewModelRecord[pdId].push(model);
                            viewModelList.push(model);
                        });
                    } else {
                        const model = {
                            incidents: 0,
                            requests: 0,
                            lastTime: endTime,
                            version: pd.version || undefined,
                            workflowName: pd.name || pd.key,
                            processDefinitionId: pd.id || undefined,
                        } satisfies SituationViewModel;
                        fillEmptyRecordArrayIfUndefined(viewModelRecord, pdId);
                        viewModelRecord[pdId].push(model);
                        viewModelList.push(model);
                    }
                });
            });
        });
        await Promise.all(promises);
        return viewModelRecord;
        // return viewModelList.reduce((previousValue, currentValue, currentIndex) => {
        //     const workingCopy = [...previousValue];
        //     const foundSameProcessDefinition = workingCopy.find(
        //         (value) => value.processDefinitionId == currentValue.processDefinitionId,
        //     );
        //     if (foundSameProcessDefinition) {
        //         foundSameProcessDefinition.incidents += .incidents
        //     } else {
        //         workingCopy.push(currentValue);
        //     }
        //
        //     return workingCopy;
        // }, [] as SituationViewModel[]);
        // viewModelList.reduce((previousValue, currentValue) => {
        //     if(
        // }, [] as SituationViewModel);
        // return viewModelList;
    }

    async getHistoricIncidents(
        f?: WorkflowFilter,
        firstResult?: number,
        maxResults?: number,
    ): Promise<HistoricIncidentDto[]> {
        const params = {open: true} as any;
        const processDefinitionId = f?.processDefinition?.id;
        const processInstanceId = f?.processInstanceId;
        const activityId = f?.activity?.id;
        const dateRange = f?.dateRange;
        const messageFilter = f?.messageFilter;
        if (processDefinitionId) {
            params.processDefinitionId = processDefinitionId;
        }
        if (activityId) {
            params.activityId = activityId;
        }
        if (processInstanceId) {
            params.processInstanceId = processInstanceId;
        }
        let createTimeAfterString: string | undefined = undefined;
        let createTimeBeforeString: string | undefined = undefined;
        if (dateRange?.presetName) {
            switch (dateRange?.presetName) {
                case DateRangeOptions['last 7 days']:
                    createTimeAfterString = this.formatQueryDate(addDays(new Date(), -7));
                    break;
                case DateRangeOptions['last 14 days']:
                    createTimeAfterString = this.formatQueryDate(addDays(new Date(), -14));
                    break;
                case DateRangeOptions['last 2 months']:
                    createTimeAfterString = this.formatQueryDate(addMonths(new Date(), -2));
                    break;
                case DateRangeOptions['current month']:
                    const today = new Date();
                    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    createTimeAfterString = this.formatQueryDate(firstDayOfMonth);
                    break;
                case DateRangeOptions['custom']:
                    if (dateRange.from) {
                        createTimeAfterString = this.formatQueryDate(dateRange.from);
                    }

                    if (dateRange.to) {
                        createTimeBeforeString = this.formatQueryDate(dateRange.to);
                    }

                    break;
                default:
                    break;
            }
        }
        if (createTimeAfterString) {
            params.createTimeAfter = createTimeAfterString;
        }
        if (createTimeBeforeString) {
            params.createTimeBefore = createTimeBeforeString;
        }
        if (messageFilter) {
            params.incidentMessageLike = '%' + messageFilter + '%';
        }

        if (firstResult) {
            params.firstResult = firstResult;
        }

        if (maxResults) {
            params.maxResults = maxResults;
        }

        params.sortBy = 'createTime';
        params.sortOrder = 'desc';
        return lastValueFrom(
            this.httpClient.get<Array<HistoricIncidentDto>>(`${this.baseUrl}/history/incident`, {
                params,
            }),
        );
    }

    async getHistoricIncidentCount(f?: WorkflowFilter): Promise<any> {
        const params = {open: true} as any;
        const processDefinitionId = f?.processDefinition?.id;
        const activityId = f?.activity?.id;
        const dateRange = f?.dateRange;
        const messageFilter = f?.messageFilter;
        if (processDefinitionId) {
            params.processDefinitionId = processDefinitionId;
        }
        if (activityId) {
            params.activityId = activityId;
        }
        let createTimeAfterString: string | undefined = undefined;
        let createTimeBeforeString: string | undefined = undefined;
        if (dateRange?.presetName) {
            switch (dateRange?.presetName) {
                case DateRangeOptions['last 7 days']:
                    createTimeAfterString = this.formatQueryDate(addDays(new Date(), -7));
                    break;
                case DateRangeOptions['last 14 days']:
                    createTimeAfterString = this.formatQueryDate(addDays(new Date(), -14));
                    break;
                case DateRangeOptions['last 2 months']:
                    createTimeAfterString = this.formatQueryDate(addMonths(new Date(), -2));
                    break;
                case DateRangeOptions['current month']:
                    const today = new Date();
                    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    createTimeAfterString = this.formatQueryDate(firstDayOfMonth);
                    break;
                case DateRangeOptions['custom']:
                    if (dateRange.from) {
                        createTimeAfterString = this.formatQueryDate(dateRange.from);
                    }

                    if (dateRange.to) {
                        createTimeBeforeString = this.formatQueryDate(dateRange.to);
                    }

                    break;
                default:
                    break;
            }
        }
        if (createTimeAfterString) {
            params.createTimeAfter = createTimeAfterString;
        }
        if (createTimeBeforeString) {
            params.createTimeBefore = createTimeBeforeString;
        }
        if (messageFilter) {
            params.incidentMessageLike = '%' + messageFilter + '%';
        }

        return lastValueFrom(
            this.httpClient.get<CountResultDto>(`${this.baseUrl}/history/incident/count`, {
                params,
            }),
        );
    }

    async getHistoryProcessInstanceStatisticsByProcessDefinition(processDefinitionId?: string) {
        if (processDefinitionId !== undefined) {
            const params = {processDefinitionId: processDefinitionId} as any;

            return lastValueFrom(
                this.httpClient.get<Array<WmpHistoricProcessInstanceStatisticsDto>>(
                    `${this.apiUrl}/wmp/history/process-instance/statistics`,
                    {
                        params,
                    },
                ),
            );
        }

        return new Array<WmpHistoricProcessInstanceStatisticsDto>();
    }

    async getHistoryActivityInstanceStatisticsByProcessDefinition(
        processDefinitionId?: string,
        after?: Date,
        before?: Date,
    ) {
        if (processDefinitionId !== undefined) {
            const params = {processDefinitionId: processDefinitionId} as any;

            if (after) {
                params.finishedAfter = this.formatQueryDate(after);
            }

            if (before) {
                params.finishedBefore = this.formatQueryDate(before);
            }

            return lastValueFrom(
                this.httpClient.get<Array<WmpHistoricActivityInstanceStatisticsDto>>(
                    `${this.apiUrl}/wmp/history/process-instance/statistics/activity`,
                    {
                        params,
                    },
                ),
            );
        }

        return new Array<WmpHistoricActivityInstanceStatisticsDto>();
    }

    async getActivityStatisticsByProcessDefinitionId(
        processDefinitionId?: string,
    ): Promise<Array<ActivityStatisticsResultDto>> {
        if (processDefinitionId !== undefined) {
            return lastValueFrom(
                this.processDefinitionService.getActivityStatistics(processDefinitionId, true, true),
            );
        }
        return new Array<ActivityStatisticsResultDto>();
    }

    async restartJob(jobId: string): Promise<void> {
        return new Promise(async (res) => {
            await lastValueFrom(this.httpClient.put(`${this.baseUrl}/job/${jobId}/retries`, {retries: 1}));
            res();
        });
    }

    async restartExternalTask(externalTaskId: string): Promise<void> {
        return new Promise(async (res) => {
            await lastValueFrom(
                this.httpClient.put(`${this.baseUrl}/external-task/${externalTaskId}/retries`, {
                    retries: 1,
                }),
            );
            res();
        });
    }

    async getHistoricJobStackTrace(jobId: string): Promise<string> {
        return new Promise(async (res) => {
            const stacktrace = await lastValueFrom(
                this.httpClient.get(`${this.baseUrl}/history/job-log/${jobId}/stacktrace`, {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json',
                        accept: 'text/plain',
                    }),
                    responseType: 'text',
                }),
            );
            res(stacktrace);
        });
    }

    async getJobStackTrace(jobId: string): Promise<string> {
        return new Promise(async (res) => {
            const stacktrace = await lastValueFrom(
                this.httpClient.get(`${this.baseUrl}/job/${jobId}/stacktrace`, {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json',
                        accept: 'text/plain',
                    }),
                    responseType: 'text',
                }),
            );
            res(stacktrace);
        });
    }

    async getJobLogCount(
        processDefinitionId: string,
        activityId: string,
        logType?: JobLogType,
        dateRange?: DateRange,
    ): Promise<string> {
        return new Promise(async (res) => {
            const params = {} as any;
            if (processDefinitionId) {
                params.processDefinitionId = processDefinitionId;
            }
            if (activityId) {
                params.activityIdIn = activityId;
            }
            switch (logType) {
                case 'creation':
                    params.creationLog = true;
                    break;
                case 'deletion':
                    params.deletionLog = true;
                    break;
                case 'failure':
                    params.failureLog = true;
                    break;
                case 'success':
                    params.successLog = true;
                    break;

                default:
                    break;
            }

            if (dateRange?.from || dateRange?.to) {
                params.sortBy = 'timestamp';
                params.sortOrder = 'asc';

                let result = await lastValueFrom(
                    this.httpClient.get<JobLogDto[]>(`${this.baseUrl}/history/job-log`, {
                        params,
                    }),
                );

                if (dateRange?.from) {
                    result = result.filter(
                        (j) => new Date(j.timestamp).getTime() >= (dateRange.from?.getTime() || 0),
                    );
                }

                if (dateRange?.to) {
                    result = result.filter(
                        (j) => new Date(j.timestamp).getTime() <= (dateRange.to?.getTime() || 0),
                    );
                }

                res(result.length.toString(10));
            } else {
                const result = await lastValueFrom(
                    this.httpClient.get<any>(`${this.baseUrl}/history/job-log/count`, {
                        params,
                    }),
                );
                res(result.count);
            }
        });
    }

    async getHistoricJobLogs(processInstanceId: string): Promise<HistoricJobLogDto[]> {
        return new Promise(async (res) => {
            const params = {} as any;
            if (processInstanceId) {
                params.processInstanceId = processInstanceId;
            }

            const result = await lastValueFrom(
                this.httpClient.get<any>(`${this.baseUrl}/history/job-log`, {
                    params,
                }),
            );
            res(result);
        });
    }

    async getAllProcessInstanceVariables(processInstanceId: string): Promise<VariablesObject[]> {
        const params = {} as any;
        if (processInstanceId) {
            params.processInstanceIdIn = processInstanceId;
        }

        return new Promise(async (res) => {
            const variableInstances = await lastValueFrom(
                this.httpClient.get<VariablesObject[]>(`${this.baseUrl}/variable-instance`, {
                    params,
                }),
            );
            res(variableInstances);
        });
    }

    async getAllHistoricProcessInstanceVariables(
        processInstanceId?: string,
        activityInstanceId?: string,
    ): Promise<HistoricVariableInstanceDto[]> {
        const params = {} as any;
        if (processInstanceId) {
            params.processInstanceIdIn = processInstanceId;
        }
        if (activityInstanceId) {
            params.activityInstanceIdIn = activityInstanceId;
        }
        params.includeDeleted = true;

        return new Promise(async (res) => {
            const variableInstances = await lastValueFrom(
                this.httpClient.get<HistoricVariableInstanceDto[]>(
                    `${this.baseUrl}/history/variable-instance`,
                    {
                        params,
                    },
                ),
            );
            res(variableInstances);
        });
    }

    async getTopicGroups(): Promise<TopicGroupDto[]> {
        return new Promise(async (res) => {
            const topicGroups = await lastValueFrom(
                this.httpClient.get<TopicGroupDto[]>(`${this.apiUrl}/wmp/topic-group`),
            );
            res(topicGroups);
        });
    }

    async getUnassignedTopics(): Promise<string[]> {
        return new Promise(async (res) => {
            const unassignedTopics = await lastValueFrom(
                this.httpClient.get<string[]>(`${this.apiUrl}/wmp/topic-group/unassigned`),
            );
            res(unassignedTopics);
        });
    }

    async createTopicGroup(topicGroup: TopicGroupDto): Promise<TopicGroupDto> {
        return new Promise(async (res) => {
            const newTopicGroup = await lastValueFrom(
                this.httpClient.post<TopicGroupDto>(`${this.apiUrl}/wmp/topic-group`, topicGroup),
            );
            res(newTopicGroup);
        });
    }

    async updateTopicGroup(name: string, topicGroup: TopicGroupDto): Promise<TopicGroupDto> {
        return new Promise(async (res) => {
            const updatedTopicGroup = await lastValueFrom(
                this.httpClient.put<TopicGroupDto>(`${this.apiUrl}/wmp/topic-group/${name}`, topicGroup),
            );
            res(updatedTopicGroup);
        });
    }

    async deleteTopicGroup(name: string): Promise<void> {
        return new Promise(async (res) => {
            await lastValueFrom(
                this.httpClient.delete<TopicGroupDto>(`${this.apiUrl}/wmp/topic-group/${name}`),
            );
            res();
        });
    }

    async moveTopicToGroup(name: string, topicGroup: string): Promise<void> {
        return new Promise(async (res) => {
            await lastValueFrom(
                this.httpClient.post<TopicGroupDto>(`${this.apiUrl}/wmp/topic-group/move-topic`, {
                    topicName: name,
                    topicGroupName: topicGroup,
                }),
            );
            res();
        });
    }

    async getExecutions(): Promise<ExecutionDto[]> {
        return new Promise(async (res) => {
            const executions = await lastValueFrom(
                this.httpClient.get<ExecutionDto[]>(`${this.apiUrl}/wmp/execution`),
            );
            res(executions);
        });
    }

    async createExecution(execution: ExecutionDto): Promise<ExecutionDto> {
        return new Promise(async (res) => {
            const newExecution = await lastValueFrom(
                this.httpClient.post<ExecutionDto>(`${this.apiUrl}/wmp/execution`, execution),
            );
            res(newExecution);
        });
    }

    async updateExecution(name: string, execution: ExecutionDto): Promise<ExecutionDto> {
        return new Promise(async (res) => {
            const updatedExecution = await lastValueFrom(
                this.httpClient.put<ExecutionDto>(`${this.apiUrl}/wmp/execution/${name}`, execution),
            );
            res(updatedExecution);
        });
    }

    async deleteExecution(name: string): Promise<void> {
        return new Promise(async (res) => {
            await lastValueFrom(this.httpClient.delete<void>(`${this.apiUrl}/wmp/execution/${name}`));
            res();
        });
    }

    /**
     * @param processInstanceId
     * @param activityInstanceId
     */
    async restartAtActivityId(processInstanceId: string, activityInstanceId: string) {
        return this.httpClient.post(`${this.baseUrl}/process-instance/${processInstanceId}/modification`, {
            skipCustomListeners: true,
            skipIoMappings: true,
            instructions: [
                {
                    type: 'startBeforeActivity', // or "startAfterActivity"
                    ancestorActivityInstanceId: activityInstanceId,
                },
            ],
            //important if currently a token present
            cancelCurrentActivity: true,
        });
    }
}

export interface VariablesObject {
    type: string;
    value: boolean;
    valueInfo: any;
    id: string;
    name: string;
    processDefinitionId: string;
    processInstanceId: string;
    executionId: string;
    caseInstanceId: string;
    caseExecutionId: string;
    taskId: string;
    batchId: string;
    activityInstanceId: string;
    errorMessage: string;
    tenantId: string;
}

export type JobLogType = 'creation' | 'failure' | 'success' | 'deletion';

export interface JobLogDto {
    id: string;
    timestamp: string;
    removalTime: string;
    jobId: string;
    jobDueDate: string;
    jobRetries: number;
    jobPriority: number;
    jobExceptionMessage: string;
    failedctivityId: string;
    jobDefinitionId: string;
    jobDefinitionType: string;
    jobDefinitionConfiguration: string;
    activityId: string;
    executionId: string;
    processInstanceId: string;
    processDefinitionId: string;
    processDefinitionKey: string;
    deploymentId: string;
    rootProcessInstanceId: string;
    tenantId: string;
    hostname: string;
    creationLog: boolean;
    failureLog: boolean;
    successLog: boolean;
    deletionLog: boolean;
}

export interface JobDefinitionExtendedDto extends JobDefinitionDto {
    activityName: string;
    lastActivity?: Date;
    dueDate?: Date;
}

export interface InputOutputMapEntry {
    name: string;
    value: string;
}

export interface InputOutputMap {
    [activityId: string]: {
        inputs: InputOutputMapEntry[];
        outputs: InputOutputMapEntry[];
    };
}
