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

import {inject, Injectable} from '@angular/core';
import {OperatonJobService} from 'src/app/shared/services/wmp-api/custom/operaton-job.service';
import {AlertService, WmpAlertType} from 'src/app/shared/services/alert.service';
import {OperatonExternalTaskService} from 'src/app/shared/services/wmp-api/custom/operaton-external-task.service';
import {HistoricIncidentDto, HistoricIncidentService} from 'src/app/shared/services/camunda-api';
import {firstValueFrom} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class IncidentHandlingService {
    private readonly jobService = inject(OperatonJobService);
    private readonly externalTaskService = inject(OperatonExternalTaskService);
    private readonly historicIncidentService = inject(HistoricIncidentService);
    private readonly alertService = inject(AlertService);

    /**
     * Restarting an instance with given jobService. Two cases are available: "failedJob" or "failedExternalTask".
     * Those need to be handled separately.
     * @param incidentToRestart - the incident to use to restart
     */
    retryIncidentGiven(incidentToRestart: HistoricIncidentDto) {
        if (incidentToRestart.incidentType === 'failedJob') {
            return this.jobService.restartIncident(incidentToRestart);
        }
        if (incidentToRestart.incidentType === 'failedExternalTask') {
            return this.externalTaskService.restartExternalTask(incidentToRestart);
        }

        this.alertService.addAlert({
            text: 'Instance could not be restarted.',
            type: WmpAlertType.ERROR,
            id: 'workflow_utils_restart_instance',
        });
        return Promise.resolve();
    }

    getHistoricIncidentsOfProcessInstanceId(processInstanceId: string) {
        return firstValueFrom(
            this.historicIncidentService.getHistoricIncidents(
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                processInstanceId,
            ),
        );
    }
}
