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
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {UserDto, UserService} from "src/app/shared/services/camunda-api";
import {fieldMatchValidator} from "src/app/shared/validators/field-match.validator";
import {
    ClrAlertModule,
    ClrCommonFormsModule,
    ClrInputModule,
    ClrModalModule,
    ClrPasswordModule,
} from "@clr/angular";

@Component({
    selector: "app-add-user-modal",
    templateUrl: "./add-user-modal.component.html",
    styleUrls: ["./add-user-modal.component.scss"],
    imports: [
        ClrModalModule,
        ClrAlertModule,
        FormsModule,
        ClrCommonFormsModule,
        ReactiveFormsModule,
        ClrInputModule,
        ClrPasswordModule,
    ],
})
export class AddUserModalComponent {
    private userService = inject(UserService);

    @Input({required: true}) public open!: boolean;
    public readonly openChange = output<boolean>();

    form = new FormGroup({
        id: new FormControl("", Validators.required),
        firstName: new FormControl("", Validators.required),
        lastName: new FormControl("", Validators.required),
        email: new FormControl(""),
        password: new FormControl("", Validators.required),
        repeatPassword: new FormControl("", [Validators.required, fieldMatchValidator("password")]),
    });

    alertText: string = "";
    alertClosed: boolean = true;

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAsTouched();
        } else {
            const newUser: UserDto = {
                credentials: {password: this.form.value.password},
                profile: {
                    id: this.form.value.id,
                    firstName: this.form.value.firstName,
                    lastName: this.form.value.lastName,
                    email: this.form.value.email,
                },
            };

            this.userService.createUser(newUser).subscribe(
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
