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

import {Component, computed, inject, input, OnDestroy, OnInit, signal, Signal} from '@angular/core';
import {TicketsComponent} from 'src/app/shared/components/tickets/tickets.component';
import {OperatonFilterService} from 'src/app/shared/services/api/operaton-filter.service';
import {HistoricActivityInstanceDto, HistoricJobLogDto, TaskDto} from 'src/app/shared/services/camunda-api';
import {ObserverTicketsService} from 'src/app/components/observer-tickets-panel/observer-tickets/service/observer-tickets.service';
import {Button} from 'primeng/button';
import {Card} from 'primeng/card';
import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';
import {createSomeOverlayTEST} from 'src/app/shared/components/bpmn-diagram/custom/CustomBPMNUtils';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {BpmnManager} from 'src/app/shared/services/bpmn/bpmn-manager';

export const OBSERVER_FILTER_NAME = 'Observer_Filter';
@Component({
    selector: 'app-observer-tickets',
    imports: [TicketsComponent, Button, Card],
    templateUrl: './observer-tickets.component.html',
    styleUrl: './observer-tickets.component.scss',
})
export class ObserverTicketsComponent extends AsyncDestroyable implements OnInit, OnDestroy {
    private readonly filterService = inject(OperatonFilterService);
    readonly observerTicketsService = inject(ObserverTicketsService);
    readonly wmpApiService = inject(WmpApiService);

    $filteredTasks: Signal<TaskDto[]> = this.filterService.$filteredTasks;
    $selectedTask = this.observerTicketsService.$selectedTask;
    //using given bpmnHandlerService
    readonly bpmnManager = input.required<BpmnManager>();
    readonly bpmnHandlerService = computed(() => this.bpmnManager().bpmnHandler);
    private readonly _$activities = signal<HistoricActivityInstanceDto[]>([]);
    private readonly _$jobs = signal<HistoricJobLogDto[]>([]);

    constructor() {
        super();
    }

    ngOnInit(): void {
        this.filterService.updateFilterFromName(OBSERVER_FILTER_NAME);

        //FIXME this update of data valid? better to retrieve last values?
        this.subscribeWithDestroyHandler(
            this.bpmnManager().processInstanceHandler.processInstanceActivityService
                .processInstanceActivityLog$,
            (activities) => {
                this._$activities.set(activities);
            },
        );
        this.subscribeWithDestroyHandler(
            this.bpmnManager().processInstanceHandler.processInstanceJobService.processInstanceJobLogs$,
            (jobs) => {
                this._$jobs.set(jobs);
            },
        );

        this.subscribeWithDestroyHandler(
            this.bpmnManager().bpmnHandler.bpmnDiagramService.loadingWorkflowData$,
            async (loading) => {
                if (!loading) {
                    const processDefinitionId = this.$selectedTask()?.processDefinitionId;
                    const processInstanceId = this.$selectedTask()?.processInstanceId;
                    if (processDefinitionId && processInstanceId) {
                        const historicJobLogDtos = this._$jobs();
                        const historicActivityInstanceDtos = this._$activities();

                        historicActivityInstanceDtos.forEach((activity) => {
                            const foundJob = historicJobLogDtos.find(
                                (job) => job.activityId === activity.activityId,
                            );
                            if (activity && foundJob) {
                                if (
                                    foundJob.jobDefinitionType === 'async-continuation' &&
                                    foundJob.jobDefinitionConfiguration === 'async-before'
                                )
                                    return createSomeOverlayTEST(
                                        activity,
                                        foundJob,
                                        this.bpmnHandlerService().bpmnOverlayStorage,
                                        this.bpmnHandlerService().bpmnCustomEventStore,
                                    );
                            }
                        });
                    }
                }
            },
        );
    }
    ngOnDestroy(): void {
        super.destroy();
    }

    protected handleTicketSelection(task: TaskDto) {
        this.observerTicketsService.updateTask(task);
        if (task.processDefinitionId && task.processInstanceId) {
            //update the workflow filter, automatically triggers bpmn and data update
            this.bpmnHandlerService().workflowFilterService.mergeFilterAndUpdate({
                processInstanceId: task.processInstanceId,
                processDefinition: {
                    key: task.processDefinitionId,
                    id: task.processDefinitionId,
                },
            });
        }
    }

    protected refreshFilter() {
        this.filterService.updateFilterFromName(OBSERVER_FILTER_NAME);
    }
}
