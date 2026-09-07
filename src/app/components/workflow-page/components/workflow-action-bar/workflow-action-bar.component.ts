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

import {Component, inject, OnDestroy, signal} from '@angular/core';
import {ClrIconModule} from '@clr/angular';
import {Button} from 'primeng/button';
import {ButtonGroup} from 'primeng/buttongroup';
import {
    ICON_HISTORY_ACTIVITY_PRIME,
    ICON_RELOAD_DATA_PRIME,
    ICON_RESTART_DEFINITION_PRIME,
    ICON_SUSPEND_DEFINITION_PRIME,
    ICON_TERMINATE_DEFINITION_PRIME,
    ICON_UNSUSPEND_DEFINITION_PRIME,
} from 'src/app/shared/components/p/icon/IconConstants';
import {ConfirmCancelDialogComponent} from 'src/app/shared/components/dialog/confirm-cancel-dialog/confirm-cancel-dialog.component';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {HistoricProcessInstance} from 'src/app/components/workflow-page/models/HistoricProcessInstance';
import {JobChangeDialogComponent} from 'src/app/components/workflow-page/components/dialog/job-change-dialog/job-change-dialog.component';
import {
    allJobSelectionsTerminateAble,
    checkJobsCanBeSuspended,
    checkJobsCanBeUnsuspended,
} from 'src/app/utils/bpmn/job.utils';
import {WorkflowDataService} from 'src/app/app-pages/workflow-page/service/workflow-data.service';
import {LengthPipe} from 'src/app/shared/pipes/length.pipe';

@Component({
    selector: 'app-workflow-action-bar',
    imports: [
        ClrIconModule,
        Button,
        ButtonGroup,
        ConfirmCancelDialogComponent,
        JobChangeDialogComponent,
        LengthPipe,
    ],
    templateUrl: './workflow-action-bar.component.html',
    styleUrl: './workflow-action-bar.component.scss',
})
export class WorkflowActionBarComponent extends AsyncDestroyable implements OnDestroy {
    private workflowService = inject(WorkflowDataService);

    visibleRetryDialog = signal<boolean>(false);
    visibleTerminateDialog = signal<boolean>(false);
    visibleSuspendDialog = signal<boolean>(false);
    visibleUnSuspendDialog = signal<boolean>(false);

    selectedEntries: HistoricProcessInstance[] = [];

    constructor() {
        super();

        this.subscribeWithDestroyHandler(
            this.workflowService.selectedProcessInstances$,
            (processInstances) => (this.selectedEntries = processInstances),
        );
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    updatePageDataWithCurrentFilter() {
        this.workflowService.startRefreshPageDataWithCurrentFilter();
    }

    checkJobsCanBeUnsuspended() {
        return checkJobsCanBeUnsuspended(this.selectedEntries);
    }

    checkJobsCanBeSuspended() {
        return checkJobsCanBeSuspended(this.selectedEntries);
    }

    checkJobsCanBeTerminated() {
        return allJobSelectionsTerminateAble(this.selectedEntries);
    }

    restartSelectedJobs() {
        this.visibleRetryDialog.set(false);
        this.workflowService.restartSelectedJobs();
    }

    terminateJobs() {
        this.visibleTerminateDialog.set(false);
        this.workflowService.terminateSelectedJobs();
    }

    suspendJobs() {
        this.visibleSuspendDialog.set(false);
        this.workflowService.suspendJobs(true);
    }

    unSuspendJobs() {
        this.visibleUnSuspendDialog.set(false);
        this.workflowService.suspendJobs(false);
    }

    protected readonly ICON_UNSUSPEND_DEFINITION_PRIME = ICON_UNSUSPEND_DEFINITION_PRIME;
    protected readonly ICON_SUSPEND_DEFINITION_PRIME = ICON_SUSPEND_DEFINITION_PRIME;
    protected readonly ICON_RESTART_DEFINITION_PRIME = ICON_RESTART_DEFINITION_PRIME;
    protected readonly ICON_RELOAD_DATA_PRIME = ICON_RELOAD_DATA_PRIME;
    protected readonly ICON_TERMINATE_DEFINITION_PRIME = ICON_TERMINATE_DEFINITION_PRIME;
    protected readonly ICON_HISTORY_ACTIVITY_PRIME = ICON_HISTORY_ACTIVITY_PRIME;
}
