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

import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    inject,
    input,
    OnDestroy,
    signal,
    viewChild,
} from '@angular/core';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {ProgressSpinner} from 'primeng/progressspinner';
import {AsyncPipe} from '@angular/common';
import {BpmnManager} from 'src/app/shared/services/bpmn/bpmn-manager';
import {AlertService} from 'src/app/shared/services/alert.service';

@Component({
    selector: 'app-bpmn-diagram',
    imports: [ProgressSpinner, AsyncPipe],
    templateUrl: './bpmn-diagram.component.html',
    styleUrl: './bpmn-diagram.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BpmnDiagramComponent
    extends AsyncDestroyable
    implements AfterViewInit, AfterContentInit, OnDestroy
{
    readonly bpmnManager = input.required<BpmnManager>();
    readonly diagramIdentifier = computed(() => this.bpmnManager().identifier);

    private readonly alertService = inject(AlertService);

    private readonly referenceElement = viewChild.required<ElementRef>('ref');

    private readonly observer = signal<ResizeObserver | undefined>(undefined);

    constructor() {
        super();
    }

    ngOnDestroy(): void {
        super.destroy();
        this.observer()?.disconnect();
    }

    ngAfterViewInit() {
        this.bpmnManager().startManagerAfterContentInit(
            this.referenceElement()?.nativeElement,
            this.observer,
        );
        // this.subscribeWithDestroyHandler(
        //     this.bpmnManager().bpmnHandler.workflowFilterService.filter$,
        //     (filter) => {
        //         if (filter?.shouldUpdate) {
        //             this.observer()?.observe(this.referenceElement()?.nativeElement);
        //         }
        //     },
        // );
        // bpmnDiagramService.zoomHome();
        //after import done, add resize observer
        // this.observer.set(
        //     new ResizeObserver((_entries) => {
        //         try {
        //             this.bpmnManager().bpmnHandler.bpmnDiagramService.zoomHome();
        //         } catch (error) {
        //             throw new Error('Error while resizing browser:' + error);
        //         }
        //     }),
        // );
        // this.observer()?.observe(this.referenceElement()?.nativeElement);
    }

    ngAfterContentInit() {}
}
