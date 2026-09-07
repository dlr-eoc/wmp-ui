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

import {Component, inject} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {HistoricJobLogDto} from 'src/app/shared/services/camunda-api';
import {ClrConditionalModule, ClrDatagridModule, ClrTabsModule} from '@clr/angular';
import {AsyncPipe} from '@angular/common';
import {FallbackPipe} from 'src/app/pipes/conversion.pipe';
import {JobLogFilterPipe} from 'src/app/pipes/process-instance.pipe';
import {DEFAULT_SORT_ORDER_PROCESS_INSTANCE} from 'src/app/components/process-instance-page/components/process-instance-page/process-instance-tab/process-instance-tab-audit.component';
import {
    BpmnManagerService,
    WORKFLOWS_BPMN_IDENTIFIER,
} from 'src/app/shared/services/bpmn/bpmn-manager.service';

@Component({
    selector: 'app-process-instance-tab-job',
    templateUrl: './process-instance-tab-job.component.html',
    imports: [
        ClrTabsModule,
        ClrDatagridModule,
        ClrConditionalModule,
        AsyncPipe,
        FallbackPipe,
        JobLogFilterPipe,
    ],
})
export class ProcessInstanceTabJobComponent {
    private jobService =
        inject(BpmnManagerService).getProcessInstanceHandlerService(WORKFLOWS_BPMN_IDENTIFIER)
            .processInstanceJobService;
    private activityService =
        inject(BpmnManagerService).getProcessInstanceHandlerService(WORKFLOWS_BPMN_IDENTIFIER)
            .processInstanceActivityService;
    private readonly bpmnOverlayStorage =
        inject(BpmnManagerService).getBpmnDiagramHandler(WORKFLOWS_BPMN_IDENTIFIER).bpmnOverlayStorage;

    defaultSortOrder = DEFAULT_SORT_ORDER_PROCESS_INSTANCE;
    //jobLogs
    processInstanceJobLogs: Observable<HistoricJobLogDto[]> = this.jobService.processInstanceJobLogs$;
    processInstanceJobLogsLoading: Subject<boolean> = this.jobService.processInstanceJobLogsLoading;
    stacktraceMap: Subject<{[p: string]: string}> = this.jobService.stacktraceMap;
    //activity
    activityNameMap = this.activityService.activityInstanceNameMap$;
    activityName: string = '';

    constructor() {
        this.bpmnOverlayStorage.selection$.subscribe((value) => {
            this.activityName = value?.elementId ?? '';
        });
    }

    getLogType(processInstanceJobLog: HistoricJobLogDto): string {
        if (processInstanceJobLog.creationLog) {
            return 'CREATION';
        } else if (processInstanceJobLog.deletionLog) {
            return 'DELETION';
        } else if (processInstanceJobLog.failureLog) {
            return 'FAILURE';
        } else if (processInstanceJobLog.successLog) {
            return 'SUCCESS';
        } else {
            return 'not defined';
        }
    }
}
