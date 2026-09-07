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

import {Component, inject, input, OnDestroy, OnInit, signal} from '@angular/core';
import {
    COLOR_COMPLETED,
    COLOR_INCIDENT,
    COLOR_RUNNING,
    COLOR_SUCCESSFUL,
    OPACITY_DEFAULT,
    OPACITY_INCIDENT,
    STROKE_WIDTH_DEFAULT_ACTIVITY_SVG,
    TASK_BORDER_RADIUS,
} from 'src/app/shared/components/bpmn-diagram/bpmn-diagram.utils';
import {firstValueFrom, Subject} from 'rxjs';
import {
    ExternalTaskDto,
    ExternalTaskService,
    HistoricActivityInstanceDto,
    HistoricProcessInstanceDto,
} from 'src/app/shared/services/camunda-api';
import {hexToRgba} from 'src/app/utils/ColorUtils';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {NgStyle} from '@angular/common';
import {ActivityControlComponent} from '../activity-control/activity-control.component';
import {Panel} from 'primeng/panel';
import {ClrAccordionModule, ClrConditionalModule, ClrDatagridModule} from '@clr/angular';
import {MillisecondPipe} from 'src/app/shared/pipes/millisecond.pipe';
import {ClickedBpmnElement} from 'src/app/models/bpmn-diagram.model';
import {
    BpmnManagerService,
    WORKFLOWS_BPMN_IDENTIFIER,
} from 'src/app/shared/services/bpmn/bpmn-manager.service';
import {Button} from 'primeng/button';
import {CdkCopyToClipboard} from '@angular/cdk/clipboard';
import {HistoricIncidentDetails} from 'src/app/shared/services/wmp-api/custom/model/incidents-models';

@Component({
    selector: 'app-process-instance-detail',
    templateUrl: './process-instance-detail.component.html',
    styleUrls: ['./process-instance-detail.component.scss'],
    imports: [
        NgStyle,
        ActivityControlComponent,
        Panel,
        ClrAccordionModule,
        ClrDatagridModule,
        ClrConditionalModule,
        MillisecondPipe,
        Button,
        CdkCopyToClipboard,
    ],
})
export class ProcessInstanceDetailComponent extends AsyncDestroyable implements OnDestroy, OnInit {
    readonly dataUpdateRunning = input<boolean>();

    readonly reloadPageAfterButtonClick = input<Subject<void>>(new Subject());

    readonly _$processInstance = signal<HistoricProcessInstanceDto | undefined>(undefined);
    readonly _$externalTasks = signal<ExternalTaskDto[]>([]);
    readonly _$externalTasksOfSelection = signal<ExternalTaskDto[]>([]);

    //TODO use signals or a single signal to update
    colorCompleted: string;
    colorIncident: string;
    colorRunning: string;
    colorTotal: string;
    colorSuccessful: string;
    strokeWith: number;
    taskBorderRadius: number;
    taskSelected: string | undefined = undefined;
    mostRecentIncident: HistoricIncidentDetails | undefined;
    processInstanceIncidents: HistoricIncidentDetails[] = [];
    currentSelectionActivityLog: HistoricActivityInstanceDto | undefined;
    durationActivity: Record<string, string | undefined> = {} as Record<string, string | undefined>;
    sequenceFlowSelected: ClickedBpmnElement | undefined;
    elementSelected: ClickedBpmnElement | undefined;

    externalTaskService = inject(ExternalTaskService);

    private readonly bpmnManagerService = inject(BpmnManagerService);
    private readonly bpmnHandler = this.bpmnManagerService.getBpmnDiagramHandler(WORKFLOWS_BPMN_IDENTIFIER);
    private readonly processInstanceHandlerService =
        this.bpmnManagerService.getProcessInstanceHandlerService(WORKFLOWS_BPMN_IDENTIFIER);
    private incidentService = this.processInstanceHandlerService.processInstanceIncidentService;
    private readonly processInstanceDataService =
        this.processInstanceHandlerService.processInstanceDataService;
    private bpmnViewSelectionService = this.bpmnHandler.bpmnViewSelectionService;
    private bpmnCustomOverlayService = this.bpmnHandler.bpmnCustomOverlayService;

    constructor() {
        super();
        this.colorCompleted = hexToRgba(COLOR_COMPLETED, OPACITY_DEFAULT) ?? COLOR_COMPLETED;
        this.colorIncident = hexToRgba(COLOR_INCIDENT, OPACITY_INCIDENT) ?? COLOR_INCIDENT;
        this.colorRunning = hexToRgba(COLOR_RUNNING, OPACITY_DEFAULT) ?? COLOR_RUNNING;
        this.colorSuccessful = COLOR_SUCCESSFUL;
        this.taskBorderRadius = TASK_BORDER_RADIUS;
        this.strokeWith = STROKE_WIDTH_DEFAULT_ACTIVITY_SVG;
        this.colorTotal = '#8c8c8c';
    }

    ngOnInit(): void {
        this.subscribeWithDestroyHandler(
            this.incidentService.processInstanceIncidents$,
            (value) => (this.processInstanceIncidents = value),
        );
        this.subscribeWithDestroyHandler(this.bpmnCustomOverlayService.timerDurationOfActivity$, (value) => {
            this.durationActivity = value;
        });
        this.subscribeWithDestroyHandler(this.bpmnViewSelectionService.sequenceFlowSelected$, (value) => {
            this.sequenceFlowSelected = value;
            this.changeTaskSelected(value?.element?.id, false);
        });
        this.subscribeWithDestroyHandler(this.bpmnViewSelectionService.elementSelected$, (value) => {
            this.elementSelected = value;
            this.changeTaskSelected(value?.element?.id);
        });
        this.subscribeWithDestroyHandler(
            this.processInstanceDataService.processInstance$,
            (processInstance) => {
                this._$processInstance.set(processInstance);
                if (processInstance?.id) {
                    firstValueFrom(
                        this.externalTaskService.getExternalTasks(
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            processInstance.id,
                        ),
                    ).then((foundTasks) => {
                        this._$externalTasks.set(foundTasks);
                    });
                }
            },
        );
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    private changeTaskSelected(taskName?: string, isPossibleElementWithIncidents: boolean = true) {
        this._$externalTasksOfSelection.set(
            this._$externalTasks().filter((task) => task.activityId === taskName),
        );
        if (isPossibleElementWithIncidents) {
            const taskIncidents = this.processInstanceIncidents?.filter(
                (incident) => incident.activityId === taskName,
            );
            if (taskIncidents && taskIncidents.length > 0) {
                this.mostRecentIncident = taskIncidents.reduce(
                    (prev, current) => {
                        if (!prev) {
                            //first element found
                            return current;
                        }
                        const previousTime = prev.createTime;
                        const currentTime = current.createTime;
                        //format yyyy-MM-dd'T'HH:mm:ss.SSSZ - so a > comparison results in correct time comparison
                        if (previousTime && currentTime && previousTime > currentTime) {
                            return current;
                        }
                        return prev;
                    },
                    undefined as HistoricIncidentDetails | undefined,
                );
            } else {
                this.mostRecentIncident = undefined;
            }
        } else {
            this.mostRecentIncident = undefined;
        }
        this.taskSelected = taskName;
    }

    protected readonly COLOR_RUNNING = COLOR_RUNNING;
    protected readonly COLOR_COMPLETED = COLOR_COMPLETED;
    protected readonly COLOR_INCIDENT = COLOR_INCIDENT;
}
