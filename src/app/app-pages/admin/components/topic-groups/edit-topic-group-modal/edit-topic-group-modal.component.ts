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

import {Component, computed, inject, input, model, OnChanges, output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {TopicGroupDto} from 'src/app/shared/services/wmp-api/models/TopicGroupDto';
import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';
import {ConfirmCancelDialogComponent} from 'src/app/shared/components/dialog/confirm-cancel-dialog/confirm-cancel-dialog.component';
import {InputTextModule} from 'primeng/inputtext';
import {InputNumberModule} from 'primeng/inputnumber';
import {SelectModule} from 'primeng/select';
import {AlertService, WmpAlertType} from 'src/app/shared/services/alert.service';

@Component({
    selector: 'app-edit-topic-group-modal',
    templateUrl: './edit-topic-group-modal.component.html',
    styleUrls: ['./edit-topic-group-modal.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        ConfirmCancelDialogComponent,
        InputTextModule,
        InputNumberModule,
        SelectModule,
    ],
})
export class EditTopicGroupModalComponent {
    private readonly api = inject(WmpApiService);
    private readonly alertService = inject(AlertService);

    readonly editModalOpen = model.required<boolean>();
    readonly editModalData = input.required<TopicGroupEditModalData>();
    public readonly openChange = output<boolean>();

    readonly $form = computed<FormGroup>(() => {
        return new FormGroup({
            name: new FormControl(this.editModalData().topicGroup.name || '', Validators.required),
            numWorkers: new FormControl(this.editModalData().topicGroup.numWorkers || 0, Validators.required),
            lockTimeDuration: new FormControl(
                this.editModalData().topicGroup.lockTimeDuration || '',
                Validators.required,
            ),
            retries: new FormControl(this.editModalData().topicGroup.retries || 0),
            execution: new FormControl(this.editModalData().topicGroup.execution || '', Validators.required),
            retryCycle: new FormControl(
                this.editModalData().topicGroup.retryCycle || '',
                Validators.required,
            ),
        });
    });

    async clickedConfirmEdit() {
        await this.onSubmit();
    }

    async onSubmit() {
        if (this.$form().invalid) {
            this.$form().markAsTouched();
            this.$form().markAllAsDirty();
        } else {
            const updatedTopicGroup: TopicGroupDto = {
                name: this.$form().value.name,
                numWorkers: this.$form().value.numWorkers,
                lockTimeDuration: this.$form().value.lockTimeDuration,
                retries: this.$form().value.retries,
                execution: this.$form().value.execution,
                topics: this.editModalData().topicGroup.topics,
                retryCycle: this.$form().value.retryCycle,
            };

            try {
                await this.api.updateTopicGroup(
                    this.editModalData().topicGroup.name || '',
                    updatedTopicGroup,
                );
                this.editModalOpen.set(false);
                this.openChange.emit(false);
            } catch (e: any) {
                this.alertService.addAlert({text: e?.error?.message, type: WmpAlertType.ERROR});
            }
        }
    }
}

export interface TopicGroupEditModalData {
    topicGroup: TopicGroupDto;
    executions: string[];
}
