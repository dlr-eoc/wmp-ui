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

import {Component, inject, Input, OnChanges, SimpleChanges, output} from "@angular/core";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {UserProfileDto, UserService} from "src/app/shared/services/camunda-api";
import {ClrAlertModule, ClrCommonFormsModule, ClrInputModule, ClrModalModule} from "@clr/angular";

@Component({
    selector: "app-edit-user-modal",
    templateUrl: "./edit-user-modal.component.html",
    styleUrls: ["./edit-user-modal.component.scss"],
    imports: [
        ClrModalModule,
        ClrAlertModule,
        FormsModule,
        ClrCommonFormsModule,
        ReactiveFormsModule,
        ClrInputModule,
    ],
})
export class EditUserModalComponent implements OnChanges {
    private userService = inject(UserService);

    @Input({required: true}) public open!: boolean;
    @Input({required: true}) public user!: UserProfileDto;
    public readonly openChange = output<boolean>();

    form = new FormGroup({
        firstName: new FormControl("", Validators.required),
        lastName: new FormControl("", Validators.required),
        email: new FormControl(""),
    });

    alertText: string = "";
    alertClosed: boolean = true;

    ngOnChanges(changes: SimpleChanges) {
        for (const propName in changes) {
            if (propName === "user") {
                this.form.setValue({
                    firstName: this.user.firstName || "",
                    lastName: this.user.lastName || "",
                    email: this.user.email || "",
                });
            }
        }
    }

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAsTouched();
        } else {
            const newUserProfile: UserProfileDto = {
                id: this.user.id,
                firstName: this.form.value.firstName,
                lastName: this.form.value.lastName,
                email: this.form.value.email,
            };

            this.userService.updateProfile(this.user.id || "", newUserProfile).subscribe(
                (_result) => {
                    this.open = false;
                    this.openChange.emit(false);
                },
                (error) => {
                    this.alertText = error.error.message;
                    this.alertClosed = false;
                },
            );
        }
    }
}
