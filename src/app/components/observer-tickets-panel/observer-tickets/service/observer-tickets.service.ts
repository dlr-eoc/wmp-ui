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

import {inject, Injectable, OnDestroy, signal} from '@angular/core';
import {HistoricIncidentDto, TaskDto, TaskService} from 'src/app/shared/services/camunda-api';
import {firstValueFrom, timer} from 'rxjs';
import {OperatonFilterService} from 'src/app/shared/services/api/operaton-filter.service';
import {OBSERVER_FILTER_NAME} from 'src/app/components/observer-tickets-panel/observer-tickets/observer-tickets.component';
import {BpmnHandlerService} from 'src/app/shared/services/bpmn/bpmn-handler.service';
import {IncidentHandlingService} from 'src/app/shared/services/api/incident-handling.service';
import {AlertService} from 'src/app/shared/services/alert.service';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';

@Injectable({
    providedIn: 'root',
})
export class ObserverTicketsService extends AsyncDestroyable implements OnDestroy {
    private readonly taskService = inject(TaskService);
    private readonly filterService = inject(OperatonFilterService);
    private readonly incidentService = inject(IncidentHandlingService);
    private readonly alertService = inject(AlertService);

    private readonly _$selectedTask = signal<TaskDto | undefined>(undefined);
    $selectedTask = this._$selectedTask.asReadonly();
    $visibleIncidentDialog = signal<boolean>(false);

    private readonly _$incidents = signal<HistoricIncidentDto[]>([]);
    $incidents = this._$incidents.asReadonly();

    constructor() {
        super();
    }
    ngOnDestroy(): void {
        super.destroy();
    }

    reloadData() {
        //trigger update with current task, resulting in incident reload if task selected
        this.updateTask(this._$selectedTask());
    }

    updateTask(taskDto: TaskDto | undefined) {
        this._$selectedTask.set(taskDto);
        const task = this._$selectedTask();
        if (task && task.processInstanceId) {
            this.incidentService
                .getHistoricIncidentsOfProcessInstanceId(task.processInstanceId)
                .then((incidents) => {
                    if (incidents.length > 0 && task.id) {
                        //case incidents present open modal
                        this._$incidents.set(incidents);
                        //TODO deactivate retry activity if no resolve has happened before...(incidents <= 1)
                    }
                });
        }
    }

    handleResolveFromTask(bpmnHandlerService: BpmnHandlerService) {
        const task = this._$selectedTask();
        if (this._$incidents().length > 0 && task?.id) {
            this.$visibleIncidentDialog.set(true);
        } else if (task?.id) {
            //TODO add confirm dialog?
            //case no incidents - resolve human task
            firstValueFrom(this.taskService.complete(task.id)).then((_result) => {
                this.filterService.updateFilterFromName(OBSERVER_FILTER_NAME).then((tasks) => {
                    if (tasks.length > 0) {
                        //case same task, select first one
                        const firstTaskStillExisting = tasks[0];
                        this.updateTask(firstTaskStillExisting);
                        if (firstTaskStillExisting.processDefinitionId) {
                            bpmnHandlerService.workflowFilterService.mergeFilterAndUpdate({
                                processDefinition: {
                                    key: firstTaskStillExisting.processDefinitionId,
                                    id: firstTaskStillExisting.processDefinitionId,
                                },
                                showHistoricLabels: true,
                            });
                        }
                    }
                });
            });
        }
    }

    resolveIncidents() {
        // console.debug(this._$incidents());
        //TODO resolve correctly
        const incidents = this.$incidents();
        const firstIncident = incidents[0] ?? undefined;
        this.incidentService.retryIncidentGiven(firstIncident).then(() => {
            this.$visibleIncidentDialog.set(false);
            //TODO reload data after 200ms?
            this.subscribeWithDestroyHandler(timer(200), () => {
                //after 200ms reload data
            });
        });
    }

    sendToSupervisor() {
        //TODO implement correct way to send to supervisor
        this.alertService.addWarning(
            `@Supervisor - There is an unresolved issue with this task: ${this._$selectedTask()?.name} (${this._$selectedTask()?.created})`,
        );
    }
}
