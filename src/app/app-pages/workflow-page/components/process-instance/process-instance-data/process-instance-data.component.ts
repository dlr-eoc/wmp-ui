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

import {Component, inject, OnInit} from '@angular/core';
import {ClrTabsModule} from '@clr/angular';
import {LogWidgetComponent} from 'src/app/app-pages/log/components/log-widget/log-widget.component';
import {ProcessInstanceTabAuditComponent} from 'src/app/components/process-instance-page/components/process-instance-page/process-instance-tab/process-instance-tab-audit.component';
import {ProcessInstanceTabBpmnParameterComponent} from 'src/app/components/process-instance-page/components/process-instance-page/process-instance-tab/process-instance-tab-bpmn-parameter.component';
import {ProcessInstanceTabIncidentComponent} from 'src/app/components/process-instance-page/components/process-instance-page/process-instance-tab/process-instance-tab-incident.component';
import {ProcessInstanceTabJobComponent} from 'src/app/components/process-instance-page/components/process-instance-page/process-instance-tab/process-instance-tab-job.component';
import {ProcessInstanceTabParameterComponent} from 'src/app/components/process-instance-page/components/process-instance-page/process-instance-tab/process-instance-tab-parameter.component';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {BehaviorSubject} from 'rxjs';
import {ColumnDefSortAndFilterable} from 'src/app/shared/components/table/data/TableTypes';
import {LOGS_COLUMNS_ACTIVITY} from 'src/app/app-pages/log/utils/log.utils';
import {
    BpmnManagerService,
    WORKFLOWS_BPMN_IDENTIFIER,
} from 'src/app/shared/services/bpmn/bpmn-manager.service';

@Component({
    selector: 'app-process-instance-data',
    imports: [
        ClrTabsModule,
        LogWidgetComponent,
        ProcessInstanceTabAuditComponent,
        ProcessInstanceTabBpmnParameterComponent,
        ProcessInstanceTabIncidentComponent,
        ProcessInstanceTabJobComponent,
        ProcessInstanceTabParameterComponent,
    ],
    templateUrl: './process-instance-data.component.html',
    styleUrl: './process-instance-data.component.scss',
})
export class ProcessInstanceDataComponent extends AsyncDestroyable implements OnInit {
    private readonly bpmnHandler =
        inject(BpmnManagerService).getBpmnDiagramHandler(WORKFLOWS_BPMN_IDENTIFIER);
    private bpmnOverlayStorage = this.bpmnHandler.bpmnOverlayStorage;
    taskSelected: string | undefined = undefined;

    protected columnsOfLogWidgetActivity = new BehaviorSubject<ColumnDefSortAndFilterable[]>(
        LOGS_COLUMNS_ACTIVITY,
    );
    constructor() {
        super();
    }

    ngOnInit(): void {
        this.subscribeWithDestroyHandler(this.bpmnOverlayStorage.selection$, (element) => {
            this.taskSelected = element ? element.elementId : undefined;
        });
    }
}
