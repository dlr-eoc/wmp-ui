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

import {Component, inject, Input, output} from "@angular/core";
import {
    TopicGroupComponentEntry,
    TopicGroupsComponent,
} from "src/app/app-pages/admin/components/topic-groups/topic-groups.component";
import {WmpApiService} from "src/app/shared/services/wmp-api/wmp-api.service";
import {ClrAlertModule, ClrComboboxModule, ClrCommonFormsModule, ClrModalModule} from "@clr/angular";
import {FormsModule} from "@angular/forms";

@Component({
    selector: "app-change-group-modal",
    templateUrl: "./change-group-modal.component.html",
    styleUrls: ["./change-group-modal.component.scss"],
    imports: [ClrModalModule, ClrAlertModule, ClrComboboxModule, ClrCommonFormsModule, FormsModule],
})
export class ChangeGroupModalComponent {
    private api = inject(WmpApiService);

    @Input({required: true}) public open!: boolean;
    public readonly openChange = output<boolean>();

    @Input({required: true}) public data!: ChangeGroupModalData;

    selectedTopicGroup: any = undefined;

    alertText: string = "";
    alertClosed: boolean = true;

    async onSubmit() {
        if (this.selectedTopicGroup === undefined) {
            this.alertText = "Please select a new topic group for the topic!";
            this.alertClosed = false;
            return;
        }

        try {
            await this.api.moveTopicToGroup(
                this.data.topicName,
                this.selectedTopicGroup.name === TopicGroupsComponent.REMOVE_FROM_GROUPS
                    ? ""
                    : this.selectedTopicGroup.name,
            );
            this.open = false;
            this.openChange.emit(false);
        } catch (e: any) {
            this.alertText = e.error.message;
            this.alertClosed = false;
        }
    }
}

export interface ChangeGroupModalData {
    topicName: string;
    topicGroups: TopicGroupComponentEntry[];
}
