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
import {Observable} from 'rxjs';
import {ClrDatagridModule, ClrTabsModule} from '@clr/angular';
import {AsyncPipe} from '@angular/common';
import {BPMNParameterFilterActivityPipe} from 'src/app/pipes/process-instance.pipe';
import {
    BpmnManagerService,
    WORKFLOWS_BPMN_IDENTIFIER,
} from 'src/app/shared/services/bpmn/bpmn-manager.service';

@Component({
    selector: 'app-process-instance-tab-bpmn-parameter',
    templateUrl: './process-instance-tab-bpmn-parameter.component.html',
    imports: [ClrTabsModule, ClrDatagridModule, AsyncPipe, BPMNParameterFilterActivityPipe],
})
export class ProcessInstanceTabBpmnParameterComponent {
    private readonly bpmnManagerService = inject(BpmnManagerService);
    private readonly parameterService =
        this.bpmnManagerService.getProcessInstanceHandlerService(WORKFLOWS_BPMN_IDENTIFIER)
            .processInstanceParameterService;
    private readonly bpmnOverlayStorage =
        this.bpmnManagerService.getBpmnDiagramHandler(WORKFLOWS_BPMN_IDENTIFIER).bpmnOverlayStorage;

    //parameter values
    bpmnParameters: BPMNParameter[] = [];
    bpmnParametersLoading: Observable<boolean> = this.parameterService.bpmnParametersLoading;
    activityName = '';

    constructor() {
        this.bpmnOverlayStorage.selection$.subscribe((value) => {
            this.activityName = value?.elementId ?? '';
        });
        this.parameterService.bpmnParameters$.subscribe((value) => {
            this.bpmnParameters = value;
        });
    }
}

export interface BPMNParameter {
    activityName: string;
    activityId: string;
    type: string;
    key: string;
    value: string;
}
