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

import {Component, input, output, TemplateRef, WritableSignal} from '@angular/core';
import {Button} from 'primeng/button';
import {BaseDialogComponent} from 'src/app/shared/components/dialog/base-dialog/base-dialog.component';
import {NgTemplateOutlet} from '@angular/common';

@Component({
    selector: 'app-confirm-cancel-dialog',
    imports: [Button, BaseDialogComponent, NgTemplateOutlet],
    templateUrl: './confirm-cancel-dialog.component.html',
    styleUrl: './confirm-cancel-dialog.component.scss',
})
export class ConfirmCancelDialogComponent {
    title = input.required<string>();
    visibleInputSignal = input.required<WritableSignal<boolean>>();
    dialogAdditionalContent = input<TemplateRef<any> | null>(null);
    clickedConfirm = output();
    onDialogShown = output();
    onDialogHide = output();

    description = input<string | undefined>(undefined);
    labelConfirm = input<string>('Ok');

    flex = input<boolean>(false);
}
