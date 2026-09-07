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

import {Component, inject, Injector, input, OnDestroy, OnInit, runInInjectionContext} from '@angular/core';
import {
    BPMNConfigElement,
    VisualConfigElement,
} from 'src/app/shared/services/user/models/VisualizeConfigData';
import {BpmnManagerService} from 'src/app/shared/services/bpmn/bpmn-manager.service';
import {BpmnHandlerService} from 'src/app/shared/services/bpmn/bpmn-handler.service';
import {OperatonProcessDefinitionService} from 'src/app/shared/services/wmp-api/custom/operaton-process-definition.service';
import {WorkflowFilter} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {BpmnDiagramContainerComponent} from 'src/app/shared/components/bpmn-diagram/bpmn-diagram-container.component';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {ProcessInstanceHandlerService} from 'src/app/shared/services/bpmn/process-instance/process-instance-handler.service';
import {BpmnManager} from 'src/app/shared/services/bpmn/bpmn-manager';

@Component({
    selector: 'app-visual-bpmn',
    imports: [BpmnDiagramContainerComponent],
    templateUrl: './visual-bpmn.component.html',
    styleUrl: './visual-bpmn.component.scss',
})
export class VisualBpmnComponent extends AsyncDestroyable implements OnInit, OnDestroy {
    readonly configElement = input.required<VisualConfigElement | undefined>();

    private readonly injector = inject(Injector);
    private readonly bpmnManagerService = inject(BpmnManagerService);
    private readonly processDefinitionService = inject(OperatonProcessDefinitionService);

    bpmnHandlerService: BpmnHandlerService | undefined = undefined;
    bpmnManager: BpmnManager | undefined = undefined;
    private processInstanceHandlerService: ProcessInstanceHandlerService | undefined = undefined;

    constructor() {
        super();
    }

    ngOnDestroy(): void {
        super.destroy();
    }

    async ngOnInit(): Promise<void> {
        const configId = this.configElement()?.id;
        if (configId) {
            //no injection context? - use angular function helper
            runInInjectionContext(this.injector, async () => {
                this.bpmnManager = this.bpmnManagerService.getBpmnManager(configId);
                this.bpmnHandlerService = this.bpmnManagerService.getBpmnDiagramHandler(configId);
                this.processInstanceHandlerService =
                    this.bpmnManagerService.getProcessInstanceHandlerService(configId);
                if (this.bpmnHandlerService) {
                    this.bpmnHandlerService.bpmnDiagramService.updateLoading(true);
                    const bpmnConfigElement = this.configElement() as BPMNConfigElement;
                    const workflowFilter = {
                        processDefinition: {
                            id: bpmnConfigElement.processDefinitionId,
                            key: bpmnConfigElement.processDefinitionKey,
                        },
                    } as WorkflowFilter;

                    const processDefinition$ = await this.checkProcessDefinition(workflowFilter);
                    this.subscribeWithDestroyHandler(processDefinition$, async (value) => {
                        if (value.length === 1) {
                            const processDefinitionIdFromBackend = value[0].processDefinitionId;
                            if (processDefinitionIdFromBackend) {
                                const updatedWorkflowFilter = {
                                    ...workflowFilter,
                                    processDefinition: {
                                        id: processDefinitionIdFromBackend,
                                        key: value[0].processDefinitionKey,
                                        version: value[0].processDefinitionVersion,
                                    },
                                } as WorkflowFilter;
                                this.processInstanceHandlerService?.workflowBpmnService.updateBPMNFromProcessDefinition(
                                    workflowFilter,
                                );
                                //assure to update local workflow filter afterward
                                this.bpmnHandlerService?.workflowFilterService.mergeFilterAndUpdate(
                                    updatedWorkflowFilter,
                                );
                                this.bpmnHandlerService?.bpmnDiagramService.updateLoading(false);
                            }
                        }
                    });
                }
            });
        }
    }

    private checkProcessDefinition(workflowFilter: WorkflowFilter) {
        return this.processDefinitionService.getHistoricProcessDefinition(
            // workflowFilter.processDefinition?.id,
            undefined,
            workflowFilter.processDefinition?.key,
        );
    }
}
