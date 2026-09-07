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

import {Component, input, OnDestroy, OnInit, output, WritableSignal} from '@angular/core';
import {ConfirmCancelDialogComponent} from 'src/app/shared/components/dialog/confirm-cancel-dialog/confirm-cancel-dialog.component';
import {BpmnDiagramContainerComponent} from 'src/app/shared/components/bpmn-diagram/bpmn-diagram-container.component';
import {BpmnManager} from 'src/app/shared/services/bpmn/bpmn-manager';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {WorkflowFilter} from 'src/app/components/workflow-page/service/WorkflowFilterServiceBase';
import {Observable} from 'rxjs';

/**
 *
 */
@Component({
    selector: 'app-bpmn-modal',
    imports: [ConfirmCancelDialogComponent, BpmnDiagramContainerComponent],
    templateUrl: './bpmn-modal.component.html',
    styleUrl: './bpmn-modal.component.scss',
})
export class BpmnModalComponent extends AsyncDestroyable implements OnInit, OnDestroy {
    readonly visibleInput = input.required<WritableSignal<boolean>>();
    readonly title = input.required<string>();
    /**
     * The bpmnManager to use for bpmn handling. Inside the modal the manager will be used readonly.
     * Change filter in parent.
     */
    readonly bpmnManager = input.required<BpmnManager>();
    readonly workflowFilterToListen = input.required<Observable<WorkflowFilter | undefined>>();
    readonly labelConfirm = input<string>('Ok');
    readonly description = input<string>();
    readonly clickedConfirm = output();
    readonly clickedCancel = output();

    ngOnInit(): void {
        this.subscribeWithDestroyHandler(this.workflowFilterToListen(), (filter) => {
            if (filter?.shouldUpdate) {
                //listening on processInstance filter, the process definition also stored on selection - use for modal
                this.bpmnManager().bpmnHandler.workflowFilterService.mergeFilterAndUpdate({
                    processDefinition: filter?.processDefinition,
                });
            }
        });
    }

    ngOnDestroy(): void {
        this.bpmnManager().changeVisible(false);
        super.destroy();
    }

    protected handleDialogShown() {
        this.bpmnManager().changeVisible(true);
        //after dialog visible - zoom home after visible, otherwise errors will occur
        this.bpmnManager().bpmnHandler.bpmnDiagramService.zoomHome();
    }

    protected handleHide() {
        this.bpmnManager().changeVisible(false);
    }

    protected handleClicked() {
        this.bpmnManager().changeVisible(false);
        this.clickedConfirm.emit();
    }
}
