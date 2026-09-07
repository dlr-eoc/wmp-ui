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

import {Component, inject, input, OnChanges, OnDestroy, OnInit, output} from '@angular/core';
import {HistoricIncidentDto, HistoricProcessInstanceDto} from 'src/app/shared/services/camunda-api';
import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';
import {HistoricProcessInstance} from 'src/app/components/workflow-page/models/HistoricProcessInstance';
import {getInstanceWithIncidents, isIncident} from 'src/app/utils/bpmn/instance.utils';
import {WorkflowFilter} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {IncidentHandlingService} from 'src/app/shared/services/api/incident-handling.service';
import {Observable} from 'rxjs';
import {DialogConfirmationHandler} from 'src/app/utils/DialogConfirmationHandler';
import {ClrDatagridModule, ClrIconModule, ClrModalModule} from '@clr/angular';
import {AsyncPipe} from '@angular/common';
import {ConfirmDialogComponent} from 'src/app/components/dialog/confirm-dialog.component';
import {LengthPipe} from 'src/app/shared/pipes/length.pipe';
import {FallbackPipe} from 'src/app/pipes/conversion.pipe';
import {
    BpmnManagerService,
    WORKFLOWS_BPMN_IDENTIFIER,
} from 'src/app/shared/services/bpmn/bpmn-manager.service';

@Component({
    selector: 'app-process-instance-control',
    templateUrl: './process-instance-control.component.html',
    styleUrls: ['./process-instance-control.component.scss'],
    imports: [
        ClrDatagridModule,
        ClrIconModule,
        ClrModalModule,
        ConfirmDialogComponent,
        AsyncPipe,
        LengthPipe,
        FallbackPipe,
    ],
})
export class ProcessInstanceControlComponent implements OnInit, OnChanges, OnDestroy {
    private api = inject(WmpApiService);
    private incidentService = inject(IncidentHandlingService);
    private processInstanceIncidentService =
        inject(BpmnManagerService).getProcessInstanceHandlerService(WORKFLOWS_BPMN_IDENTIFIER)
            .processInstanceIncidentService;

    readonly processInstance = input<HistoricProcessInstanceDto | null>();
    readonly buttonClicked = output<boolean>();

    countExecutions: number | undefined = undefined;

    terminateModalOpen: boolean = false;

    processInstanceSuspended?: boolean;
    processInstanceTerminated?: boolean;

    processWithIncidents: HistoricProcessInstance | undefined = undefined;

    incidents: Observable<HistoricIncidentDto[]> =
        this.processInstanceIncidentService.processInstanceIncidents$;

    incidentConfirmDialog = new DialogConfirmationHandler();

    async ngOnInit() {
        const processInstance = this.processInstance();
        if (processInstance?.id) this.countExecutions = await this.api.getExecutionCount(processInstance?.id);
    }

    ngOnDestroy(): void {
        this.incidentConfirmDialog.onDestroy();
    }

    async ngOnChanges() {
        const processInstance = this.processInstance();
        if (processInstance && processInstance.id) {
            const allInstances = await this.api.getProcessInstancesWithActivities({
                processInstanceId: processInstance.id,
            } satisfies WorkflowFilter);
            const wmpHistoricInstance = allInstances.find(
                (instance) => instance.id === this.processInstance()?.id,
            );
            if (wmpHistoricInstance) {
                this.processWithIncidents = await getInstanceWithIncidents(wmpHistoricInstance, this.api);
            }
        }

        this.processInstanceSuspended =
            processInstance?.state == HistoricProcessInstanceDto.StateEnum.Suspended ||
            processInstance?.state == HistoricProcessInstanceDto.StateEnum.Completed ||
            isIncident(this.processWithIncidents);

        this.processInstanceTerminated =
            processInstance?.state == HistoricProcessInstanceDto.StateEnum.ExternallyTerminated ||
            processInstance?.state == HistoricProcessInstanceDto.StateEnum.Completed;
    }

    async suspendProcessInstance() {
        await this.api.suspendProcessInstance(true, this.processInstance()?.id);
        this.buttonClicked.emit(true);
    }

    async unsuspendProcessInstance() {
        //case incident occurred
        if (this.processWithIncidents && isIncident(this.processWithIncidents)) {
            const incidents = this.processWithIncidents.incidents;
            if (incidents.length > 1) {
                const restartedIncidentsObserver = this.incidentConfirmDialog.openDialogAndHandleResult(
                    () => {
                        incidents.forEach(async (incident) => {
                            await this.incidentService.retryIncidentGiven(incident);
                        });
                    },
                );
                //case incidents got restarted, refresh page
                restartedIncidentsObserver.subscribe(() => this.onButtonClick());
            } else {
                //directly retry single incident
                await this.incidentService.retryIncidentGiven(incidents[0]);
                this.onButtonClick();
            }

            // await retryInstance(this.processWithIncidents, this.api, this.alertService);
        } else {
            //case no incident just unsuspend instance
            await this.api.suspendProcessInstance(false, this.processInstance()?.id);
            this.onButtonClick();
        }
    }

    onButtonClick() {
        this.buttonClicked.emit(true);
    }

    async deleteProcessInstance() {
        this.terminateModalOpen = false;
        await this.api.deleteProcessInstance(this.processInstance()?.id);
        this.buttonClicked.emit(true);
    }

    openDeleteModal() {
        this.terminateModalOpen = true;
    }

    closeDeleteModal() {
        this.terminateModalOpen = false;
    }

    protected readonly HistoricProcessInstanceDto = HistoricProcessInstanceDto;
}
