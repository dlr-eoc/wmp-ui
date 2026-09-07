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

import {Component, inject, OnChanges, input, output} from '@angular/core';
import {HistoricIncidentDto, HistoricProcessInstanceDto} from 'src/app/shared/services/camunda-api';
import {retryIncidentGiven} from 'src/app/utils/bpmn/instance.utils';
import {AlertService} from 'src/app/shared/services/alert.service';
import {OperatonJobService} from 'src/app/shared/services/wmp-api/custom/operaton-job.service';
import {OperatonExternalTaskService} from 'src/app/shared/services/wmp-api/custom/operaton-external-task.service';

import {ClrIconModule} from '@clr/angular';

@Component({
    selector: 'app-activity-control',
    templateUrl: './activity-control.component.html',
    imports: [ClrIconModule],
})
export class ActivityControlComponent implements OnChanges {
    private jobDefinitionService = inject(OperatonJobService);
    private externalTaskService = inject(OperatonExternalTaskService);
    private alertService = inject(AlertService);

    readonly processInstance = input.required<HistoricProcessInstanceDto | undefined>();
    readonly taskSelected = input.required<string>();
    readonly buttonClicked = output<boolean>();
    readonly processInstanceIncidents = input.required<HistoricIncidentDto[] | undefined>();

    processInstanceTerminated: boolean = false;
    taskIncidentOccurred: boolean = false;

    incidentOfSelectedTask: HistoricIncidentDto | undefined;

    ngOnChanges(): void {
        const processInstance = this.processInstance();
        if (processInstance && processInstance.id) {
            const taskSelected = this.taskSelected();
            if (taskSelected && taskSelected !== '') {
                const incidentsOfSelectedTask = this.processInstanceIncidents()?.filter(
                    (incident) => incident.activityId === this.taskSelected(),
                );
                if (incidentsOfSelectedTask && incidentsOfSelectedTask.length === 1) {
                    this.incidentOfSelectedTask = incidentsOfSelectedTask[0];
                    this.taskIncidentOccurred = true;
                } else {
                    this.taskIncidentOccurred = false;
                }
            }
            this.processInstanceTerminated =
                processInstance?.state == HistoricProcessInstanceDto.StateEnum.ExternallyTerminated ||
                processInstance?.state == HistoricProcessInstanceDto.StateEnum.Completed;
        }
    }

    async restartJobWithIncident() {
        // case incident occurred
        if (this.incidentOfSelectedTask) {
            await retryIncidentGiven(
                this.incidentOfSelectedTask,
                this.jobDefinitionService,
                this.alertService,
                this.externalTaskService,
            );
        }
        this.onButtonClick();
    }

    onButtonClick() {
        this.buttonClicked.emit(true);
    }
}
