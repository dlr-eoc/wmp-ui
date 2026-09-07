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

import EventBus from 'diagram-js/lib/core/EventBus';
import {BPMNElementType} from 'src/app/models/bpmn-diagram.model';
import {BpmnDiagramService} from 'src/app/shared/services/bpmn/diagram/bpmn-diagram.service';
import {BpmnDiagramContainerService} from 'src/app/shared/services/bpmn/container/bpmn-diagram-container.service';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

/**
 * Handles Events from "eventBus" given by {@link BpmnDiagramService}.
 * Depending on different cases the output emitter are called.
 * <br>
 * Example options to handle: <br>
 *     'element.hover'
 *     'element.out'
 *     'element.click'
 *     'element.dblclick'
 *     'element.mousedown'
 *     'element.mouseup'
 */
export class BpmnEventService extends AsyncDestroyable {
    private readonly bpmnDiagramService: BpmnDiagramService;
    private readonly bpmnDiagramContainerService: BpmnDiagramContainerService;
    private readonly onRemoveEventSubscriptions = new Subject<void>();

    constructor(
        bpmnDiagramService: BpmnDiagramService,
        bpmnDiagramContainerService: BpmnDiagramContainerService,
    ) {
        super();
        this.bpmnDiagramService = bpmnDiagramService;
        this.bpmnDiagramContainerService = bpmnDiagramContainerService;
        this.subscribeWithDestroyHandler(this.bpmnDiagramContainerService.isLoading$, (isLoading) => {
            if (!isLoading) {
                //case not loading, register subscription on allowSelection value
                this.bpmnDiagramContainerService.allowSelection$
                    //handle allow selection events if not loading data
                    .pipe(takeUntil(this.onRemoveEventSubscriptions))
                    .subscribe((allowSelection) => {
                        this.handleBpmnEvents(allowSelection);
                    });
            } else {
                //case loading, remove events
                this.handleBpmnEvents(false);
                //remove subscription old on allowSelection on new loading of bpmnDiagramContainer
                this.onRemoveEventSubscriptions.next();
            }
        });
    }

    destroy() {
        this.clearAndDestroy();
    }
    clearAndDestroy(): void {
        super.destroy();
        this.onRemoveEventSubscriptions.next(); // prevent new handle event handler
        this.handleBpmnEvents(false); //also remove event listeners from eventBus
    }

    /**
     * This function handles events of the bpmnViewer.
     * @param eventsEnabled - if the events should be enabled or not
     */
    handleBpmnEvents(eventsEnabled: boolean) {
        const eventBus = this.bpmnDiagramService.bpmnViewerHandler.get<EventBus>('eventBus');

        //always remove events before registering new - case allow selection=false
        this.removeEvents(eventBus);

        if (eventsEnabled) {
            eventBus.on('element.click', (e: any) => {
                // e.element = the model element
                // e.gfx = the graphical element
                if (
                    e.element.type.endsWith('Task') ||
                    e.element.type.endsWith('SubProcess') ||
                    e.element.type.endsWith('Event') ||
                    e.element.type.endsWith('Gateway')
                ) {
                    this.bpmnDiagramContainerService.bpmnElementClicked$.next({
                        id: e.element.id,
                        name: e.element?.businessObject?.name,
                        type: BPMNElementType.ACTIVITY,
                        element: e.element,
                    });
                } else if (e.element.type.endsWith('CallActivity')) {
                    this.bpmnDiagramContainerService.bpmnCallActivityClicked$.next({
                        calledProcess: e.element.businessObject.calledElement,
                        id: e.element.id,
                        name: e.element?.businessObject?.name,
                        type: BPMNElementType.CALL_ACTIVITY,
                    });
                } else if (e.element.type.endsWith('SequenceFlow')) {
                    this.bpmnDiagramContainerService.bpmnElementClicked$.next({
                        id: e.element.id,
                        name: e.element?.businessObject?.name,
                        connectionElement: e.element,
                        type: BPMNElementType.SEQUENCE_FLOW,
                    });
                } else {
                    //case no important element clicked - emit
                    this.bpmnDiagramContainerService.bpmnNoElementClicked$.next();
                }
            });

            eventBus.on('element.hover', (e: any) => {
                if (
                    e.element.type.endsWith('Task') ||
                    e.element.type.endsWith('Event') ||
                    e.element.type.endsWith('CallActivity') ||
                    e.element.type.endsWith('SequenceFlow')
                ) {
                    e.gfx.style.cursor = 'pointer';
                }
            });
        }
    }

    /**
     * Remove events correctly to assure only one callback defined per event
     * @param eventBus - the eventBus to remove events from
     * @private
     */
    private removeEvents(eventBus: EventBus<null>) {
        eventBus.off('element.hover');
        eventBus.off('element.click');
    }
}
