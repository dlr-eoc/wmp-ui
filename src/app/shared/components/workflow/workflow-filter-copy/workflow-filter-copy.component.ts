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

import {Component, input, OnDestroy, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Button} from 'primeng/button';
import {CdkCopyToClipboard} from '@angular/cdk/clipboard';
import {Tooltip} from 'primeng/tooltip';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
type ButtonSeverity =
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'help'
    | 'primary'
    | 'secondary'
    | 'contrast'
    | null
    | undefined;
@Component({
    selector: 'app-workflow-filter-copy',
    imports: [Button, CdkCopyToClipboard, Tooltip],
    templateUrl: './workflow-filter-copy.component.html',
    styleUrl: './workflow-filter-copy.component.scss',
})
export class WorkflowFilterCopyComponent extends AsyncDestroyable implements OnDestroy, OnInit {
    workflowFilterLink$ = input.required<Observable<string | undefined>>();
    severity = input<ButtonSeverity | undefined>(undefined);
    variant = input<'outlined' | 'text' | undefined>('outlined');
    size = input<'small' | 'large' | undefined>(undefined);
    style = input<{[p: string]: any} | null | undefined>(undefined);
    toolTipText = input<string | undefined>(undefined);

    workflowFilterLink: string | undefined = undefined;

    constructor() {
        super();
    }
    ngOnDestroy(): void {
        super.destroy();
    }
    ngOnInit(): void {
        this.subscribeWithDestroyHandler(this.workflowFilterLink$(), (value) => {
            this.workflowFilterLink = value;
        });
    }
}
