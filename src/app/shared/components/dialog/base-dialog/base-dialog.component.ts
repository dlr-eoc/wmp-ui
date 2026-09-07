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
import {Dialog} from 'primeng/dialog';
import {NgTemplateOutlet} from '@angular/common';

@Component({
    selector: 'app-base-dialog',
    imports: [Dialog, NgTemplateOutlet],
    templateUrl: './base-dialog.component.html',
    styleUrl: './base-dialog.component.scss',
})
/**
 *  Assure to correctly link different components of the dialog.
 *  <br> See {@link https://angular.dev/guide/templates/ng-template#rendering-a-template-fragment}
 *  <br> or {@link https://angular.dev/guide/templates/ng-template#getting-a-reference-to-a-template-fragment}
 *
 *  <br><br>
 *  <br>
 *  Example usage in {@link ConfirmCancelDialogComponent}:
 *  ```
 *  <ng-template #dialogContentTemplate>
 *         <span>{{ description() }}</span>
 *         <ng-container [ngTemplateOutlet]="dialogAdditionalContent()" />
 *     </ng-template>
 *     <ng-template #dialogFooterTemplate>
 *         <p-button
 *             label="Cancel"
 *             [text]="true"
 *             severity="secondary"
 *             (click)="this.visibleInputSignal().set(false)"
 *         />
 *         <p-button
 *             [label]="labelConfirm()"
 *             [outlined]="true"
 *             severity="secondary"
 *             (click)="this.onClickConfirm()" - parent of cancel setting visible to false later
 *         />
 *  </ng-template>
 *  ```
 */
export class BaseDialogComponent {
    dialogContentTemplate = input.required<TemplateRef<any>>();
    dialogFooterTemplate = input.required<TemplateRef<any>>();
    //dialog visible WritableSignal input from parent component, used to control dialog visible or not
    //read value with ()() -> boolean;
    visibleInputSignal = input.required<WritableSignal<boolean>>();
    title = input<string>();
    flex = input<boolean>(false);
    onDialogShown = output();
    onDialogHide = output();

    handleVisibleChange(visibleChanged: boolean) {
        if (!visibleChanged) {
            this.visibleInputSignal().set(false);
        }
    }
    protected handleShow(_event: any) {
        this.onDialogShown.emit();
    }

    protected handleHide(_event: any) {
        this.onDialogHide.emit();
    }
}
