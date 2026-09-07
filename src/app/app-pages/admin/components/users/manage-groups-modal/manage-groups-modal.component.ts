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
import {GroupService} from "src/app/shared/services/camunda-api";
import {lastValueFrom} from "rxjs";
import {ClrAlertModule, ClrCheckboxModule, ClrCommonFormsModule, ClrModalModule} from "@clr/angular";

@Component({
    selector: "app-manage-groups-modal",
    templateUrl: "./manage-groups-modal.component.html",
    styleUrls: ["./manage-groups-modal.component.scss"],
    imports: [ClrModalModule, ClrAlertModule, ClrCheckboxModule, ClrCommonFormsModule],
})
export class ManageGroupsModalComponent {
    private groupService = inject(GroupService);

    @Input({required: true}) public open!: boolean;
    public readonly openChange = output<boolean>();

    @Input({required: true}) public data!: UserToGroupModalData;

    alertText: string = "";
    alertClosed: boolean = true;

    addGroups: string[] = [];
    deleteGroups: string[] = [];

    onChange(event: any) {
        // This logic handles what group changes have to be performed on press of the update button.
        // Entries, that were initially checked, will add an entry to deleteGroups on unchecking,
        // the others will be added to addGroups. If the checkbox is rechecked/reunchecked, this entry is removed.
        if (event.target.checked) {
            const index = this.deleteGroups.indexOf(event.target.name);
            if (index > -1) {
                this.deleteGroups.splice(index, 1);
            } else {
                this.addGroups.push(event.target.name);
            }
        } else {
            const index = this.addGroups.indexOf(event.target.name);
            if (index > -1) {
                this.addGroups.splice(index, 1);
            } else {
                this.deleteGroups.push(event.target.name);
            }
        }
    }

    async onSubmit() {
        let success = true;

        for (let group of this.addGroups) {
            await lastValueFrom(this.groupService.createGroupMember(group, this.data.userId)).catch(() => {
                success = false;
                this.alertText =
                    "Could not add user " +
                    this.data.userId +
                    " to group " +
                    group +
                    ". Please consult your administrator for more context.";
                this.alertClosed = false;
            });
        }

        if (success) {
            for (let group of this.deleteGroups) {
                await lastValueFrom(this.groupService.deleteGroupMember(group, this.data.userId)).catch(
                    () => {
                        success = false;
                        this.alertText =
                            "Could not remove user " +
                            this.data.userId +
                            " from group " +
                            group +
                            ". Please consult your administrator for more context.";
                        this.alertClosed = false;
                    },
                );
            }
        }

        if (success) {
            this.open = false;
            this.openChange.emit(false);
        }
    }
}

export interface UserToGroupModalData {
    userId: string;
    groups: GroupModalDto[];
}

export interface GroupModalDto {
    id?: string | null;
    name?: string | null;
    type?: string | null;
    value?: boolean | null;
}
