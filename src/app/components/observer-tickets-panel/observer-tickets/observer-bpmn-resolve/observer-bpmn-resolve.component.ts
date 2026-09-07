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

import {Component, inject, input, OnDestroy, OnInit, signal} from '@angular/core';
import {BpmnHandlerService} from 'src/app/shared/services/bpmn/bpmn-handler.service';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {WorkflowFilter} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {Button} from 'primeng/button';
import {ButtonGroup} from 'primeng/buttongroup';
import {Tooltip} from 'primeng/tooltip';
import {ObserverTicketsService} from 'src/app/components/observer-tickets-panel/observer-tickets/service/observer-tickets.service';
import {TicketResolveDialogComponent} from 'src/app/components/observer-tickets-panel/observer-tickets/ticket-resolve-dialog/ticket-resolve-dialog.component';
import {Divider} from 'primeng/divider';
import {BpmnModalComponent} from 'src/app/shared/components/bpmn-modal/bpmn-modal.component';
import {
    BpmnManagerService,
    DASHBOARD_BPMN_TICKET_PROC_DEF_IDENTIFIER,
} from 'src/app/shared/services/bpmn/bpmn-manager.service';

@Component({
    selector: 'app-observer-bpmn-resolve',
    imports: [Button, ButtonGroup, Tooltip, TicketResolveDialogComponent, Divider, BpmnModalComponent],
    templateUrl: './observer-bpmn-resolve.component.html',
    styleUrl: './observer-bpmn-resolve.component.scss',
})
export class ObserverBpmnResolveComponent extends AsyncDestroyable implements OnInit, OnDestroy {
    readonly _$bpmnHandlerServiceProcessInstance = input.required<BpmnHandlerService>();

    readonly observerTicketsService = inject(ObserverTicketsService);
    readonly _$filter = signal<WorkflowFilter | undefined>(undefined);
    readonly _$processDefinitionModelOpen = signal<boolean>(false);

    readonly bpmnManagerTicketProcessDefinition = inject(BpmnManagerService).getBpmnManager(
        DASHBOARD_BPMN_TICKET_PROC_DEF_IDENTIFIER,
    );

    constructor() {
        super();
    }

    ngOnInit(): void {
        this.subscribeWithDestroyHandler(
            this._$bpmnHandlerServiceProcessInstance().workflowFilterService.filter$,
            (filter) => {
                this._$filter.set(filter);
            },
        );
    }
    ngOnDestroy(): void {
        super.destroy();
    }

    protected handleResolve() {
        this.observerTicketsService.handleResolveFromTask(this._$bpmnHandlerServiceProcessInstance());
    }

    protected handleClickSendToSupervisor() {
        this.observerTicketsService.sendToSupervisor();
    }

    protected handleViewProcessDefinition() {
        this._$processDefinitionModelOpen.set(true);
    }
}
