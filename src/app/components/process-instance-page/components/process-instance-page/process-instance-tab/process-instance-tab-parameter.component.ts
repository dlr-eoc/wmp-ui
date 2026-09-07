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

import {ChangeDetectionStrategy, Component, inject, OnDestroy, signal} from '@angular/core';
import {BPMNParameter} from 'src/app/components/process-instance-page/components/process-instance-page/process-instance-tab/process-instance-tab-bpmn-parameter.component';
import {Observable} from 'rxjs';
import {HistoricActivityInstanceDto, HistoricVariableInstanceDto} from 'src/app/shared/services/camunda-api';
import {ClrConditionalModule, ClrDatagridModule, ClrIcon, ClrTabsModule} from '@clr/angular';
import {AsyncPipe} from '@angular/common';
import {FallbackPipe} from 'src/app/pipes/conversion.pipe';
import {
    BpmnManagerService,
    WORKFLOWS_BPMN_IDENTIFIER,
} from 'src/app/shared/services/bpmn/bpmn-manager.service';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {ParameterFilterActivityPipe} from 'src/app/pipes/process-instance.pipe';
import {SaferJsonPipe} from 'src/app/pipes/safer-json.pipe';

@Component({
    selector: 'app-process-instance-tab-parameter',
    templateUrl: './process-instance-tab-parameter.component.html',
    imports: [
        ClrTabsModule,
        ClrDatagridModule,
        ClrIcon,
        ClrConditionalModule,
        AsyncPipe,
        FallbackPipe,
        ParameterFilterActivityPipe,
        SaferJsonPipe,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessInstanceTabParameterComponent extends AsyncDestroyable implements OnDestroy {
    private readonly parameterService =
        inject(BpmnManagerService).getProcessInstanceHandlerService(WORKFLOWS_BPMN_IDENTIFIER)
            .processInstanceParameterService;
    private activityService =
        inject(BpmnManagerService).getProcessInstanceHandlerService(WORKFLOWS_BPMN_IDENTIFIER)
            .processInstanceActivityService;
    private readonly workflowFilterService =
        inject(BpmnManagerService).getBpmnDiagramHandler(WORKFLOWS_BPMN_IDENTIFIER).workflowFilterService;
    processInstanceVariables = this.parameterService.processInstanceVariables$;
    processInstanceVariablesLoading = this.parameterService.processInstanceVariablesLoading;
    //activity
    activityInstanceNameMap: Observable<{[activityInstanceId: string]: string}> =
        this.activityService.activityInstanceNameMap$;

    bpmnParameters: BPMNParameter[] = [];
    processInstanceParameterMapping: Map<string, Map<string, string>> = new Map<
        string,
        Map<string, string>
    >();
    instanceVariables: HistoricVariableInstanceDto[] = [];
    activityInstance = signal<HistoricActivityInstanceDto | undefined>(undefined);

    constructor() {
        super();
        this.subscribeWithDestroyHandler(this.parameterService.bpmnParameters$, (parametersUpdated) => {
            this.bpmnParameters = parametersUpdated;
        });
        this.subscribeWithDestroyHandler(this.parameterService.processInstanceParameterMapping$, (value) => {
            this.processInstanceParameterMapping = value;
        });
        this.subscribeWithDestroyHandler(this.parameterService.processInstanceVariables$, (value) => {
            this.instanceVariables = value;
        });
        this.subscribeWithDestroyHandler(this.workflowFilterService.filter$, (filter) => {
            if (filter?.shouldUpdate) {
                this.activityInstance.set(
                    filter?.activity?.activityInstance ?? filter.callActivity?.activityInstance ?? undefined,
                );
            }
        });
    }
    ngOnDestroy(): void {
        super.destroy();
    }

    checkParameterExists(parameterName: any): boolean {
        let found = false;
        this.bpmnParameters.forEach((parameter) => {
            if (this.processInstanceParameterMapping.has(parameter.activityName)) {
                if (this.processInstanceParameterMapping.get(parameter.activityName)?.has(parameterName)) {
                    found = true;
                }
            }
        });
        return found;
    }

    printBPMNParameterValueTooltip(parameterName: any): string {
        let string = '';
        this.bpmnParameters.forEach((parameter) => {
            if (this.processInstanceParameterMapping.has(parameter.activityName)) {
                if (this.processInstanceParameterMapping.get(parameter.activityName)?.has(parameterName)) {
                    string = this.processInstanceParameterMapping
                        .get(parameter.activityName)
                        ?.get(parameterName)!;
                }
            }
        });
        return 'BPMN Parameter: ' + string;
    }

    checkValueTokenString(variableData: HistoricVariableInstanceDto) {
        if (variableData.type === 'String') {
            const value = variableData.value;
            return (
                value.includes('{"token":"') &&
                value.includes('"path":"') &&
                value.includes('"keyIdentifier":')
            );
        }
        return false;
    }
}
