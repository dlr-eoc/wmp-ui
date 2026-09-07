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

import {inject, Injectable, OnDestroy, signal} from '@angular/core';
import {AlertService} from 'src/app/shared/services/alert.service';
import {BpmnHandlerService} from 'src/app/shared/services/bpmn/bpmn-handler.service';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from 'src/app/shared/services/config.service';
import {WorkflowFilterService} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {WorkflowFilterServiceBase} from 'src/app/components/workflow-page/service/WorkflowFilterServiceBase';
import {FilterStorageService} from 'src/app/shared/services/client/filter/filter-storage.service';
import {NavigationService} from 'src/app/shared/services/client/router/navigation/navigation.service';
import {ProcessInstanceHandlerService} from 'src/app/shared/services/bpmn/process-instance/process-instance-handler.service';
import {BpmnManager} from 'src/app/shared/services/bpmn/bpmn-manager';
import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';
import {OperatonIncidentService} from 'src/app/shared/services/wmp-api/custom/operaton-incident.service';
import {OperatonProcessDefinitionService} from 'src/app/shared/services/wmp-api/custom/operaton-process-definition.service';

@Injectable({
    providedIn: 'root',
})
export class BpmnManagerService implements OnDestroy {
    private readonly alertService = inject(AlertService);
    private readonly httpClient = inject(HttpClient);
    private readonly configService = inject(ConfigService);
    private readonly workflowFilterService = inject(WorkflowFilterService);
    private readonly filterStorageService = inject(FilterStorageService);
    private readonly navigationService = inject(NavigationService);
    private readonly wmpApiService = inject(WmpApiService);
    private readonly incidentService = inject(OperatonIncidentService);
    private readonly processDefinitionService = inject(OperatonProcessDefinitionService);

    private diagrams = signal<Map<string, BpmnManager | undefined>>(
        new Map<string, BpmnManager | undefined>(),
    );

    constructor() {}
    ngOnDestroy(): void {
        //TODO performance? go trough all diagrams an destroy those
    }

    /**
     * Retrieves an existing BPMN manager for the given handlerIdentifier
     * or creates a new one if it does not yet exist.
     *
     * @param handlerIdentifier Unique key used to look up (or store) the manager
     *                           in the internal diagrams() map.
     * @returns The {@link BpmnManager} instance associated with handlerIdentifier.
     *          If a manager already exists for this identifier, the existing
     *          instance is returned (after logging an error as a temporary
     *          workaround for WMP‑157).
     *
     * @remarks
     * - The method delegates to {@link #createManager} with identifier‑specific
     *   flags (`allowSelection`, `allowLabelClick`) and an optional
     *   {@link WorkflowFilterService}.
     */
    addBpmnManager(handlerIdentifier: string) {
        const foundService = this.diagrams().get(handlerIdentifier);
        if (foundService) {
            console.error("Already added diagram for identifier '" + handlerIdentifier + "'");
            //also return found service, to prevent undefines
            return foundService;
        } else {
            switch (handlerIdentifier) {
                case WORKFLOWS_BPMN_IDENTIFIER:
                    return this.createManager(handlerIdentifier, true, true, this.workflowFilterService);
                case DASHBOARD_BPMN_TICKET_IDENTIFIER:
                    return this.createManager(handlerIdentifier, true, false, undefined);
                default:
                    return this.createManager(handlerIdentifier, false, false, undefined);
            }
        }
    }

    /**
     * Creates a BPMN manager for the given identifier and configures its dependent services.
     *
     * @param managerIdentifier               A unique string used to identify and store the filter for this manager.
     * @param allowSelection                  Flag indicating whether element selection is enabled in the diagram.
     * @param allowLabelClick                 Flag indicating whether clicking on labels is allowed.
     * @param predefinedWorkflowFilterService Optional existing {@link WorkflowFilterService} to reuse;
     *                                        if omitted a new {@link WorkflowFilterServiceBase} will be instantiated
     *                                        using the manager's identifier for storage.
     * @returns The newly created (or cached) {@link BpmnManager} instance associated with managerIdentifier.
     */
    createManager(
        managerIdentifier: string,
        allowSelection: boolean,
        allowLabelClick: boolean,
        predefinedWorkflowFilterService: WorkflowFilterService | undefined,
    ) {
        const createdWorkflowFilter =
            predefinedWorkflowFilterService ??
            new WorkflowFilterServiceBase(
                this.filterStorageService,
                this.navigationService,
                managerIdentifier, //use identifier to store filter
            );
        const createdBpmnHandlerService = new BpmnHandlerService(
            this.alertService,
            this.httpClient,
            this.configService,
            this.wmpApiService,
            //destroy will be handled in the handlerService (not managerService)
            createdWorkflowFilter,
            allowSelection,
            allowLabelClick,
        );
        const processInstanceHandlerService = new ProcessInstanceHandlerService(
            this.wmpApiService,
            createdWorkflowFilter,
            this.alertService,
            this.incidentService,
            this.processDefinitionService,
            createdBpmnHandlerService,
        );

        const bpmnManager = new BpmnManager(
            createdBpmnHandlerService,
            processInstanceHandlerService,
            this.navigationService,
            this.wmpApiService,
            this.alertService,
            managerIdentifier,
        );
        this.diagrams().set(managerIdentifier, bpmnManager);
        return bpmnManager;
    }

    removeBPMNManager(identifier: string) {
        const foundHandler = this.diagrams().get(identifier);
        if (foundHandler) {
            foundHandler.bpmnHandler.clearHandler();
            foundHandler.processInstanceHandler.clearHandler();
            this.diagrams().set(identifier, undefined);
        }
    }

    getBpmnDiagramHandler(identifier: string) {
        return this.getManager(identifier).bpmnHandler;
    }
    getProcessInstanceHandlerService(identifier: string) {
        return this.getManager(identifier).processInstanceHandler;
    }
    getBpmnManager(identifier: string) {
        return this.getManager(identifier);
    }
    private getManager(identifier: string) {
        const foundManager = this.diagrams().get(identifier);
        if (!foundManager) {
            //case not found for identifier, create one
            return this.addBpmnManager(identifier);
        }
        return foundManager;
    }
}

export const WORKFLOWS_BPMN_IDENTIFIER = 'workflows';
export const PROCESS_BRIDGE_BPMN_IDENTIFIER = 'process_bridge';
export const DASHBOARD_BPMN_IDENTIFIER = 'dashboard';
export const DASHBOARD_BPMN_TICKET_IDENTIFIER = DASHBOARD_BPMN_IDENTIFIER + '_TICKET';
export const DASHBOARD_BPMN_TICKET_PROC_DEF_IDENTIFIER = DASHBOARD_BPMN_IDENTIFIER + '_PROCESS_DEFINITION';
