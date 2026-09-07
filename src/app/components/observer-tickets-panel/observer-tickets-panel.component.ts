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

import {Component, computed, inject, input, OnDestroy, OnInit, signal} from '@angular/core';
import {ObserverTicketsComponent} from 'src/app/components/observer-tickets-panel/observer-tickets/observer-tickets.component';
import {Divider} from 'primeng/divider';
import {ObserverBpmnResolveComponent} from 'src/app/components/observer-tickets-panel/observer-tickets/observer-bpmn-resolve/observer-bpmn-resolve.component';
import {BpmnDiagramContainerComponent} from 'src/app/shared/components/bpmn-diagram/bpmn-diagram-container.component';
import {WorkflowFilterSelectionGroupComponent} from 'src/app/shared/components/workflow/workflow-filter-selection-group/workflow-filter-selection-group.component';
import {ObserverTicketsService} from 'src/app/components/observer-tickets-panel/observer-tickets/service/observer-tickets.service';
import {WorkflowFilter} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {BpmnManager} from 'src/app/shared/services/bpmn/bpmn-manager';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';

@Component({
    selector: 'app-observer-tickets-panel',
    imports: [
        ObserverTicketsComponent,
        Divider,
        ObserverBpmnResolveComponent,
        BpmnDiagramContainerComponent,
        WorkflowFilterSelectionGroupComponent,
    ],
    templateUrl: './observer-tickets-panel.component.html',
    styleUrl: './observer-tickets-panel.component.scss',
})
export class ObserverTicketsPanelComponent extends AsyncDestroyable implements OnInit, OnDestroy {
    private observerTicketsService = inject(ObserverTicketsService);

    $bpmnManagerTicketProcessInstance = input.required<BpmnManager>();
    readonly bpmnDiagramTicketHandlerService = computed(() => {
        return this.$bpmnManagerTicketProcessInstance().bpmnHandler;
    });

    _$filter = signal<WorkflowFilter | undefined>(undefined);

    $selectedTask = this.observerTicketsService.$selectedTask;

    constructor() {
        super();
    }

    ngOnDestroy(): void {
        super.destroy();
    }
    ngOnInit(): void {
        this.subscribeWithDestroyHandler(
            this.bpmnDiagramTicketHandlerService().workflowFilterService.filter$,
            (filter) => {
                this._$filter.set(filter);
            },
        );
    }
}
