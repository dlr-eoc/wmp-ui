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

import {Component, OnDestroy, OnInit, input} from "@angular/core";
import {DialogTextInputHandler} from "src/app/utils/DialogTextInputHandler";
import {AsyncDestroyable} from "src/app/utils/AsyncDestroyable";
import {ClrModalModule, ClrCommonFormsModule, ClrInputModule} from "@clr/angular";
import {FormsModule} from "@angular/forms";

@Component({
    selector: "text-input-dialog",
    templateUrl: "./text-input-dialog.component.html",
    imports: [ClrModalModule, FormsModule, ClrCommonFormsModule, ClrInputModule],
})
export class TextInputDialogComponent extends AsyncDestroyable implements OnInit, OnDestroy {
    readonly dialogTextInputHandler = input.required<DialogTextInputHandler>();
    readonly title = input<string>("");
    readonly text = input<string>();
    input = "";
    dialogOpen: boolean = false;

    ngOnInit(): void {
        //assure to subscribe after ngOnInit, because otherwise the inputs are still undefined
        this.subscribeWithDestroyHandler(this.dialogTextInputHandler().isDialogOpen, (isDialogOpen) => {
            this.dialogOpen = isDialogOpen;
        });
    }

    ngOnDestroy(): void {
        this.destroy();
    }
}
