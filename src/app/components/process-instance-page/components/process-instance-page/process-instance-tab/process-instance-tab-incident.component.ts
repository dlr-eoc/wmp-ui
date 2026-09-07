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

import {Component, inject, signal} from '@angular/core';
import {Subject} from 'rxjs';
import {ClrConditionalModule, ClrDatagridModule, ClrDatagridSortOrder, ClrTabsModule} from '@clr/angular';
import {
    IncidentActivityIdFilter,
    IncidentMessageFilter,
} from 'src/app/components/process-instance-page/components/process-instance-page/CustomDataGridFilters';
import {AsyncPipe} from '@angular/common';
import {IncidentsFilterActivityPipe} from 'src/app/pipes/process-instance.pipe';
import {
    BpmnManagerService,
    WORKFLOWS_BPMN_IDENTIFIER,
} from 'src/app/shared/services/bpmn/bpmn-manager.service';
import {ConfirmCancelDialogComponent} from 'src/app/shared/components/dialog/confirm-cancel-dialog/confirm-cancel-dialog.component';
import {Button} from 'primeng/button';
import {Tooltip} from 'primeng/tooltip';
import {CdkCopyToClipboard} from '@angular/cdk/clipboard';

@Component({
    selector: 'app-process-instance-tab-incident',
    templateUrl: './process-instance-tab-incident.component.html',
    imports: [
        ClrTabsModule,
        ClrDatagridModule,
        ClrConditionalModule,
        AsyncPipe,
        IncidentsFilterActivityPipe,
        ConfirmCancelDialogComponent,
        Button,
        Tooltip,
        CdkCopyToClipboard,
    ],
})
export class ProcessInstanceTabIncidentComponent {
    private incidentService =
        inject(BpmnManagerService).getProcessInstanceHandlerService(WORKFLOWS_BPMN_IDENTIFIER)
            .processInstanceIncidentService;
    private jobService =
        inject(BpmnManagerService).getProcessInstanceHandlerService(WORKFLOWS_BPMN_IDENTIFIER)
            .processInstanceJobService;
    private readonly bpmnOverlayStorage =
        inject(BpmnManagerService).getBpmnDiagramHandler(WORKFLOWS_BPMN_IDENTIFIER).bpmnOverlayStorage;

    defaultSortOrder = ClrDatagridSortOrder.DESC;
    incidentActivityIdFilter = new IncidentActivityIdFilter();
    incidentMessageFilter = new IncidentMessageFilter();

    incidentsLoading = this.incidentService.processInstanceIncidentsLoading;
    incidents = this.incidentService.processInstanceIncidents$;
    stacktraceMap: Subject<{[p: string]: string}> = this.jobService.stacktraceMap;

    $openDetails = signal<boolean>(false);
    $errorDetails = signal<string | undefined>(undefined);

    activityName = '';

    constructor() {
        this.bpmnOverlayStorage.selection$.subscribe((value) => {
            this.activityName = value?.elementId ?? '';
        });
    }
}
