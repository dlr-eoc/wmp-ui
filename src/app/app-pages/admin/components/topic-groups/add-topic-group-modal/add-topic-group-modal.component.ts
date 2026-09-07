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

import {Component, inject, Input, OnChanges, SimpleChanges, output, model, input} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {TopicGroupDto} from 'src/app/shared/services/wmp-api/models/TopicGroupDto';
import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';
import {ConfirmCancelDialogComponent} from 'src/app/shared/components/dialog/confirm-cancel-dialog/confirm-cancel-dialog.component';
import {InputNumber} from 'primeng/inputnumber';
import {InputText} from 'primeng/inputtext';
import {Select} from 'primeng/select';
import {AlertService, WmpAlertType} from 'src/app/shared/services/alert.service';

@Component({
    selector: 'app-add-topic-group-modal',
    templateUrl: './add-topic-group-modal.component.html',
    styleUrls: ['./add-topic-group-modal.component.scss'],
    imports: [ReactiveFormsModule, ConfirmCancelDialogComponent, InputNumber, InputText, Select],
})
export class AddTopicGroupModalComponent {
    private readonly api = inject(WmpApiService);
    private readonly alertService = inject(AlertService);

    readonly addModalOpen = model.required<boolean>();
    readonly addModalData = input.required<TopicGroupAddModalData>();
    public readonly openChange = output<boolean>();

    readonly form = new FormGroup({
        name: new FormControl('', Validators.required),
        numWorkers: new FormControl(0, Validators.required),
        lockTimeDuration: new FormControl('', Validators.required),
        execution: new FormControl('', Validators.required),
        retryCycle: new FormControl('', Validators.required),
    });

    onModalClosed() : void{
        this.form.reset();
    }

    async clickedConfirmAdd() {
        await this.onSubmit();
    }

    async onSubmit() {
        if (this.form.invalid) {
            this.form.markAsTouched();
            this.form.markAllAsDirty();
        } else {
            const newTopicGroup: TopicGroupDto = {
                name: this.form.value.name,
                numWorkers: this.form.value.numWorkers,
                topics: [],
                lockTimeDuration: this.form.value.lockTimeDuration,
                execution: this.form.value.execution,
                retries: undefined,
                retryCycle: this.form.value.retryCycle,
            };

            try {
                await this.api.createTopicGroup(newTopicGroup);
                this.addModalOpen.set(false);
                this.openChange.emit(false);
            } catch (e: any) {
                this.alertService.addAlert({text: e?.error?.message, type: WmpAlertType.ERROR});
            }
        }
    }
}
export interface TopicGroupAddModalData {
    executions: string[];
}
