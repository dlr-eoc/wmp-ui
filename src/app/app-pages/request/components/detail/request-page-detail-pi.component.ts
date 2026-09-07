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

import {Component, inject, OnDestroy} from '@angular/core';
import {RequestService} from 'src/app/app-pages/request/service/request.service';
import {HistoricIncidentDto, HistoricProcessInstanceDto} from 'src/app/shared/services/camunda-api';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {COLOR_INCIDENT, COLOR_TERMINATED} from 'src/app/shared/components/bpmn-diagram/bpmn-diagram.utils';
import icons from 'bpmn-js/lib/features/distribute-elements/DistributeElementsIcons';
import {Card} from 'primeng/card';
import {LengthPipe} from 'src/app/shared/pipes/length.pipe';
import {WorkflowFilterService} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {install} from 'diagram-js/lib/util/ClickTrap';
import {WorkflowFilterSelectionGroupComponent} from 'src/app/shared/components/workflow/workflow-filter-selection-group/workflow-filter-selection-group.component';
import {
    BpmnManagerService,
    WORKFLOWS_BPMN_IDENTIFIER,
} from 'src/app/shared/services/bpmn/bpmn-manager.service';

@Component({
    selector: 'request-page-detail-process-instance',
    templateUrl: './request-page-detail-pi.component.html',
    styleUrls: ['./request-page-detail-pi.component.scss'],
    standalone: true,
    imports: [Card, LengthPipe, WorkflowFilterSelectionGroupComponent],
})
export class RequestPageDetailProcessInstanceComponent extends AsyncDestroyable implements OnDestroy {
    private requestService = inject(RequestService);
    private incidentService =
        inject(BpmnManagerService).getProcessInstanceHandlerService(WORKFLOWS_BPMN_IDENTIFIER)
            .processInstanceIncidentService;
    readonly workflowFilterService = inject(WorkflowFilterService);
    selectedRequestInstances: HistoricProcessInstanceDto[] = [];
    incidents: Map<string, HistoricIncidentDto[]> = new Map();
    customColorsInstances: Map<string, string> = new Map();

    constructor() {
        super();

        this.subscribeWithDestroyHandler(this.requestService.selectedRequestInstances$, (value) => {
            this.selectedRequestInstances = value;
            value.forEach(async (instance) => {
                const instanceId = instance.id;
                if (instanceId) {
                    const incidentsOfInstance =
                        await this.incidentService.getIncidentsOfProcessInstanceId(instanceId);
                    this.incidents.set(instanceId, incidentsOfInstance);
                    if (incidentsOfInstance && incidentsOfInstance.length > 0) {
                        this.customColorsInstances.set(instanceId, COLOR_INCIDENT);
                    }

                    if (
                        instance.state === 'EXTERNALLY_TERMINATED' ||
                        instance.state === 'INTERNALLY_TERMINATED'
                    ) {
                        //this color will overwrite incident color
                        this.customColorsInstances.set(instanceId, COLOR_TERMINATED);
                    }
                }
            });
        });
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    protected readonly icons = icons;
    protected readonly install = install;
}
