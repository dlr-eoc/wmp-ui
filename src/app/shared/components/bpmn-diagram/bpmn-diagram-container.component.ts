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

import {AfterContentInit, Component, input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {RouterLink} from '@angular/router';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {BpmnDiagramComponent} from 'src/app/shared/components/bpmn-diagram/bpmn-diagram/bpmn-diagram.component';
import {AsyncPipe} from '@angular/common';
import {FallbackPipe} from 'src/app/pipes/conversion.pipe';
import {BpmnDiagramService} from 'src/app/shared/services/bpmn/diagram/bpmn-diagram.service';
import {BpmnLabelService} from 'src/app/shared/services/bpmn/overlay/bpmn-label.service';
import {BpmnOverlayStorage} from 'src/app/shared/services/bpmn/overlay/storage/bpmn-overlay.storage';
import {BpmnDiagramContainerService} from 'src/app/shared/services/bpmn/container/bpmn-diagram-container.service';
import {Observable} from 'rxjs';
import {ButtonGroup} from 'primeng/buttongroup';
import {Button} from 'primeng/button';
import {WorkflowFilterCopyComponent} from 'src/app/shared/components/workflow/workflow-filter-copy/workflow-filter-copy.component';
import {BpmnManager} from 'src/app/shared/services/bpmn/bpmn-manager';

@Component({
    selector: 'app-bpmn-diagram-container',
    imports: [
        RouterLink,
        BpmnDiagramComponent,
        AsyncPipe,
        FallbackPipe,
        ButtonGroup,
        Button,
        WorkflowFilterCopyComponent,
    ],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './bpmn-diagram-container.component.html',
    styleUrl: './bpmn-diagram-container.component.scss',
})
export class BpmnDiagramContainerComponent
    extends AsyncDestroyable
    implements OnInit, AfterContentInit, OnDestroy
{
    readonly bpmnManager = input.required<BpmnManager>();
    protected bpmnDiagramService: BpmnDiagramService | undefined;
    private bpmnLabelService: BpmnLabelService | undefined;
    private bpmnOverlayStorageService: BpmnOverlayStorage | undefined;
    private bpmnDiagramContainerService: BpmnDiagramContainerService | undefined;

    diagramTitle: undefined | Observable<string>;
    requestId: undefined | Observable<string | undefined>;
    diagramVersion: undefined | Observable<number | undefined | null>;

    importDone: boolean = false;
    workflowFilterLink$: Observable<string | undefined> | undefined;

    overlayBpmnStyle = {zIndex: 999, background: 'rgb(255, 255, 255, 0.65)', backdropFilter: 'blur(2px)'};

    constructor() {
        super();
    }

    ngOnInit(): void {
        this.bpmnDiagramService = this.bpmnManager().bpmnHandler.bpmnDiagramService;
        this.bpmnLabelService = this.bpmnManager().bpmnHandler.bpmnLabelService;
        this.bpmnOverlayStorageService = this.bpmnManager().bpmnHandler.bpmnOverlayStorage;
        this.bpmnDiagramContainerService = this.bpmnManager().bpmnHandler.bpmnDiagramContainerService;
        this.workflowFilterLink$ = this.bpmnManager().bpmnHandler.workflowFilterService.workflowFilterLink$;
    }

    ngAfterContentInit() {
        this.diagramTitle = this.bpmnDiagramContainerService?.diagramTitle$;
        this.requestId = this.bpmnDiagramContainerService?.requestId$;
        this.diagramVersion = this.bpmnDiagramContainerService?.diagramVersion$;

        this.subscribeWithDestroyHandler(
            this.bpmnDiagramContainerService?.allowLabelClick$,
            (allowLabelClick) => {
                //labels allowed to be clicked? depending on this decision update labels
                this.subscribeWithDestroyHandler(this.bpmnOverlayStorageService?.labels$, (labels) => {
                    this.bpmnLabelService?.updateFromLabels(labels, allowLabelClick);
                });
            },
        );

        this.subscribeWithDestroyHandler(
            this.bpmnDiagramService?.importDone$,
            (value) => (this.importDone = value),
        );
    }

    ngOnDestroy(): void {
        //TODO performance - keep services/data, don't destroy for cache?
        this.destroy();
        this.bpmnDiagramService?.stopCustomRenderer();
        this.bpmnManager().bpmnHandler.destroySafeWithCache();
    }
}
