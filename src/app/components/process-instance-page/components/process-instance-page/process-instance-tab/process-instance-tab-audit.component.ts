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
import {Observable} from 'rxjs';
import {HistoricActivityInstanceDto} from 'src/app/shared/services/camunda-api';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {ClrDatagridModule, ClrDatagridSortOrder, ClrTabsModule} from '@clr/angular';
import {AsyncPipe} from '@angular/common';
import {MillisecondPipe} from 'src/app/shared/pipes/millisecond.pipe';
import {FallbackPipe} from 'src/app/pipes/conversion.pipe';
import {AuditLogFilterPipe} from 'src/app/pipes/process-instance.pipe';
import {
    BpmnManagerService,
    WORKFLOWS_BPMN_IDENTIFIER,
} from 'src/app/shared/services/bpmn/bpmn-manager.service';

export const DEFAULT_SORT_ORDER_PROCESS_INSTANCE = ClrDatagridSortOrder.DESC;

@Component({
    selector: 'app-process-instance-tab-audit',
    templateUrl: './process-instance-tab-audit.component.html',
    imports: [ClrTabsModule, ClrDatagridModule, AsyncPipe, MillisecondPipe, FallbackPipe, AuditLogFilterPipe],
})
export class ProcessInstanceTabAuditComponent extends AsyncDestroyable implements OnDestroy {
    private activityService =
        inject(BpmnManagerService).getProcessInstanceHandlerService(WORKFLOWS_BPMN_IDENTIFIER)
            .processInstanceActivityService;
    private readonly bpmnOverlayStorage =
        inject(BpmnManagerService).getBpmnDiagramHandler(WORKFLOWS_BPMN_IDENTIFIER).bpmnOverlayStorage;

    defaultSortOrder = DEFAULT_SORT_ORDER_PROCESS_INSTANCE;

    processInstanceActivityLog: Observable<HistoricActivityInstanceDto[]> =
        this.activityService.processInstanceActivityLog$;
    processInstanceAuditLogsLoading: Observable<boolean> =
        this.activityService.processInstanceAuditLogsLoading$;

    activityName: string = '';

    constructor() {
        super();
        this.subscribeWithDestroyHandler(this.bpmnOverlayStorage.selection$, (value) => {
            this.activityName = value?.elementId ?? '';
        });
    }

    ngOnDestroy(): void {
        this.destroy();
    }
}
