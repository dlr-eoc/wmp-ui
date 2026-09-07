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

import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {TopicGroupDto} from 'src/app/shared/services/wmp-api/models/TopicGroupDto';
import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';
import {ChangeGroupModalData} from 'src/app/app-pages/admin/components/topic-groups/change-group-modal/change-group-modal.component';
import {AuthenticationService} from 'src/app/shared/services/user/authentication.service';
import {DialogTextInputHandler} from 'src/app/utils/DialogTextInputHandler';
import {preventClickEventPropagation} from 'src/app/utils/EventUtils';
import {ClrCheckboxModule, ClrCommonFormsModule, ClrIconModule, ClrStackViewModule} from '@clr/angular';

import {FormsModule} from '@angular/forms';
import {
    AddTopicGroupModalComponent,
    TopicGroupAddModalData,
} from './add-topic-group-modal/add-topic-group-modal.component';
import {
    EditTopicGroupModalComponent,
    TopicGroupEditModalData,
} from './edit-topic-group-modal/edit-topic-group-modal.component';
import {ChangeGroupModalComponent} from './change-group-modal/change-group-modal.component';
import {TextInputDialogComponent} from 'src/app/components/dialog/text-input-dialog.component';
import {ConfirmCancelDialogComponent} from 'src/app/shared/components/dialog/confirm-cancel-dialog/confirm-cancel-dialog.component';

@Component({
    selector: 'app-topic-groups',
    templateUrl: './topic-groups.component.html',
    styleUrls: ['./topic-groups.component.scss'],
    imports: [
        ClrStackViewModule,
        ClrIconModule,
        ClrCommonFormsModule,
        FormsModule,
        ClrCheckboxModule,
        ConfirmCancelDialogComponent,
        AddTopicGroupModalComponent,
        EditTopicGroupModalComponent,
        ChangeGroupModalComponent,
        TextInputDialogComponent,
    ],
})
export class TopicGroupsComponent implements OnInit, OnDestroy {
    private api = inject(WmpApiService);
    private authenticationService = inject(AuthenticationService);

    public static UNFOLD: string = 'Unfold all';
    public static FOLD: string = 'Fold all';

    public static REMOVE_FROM_GROUPS: string = 'Remove from groups';

    expandableText: string = TopicGroupsComponent.FOLD;

    // Page data
    topicGroups: TopicGroupComponentEntry[] = [];
    unassignedTopics: string[] = [];
    executions: string[] = [];

    // Confirmation dialog
    topicGroupDeletionConfirmationModalOpen = signal<boolean>(false);
    topicGroupDeletionConfirmationModalEntry = signal<TopicGroupComponentEntry | undefined>(undefined);

    // Add group dialog
    addGroupModalOpen = signal<boolean>(false);
    addGroupModalData = signal<TopicGroupAddModalData | undefined>(undefined);

    // Edit group dialog
    editGroupModalOpen = signal<boolean>(false);
    editGroupModalData = signal<TopicGroupEditModalData | undefined>(undefined);

    // Change group dialog
    changeGroupModalOpen: boolean = false;
    changeGroupData: ChangeGroupModalData = {topicName: '', topicGroups: []};

    textInputDialogHandler = new DialogTextInputHandler();

    ngOnInit(): void {
        this.updatePageData();
    }

    ngOnDestroy(): void {
        this.textInputDialogHandler.onDestroy();
    }

    async updatePageData() {
        let topicGroups = await this.api.getTopicGroups();
        let unassignedTopics = await this.api.getUnassignedTopics();

        this.executions = (await this.api.getExecutions()).map((execution) => execution.name || '');
        this.topicGroups = topicGroups.map((groupDto) => {
            return {
                ...groupDto,
                expanded: true,
            } as TopicGroupComponentEntry;
        });

        this.unassignedTopics = unassignedTopics;
    }

    public async waitAndRefreshPage() {
        await new Promise((f) => setTimeout(f, 200));
        this.updatePageData();
    }

    // Reload page content
    public onRefresh() {
        this.updatePageData();
    }

    public onCreateNewTopicGroup() {
        this.addGroupModalOpen.set(true);
        this.addGroupModalData.set({executions: this.executions});
    }

    // Functionality of the Unfold/Fold all button
    public switchExpandableState() {
        // Determine what to do
        let newState = false;
        let newText = TopicGroupsComponent.UNFOLD;
        for (let topicGroup of this.topicGroups) {
            if (!topicGroup.expanded) {
                newState = true;
                newText = TopicGroupsComponent.FOLD;
            }
        }

        for (let topicGroup of this.topicGroups) {
            topicGroup.expanded = newState;
        }
        this.expandableText = newText;
    }

    // Updates the label of the Unfold/Fold all button
    public updateSwitchLabel() {
        for (let topicGroup of this.topicGroups) {
            if (!topicGroup.expanded) {
                this.expandableText = TopicGroupsComponent.UNFOLD;
                return;
            }
        }

        this.expandableText = TopicGroupsComponent.FOLD;
    }

    public onEdit($event: any, topicGroup: TopicGroupDto) {
        preventClickEventPropagation($event);
        this.editGroupModalData.set({
            topicGroup: topicGroup,
            executions: this.executions,
        });
        this.editGroupModalOpen.set(true);
    }

    public onDelete($event: any, topicGroup: any) {
        preventClickEventPropagation($event);
        this.topicGroupDeletionConfirmationModalEntry.set(topicGroup);
        this.topicGroupDeletionConfirmationModalOpen.set(true);
    }

    public async onConfirmedTopicGroupDeletion(topicGroupToDelete: TopicGroupComponentEntry | undefined) {
        if (!topicGroupToDelete?.name) return;

        await this.api.deleteTopicGroup(topicGroupToDelete.name);
        await new Promise((f) => setTimeout(f, 200));
        this.updatePageData();

        this.topicGroupDeletionConfirmationModalOpen.set(false);
    }

    public onToggleChange($event: MouseEvent, topicGroup: any) {
        preventClickEventPropagation($event);
        this.textInputDialogHandler.openDialogAndHandleResult(async (_reasonOfToggle) => {
            const updatedTopicGroup = {...topicGroup, enabled: !topicGroup.enabled};
            const resultFromUpdateTopicGroup = await this.api.updateTopicGroup(
                topicGroup.name,
                updatedTopicGroup,
            );
            const user = this.authenticationService.getLoggedInUser();
            await this.updatePageData();
        });
    }

    public async changeGroup($event: any, topic: string) {
        preventClickEventPropagation($event);
        this.changeGroupData = {
            topicName: topic,
            topicGroups: [
                ...this.topicGroups,
                {name: TopicGroupsComponent.REMOVE_FROM_GROUPS, expanded: false},
            ],
        };

        this.changeGroupModalOpen = true;
    }
}

export interface TopicGroupComponentEntry extends TopicGroupDto {
    expanded: boolean;
}
