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

import {Component, inject, OnInit, signal} from '@angular/core';
import {ClrConditionalModule, ClrDatagridModule, ClrDatagridSortOrder, ClrIconModule} from '@clr/angular';
import {ExecutionDto} from 'src/app/shared/services/wmp-api/models/ExecutionDto';
import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';
import {JsonPipe, KeyValuePipe} from '@angular/common';
import {AddExecutionModalComponent} from 'src/app/app-pages/admin/components/executions/add-execution-modal/add-execution-modal.component';
import {EditExecutionModalComponent} from 'src/app/app-pages/admin/components/executions/edit-execution-modal/edit-execution-modal.component';
import {ConfirmCancelDialogComponent} from 'src/app/shared/components/dialog/confirm-cancel-dialog/confirm-cancel-dialog.component';

@Component({
    selector: 'app-executions',
    templateUrl: './executions.component.html',
    styleUrls: ['./executions.component.scss'],
    imports: [
        ClrDatagridModule,
        ClrIconModule,
        ClrConditionalModule,
        AddExecutionModalComponent,
        EditExecutionModalComponent,
        JsonPipe,
        KeyValuePipe,
        ConfirmCancelDialogComponent,
    ],
})
export class ExecutionsComponent implements OnInit {
    private api = inject(WmpApiService);

    // tableData
    tableEntries: ExecutionDto[] = [];
    selectedEntries: ExecutionDto[] = [];
    loading: boolean = false;
    initializeFinished: boolean = false;

    currentPage: number = 1;
    currentPageSize: number = 10;
    currentSort: string = '';
    currentSortOrder: ClrDatagridSortOrder = ClrDatagridSortOrder.UNSORTED;
    totalEntries: number = 0;

    // Confirmation dialog
    executionsDeletionConfirmationModalOpen = signal<boolean>(false);
    executionsDeletionConfirmationEntries = signal<ExecutionDto[] | undefined>(undefined);
    clearSelectedAfterDeletionConfirmation: boolean = false;

    // Add Execution dialog
    addExecutionModalOpen: boolean = false;

    // Edit Execution dialog
    editExecutionModalOpen: boolean = false;
    editExecutionModalData?: any = {};

    async ngOnInit() {
        this.updatePageData();
    }

    async updatePageData() {
        this.tableEntries = await this.api.getExecutions();
    }

    public async waitAndRefreshPage() {
        await new Promise((f) => setTimeout(f, 200));
        this.updatePageData();
    }

    async addNewExecution() {
        this.addExecutionModalOpen = true;
    }

    async editExecution(execution: ExecutionDto) {
        this.editExecutionModalData = execution;
        this.editExecutionModalOpen = true;
    }

    deleteSelectedExecutions() {
        this.executionsDeletionConfirmationModalOpen.set(true);
        this.executionsDeletionConfirmationEntries.set([...this.selectedEntries]);
        this.clearSelectedAfterDeletionConfirmation = true;
    }

    deleteSingleExecution(execution: ExecutionDto) {
        this.executionsDeletionConfirmationModalOpen.set(true);
        this.executionsDeletionConfirmationEntries.set([execution]);
        this.clearSelectedAfterDeletionConfirmation = false;
    }

    async onConfirmExecutionDeletion(executions: ExecutionDto[] | undefined) {
        if (!executions) return;

        for (let entry of executions) {
            if (entry.name) {
                await this.api.deleteExecution(entry.name);
            }
        }
        await new Promise((f) => setTimeout(f, 200));
        this.updatePageData();

        this.executionsDeletionConfirmationModalOpen.set(false);

        if (this.clearSelectedAfterDeletionConfirmation) {
            this.selectedEntries = [];
        }
    }
}
