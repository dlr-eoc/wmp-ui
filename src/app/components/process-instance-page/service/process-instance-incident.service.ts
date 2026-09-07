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

import {HistoricIncidentDto} from 'src/app/shared/services/camunda-api';
import {OperatonIncidentService} from 'src/app/shared/services/wmp-api/custom/operaton-incident.service';
import {Observable, Subject} from 'rxjs';
import {WorkflowFilterServiceBase} from 'src/app/components/workflow-page/service/WorkflowFilterServiceBase';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {HistoricIncidentDetails} from 'src/app/shared/services/wmp-api/custom/model/incidents-models';

export class ProcessInstanceIncidentService extends AsyncDestroyable {
    private readonly incidentService: OperatonIncidentService;
    private readonly workflowFilterService: WorkflowFilterServiceBase;

    private _processInstanceIncidents$: Subject<HistoricIncidentDetails[]> = new Subject();
    private _processInstanceIncidentsLoading: Subject<boolean> = new Subject();

    constructor(incidentService: OperatonIncidentService, workflowFilterService: WorkflowFilterServiceBase) {
        super();
        this.incidentService = incidentService;
        this.workflowFilterService = workflowFilterService;
        this.subscribeWithDestroyHandler(this.workflowFilterService.filter$, (filter) => {
            if (filter?.shouldUpdate && filter.processInstanceId) {
                this.updateIncidentData(filter.processInstanceId);
            }
        });
    }

    /**
     *  Updating incidents of a given processInstanceId.
     *  Public usage directly deprecated, use filter to update incident data.
     * @param processInstanceId
     */
    async updateIncidentData(processInstanceId: string | undefined | null) {
        this._processInstanceIncidentsLoading.next(true);
        const lastIncidents = await this.incidentService.getLastIncidentsWithErrorDetails(processInstanceId);
        this._processInstanceIncidents$.next(lastIncidents);
        this._processInstanceIncidentsLoading.next(false);
    }

    async getIncidentsOfProcessInstanceId(
        processInstanceId: string | undefined,
    ): Promise<HistoricIncidentDto[]> {
        return await this.incidentService.getLastIncidentsWithErrorDetails(processInstanceId);
    }

    get processInstanceIncidents$(): Observable<HistoricIncidentDto[]> {
        return this._processInstanceIncidents$.asObservable();
    }

    get processInstanceIncidentsLoading(): Observable<boolean> {
        return this._processInstanceIncidentsLoading.asObservable();
    }
    destroy() {
        super.destroy();
    }
}
