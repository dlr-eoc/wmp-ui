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
import {ExecutionDto} from "src/app/shared/services/wmp-api/models/ExecutionDto";
import {WmpApiService} from "src/app/shared/services/wmp-api/wmp-api.service";
import {
    ClrAlertModule,
    ClrCheckboxModule,
    ClrCommonFormsModule,
    ClrDatagridModule,
    ClrInputModule,
    ClrModalModule,
} from "@clr/angular";

@Component({
    selector: "app-add-execution-modal",
    templateUrl: "./add-execution-modal.component.html",
    styleUrls: ["./add-execution-modal.component.scss"],
    imports: [
        ClrModalModule,
        ClrAlertModule,
        FormsModule,
        ClrCommonFormsModule,
        ReactiveFormsModule,
        ClrInputModule,
        ClrCheckboxModule,
        ClrDatagridModule,
    ],
})
export class AddExecutionModalComponent {
    private api = inject(WmpApiService);

    @Input({required: true}) public open!: boolean;
    public readonly openChange = output<boolean>();

    additionalElements: AdditionalElement[] = [];
    key: string = "";
    value: string = "";

    form = new FormGroup({
        name: new FormControl("", Validators.required),
        className: new FormControl("", Validators.required),
        enabled: new FormControl(false, Validators.required),
    });

    alertText: string = "";
    alertClosed: boolean = true;

    async onSubmit() {
        if (this.form.invalid) {
            this.form.markAsTouched();
        } else {
            let additionalElements = {} as any;
            for (let element of this.additionalElements) {
                let value: any = element.value;
                if (element.value === "true") {
                    value = true;
                }
                if (element.value === "false") {
                    value = false;
                }
                if (!isNaN(+element.value)) {
                    value = Number(value);
                }

                additionalElements[element.key] = value;
            }

            const newExecution: ExecutionDto = {
                name: this.form.value.name,
                className: this.form.value.className,
                enabled: this.form.value.enabled,
                additionalElements: additionalElements,
            };

            try {
                await this.api.createExecution(newExecution);
                this.open = false;
                this.openChange.emit(false);
            } catch (e: any) {
                this.alertText = e.error.message;
                this.alertClosed = false;
            }
        }
    }

    addEntry() {
        this.additionalElements.push({key: this.key, value: this.value});
        this.key = "";
        this.value = "";
    }

    deleteEntry(element: AdditionalElement) {
        this.additionalElements = this.additionalElements.filter((e) => e.key !== element.key);
    }
}

export interface AdditionalElement {
    key: string;
    value: string;
}
