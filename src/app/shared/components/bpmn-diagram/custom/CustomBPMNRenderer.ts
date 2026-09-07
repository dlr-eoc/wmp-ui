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

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import EventBus from 'diagram-js/lib/core/EventBus';
import {Connection, Shape} from 'diagram-js/lib/model';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {is} from 'bpmn-js/lib/util/ModelUtil';
import {
    changeSVGCallActivityTo,
    changeSVGConnectionToComplete,
    changeSVGEventToComplete,
    changeSVGParallelGateway,
    changeSVGTaskTo,
    COLOR_COMPLETED,
    COLOR_INCIDENT,
    COLOR_RUNNING,
    OPACITY_INCIDENT,
} from 'src/app/shared/components/bpmn-diagram/bpmn-diagram.utils';
import {BpmnActivityStyle, BpmnConnectionStyle} from 'src/app/models/bpmn-diagram.model';
import {CustomRendererService} from 'src/app/shared/services/bpmn/custom/custom-renderer.service';
import {BpmnSelectionService} from 'src/app/shared/services/bpmn/diagram/bpmn-selection.service';
import {BpmnActivityStyleStorageService} from 'src/app/shared/services/bpmn/overlay/storage/bpmn-activity-style-storage.service';
import {BpmnCustomOverlayService} from 'src/app/shared/services/bpmn/overlay/bpmn-custom-overlay.service';

const HIGH_PRIORITY = 1500;

interface ConnectionElement {
    visual: SVGElement;
    connection: Connection;
}

interface ShapeElement {
    parentNode: SVGElement;
    element: Shape;
}

/**
 * See {@link CustomRendererService.setActive} on CustomBPMNRenderer controls
 *
 */
export class CustomBPMNRenderer extends BaseRenderer {
    //services used for bpmn handling
    static $inject = ['eventBus', 'bpmnRenderer'];
    private bpmnCustomOverlayService: undefined | BpmnCustomOverlayService = undefined;
    private eventBus: EventBus;
    private bpmnRenderer: BaseRenderer;

    //stored data
    private connectionElements = new Map<string, ConnectionElement>();
    private shapeElementsAvailable = new Map<string, ShapeElement>();
    private completeActivitiesToRerender = [] as string[];
    private incidentActivitiesToRerender = [] as string[];
    private runningActivitiesToRerender = [] as string[];
    private connectionsToRerender = [] as string[];

    private readonly onRemoveSubscriptions = new Subject<void>();
    private readonly onDestroy = new Subject<void>();

    private isCustomRendererActive: boolean = false;

    constructor(eventBus: EventBus, bpmnRenderer: BaseRenderer) {
        super(eventBus, HIGH_PRIORITY);
        this.eventBus = eventBus;
        this.bpmnRenderer = bpmnRenderer;
    }

    /**
     * This function needs to be called to start custom rendering.
     * Each services provided will result in custom rendering of given service type.
     * The CustomRendererService is mandatory for the operation of the CustomBPMNRenderer.
     * Assure to call {@link destroy()} at an angular context to assure correct
     * removal of possible subscriptions.
     * @param customRendererService a service to activate the bpmnRenderer
     * @param bpmnSelectionService
     * @param bpmnActivityStyleStorageService
     * @param bpmnCustomOverlayService
     */
    initializeRendering(
        customRendererService: CustomRendererService,
        bpmnSelectionService?: BpmnSelectionService,
        bpmnActivityStyleStorageService?: BpmnActivityStyleStorageService,
        bpmnCustomOverlayService?: BpmnCustomOverlayService,
    ) {
        this.bpmnCustomOverlayService = bpmnCustomOverlayService;

        //this is the data transfer connection to other services
        customRendererService.isActive$.pipe(takeUntil(this.onDestroy)).subscribe((isRendererActive) => {
            if (isRendererActive) {
                //create new connections to service
                bpmnActivityStyleStorageService?.activityStyles$
                    .pipe(takeUntil(this.onRemoveSubscriptions))
                    .subscribe((activityStyles) => this.handleActivityStyles(activityStyles));
                bpmnSelectionService?.connectionElements$
                    .pipe(takeUntil(this.onRemoveSubscriptions))
                    .subscribe((connectionStyles) => {
                        this.handleConnectionElements(connectionStyles);
                    });
            } else {
                //case renderer set inactive -> reset data and subscriptions of last bpmn
                //destroy old connections
                this.destroySubscriptionDataConnections();
                //reset state of custom renderer (old state of last bpmn)
                this.resetState();
            }
            this.isCustomRendererActive = isRendererActive;
        });
    }

    /**
     * This function destroys possible subscriptions made in this instance of the CustomBPMNRenderer.
     * Assure to initialize again for next usage.
     */
    destroy() {
        this.resetState(); //also reset state
        this.destroySubscriptionDataConnections();
        this.onDestroy.next();
    }

    //assure to correctly reset state, remove all connections or data from old diagram
    private resetState() {
        this.connectionElements = new Map<string, ConnectionElement>();
        this.shapeElementsAvailable = new Map<string, ShapeElement>();
        this.completeActivitiesToRerender = [] as string[];
        this.incidentActivitiesToRerender = [] as string[];
        this.runningActivitiesToRerender = [] as string[];
        this.connectionsToRerender = [] as string[];
    }

    private destroySubscriptionDataConnections() {
        this.onRemoveSubscriptions.next();
    }

    private handleConnectionElements(connectionStyles: BpmnConnectionStyle[]) {
        if (!this.isCustomRendererActive || connectionStyles.length === 0) {
            return;
        }
        this.connectionsToRerender = connectionStyles.map((connection) => connection.id);
        connectionStyles.forEach((connectionStyle) => {
            const shapeElement = this.connectionElements.get(connectionStyle.id);
            this.eventBus.fire('render.connection', {
                gfx: shapeElement?.visual,
                element: shapeElement?.connection,
            });
        });
    }

    private handleActivityStyles(completeActivityStyles: BpmnActivityStyle[]) {
        if (!this.isCustomRendererActive || completeActivityStyles.length === 0) {
            return;
        }

        const completeActivities = completeActivityStyles.filter((activity) => activity.type === 'complete');
        const runningActivities = completeActivityStyles.filter((activity) => activity.type === 'running');
        const incidentActivities = completeActivityStyles.filter((activity) => activity.type === 'incident');

        this.completeActivitiesToRerender = completeActivities.map((activity) => activity.elementId);
        this.runningActivitiesToRerender = runningActivities.map((activity) => activity.elementId);
        this.incidentActivitiesToRerender = incidentActivities.map((activity) => activity.elementId);

        runningActivities.forEach((activityStyle) => {
            const shapeElement = this.shapeElementsAvailable.get(activityStyle.elementId);
            if (shapeElement)
                this.eventBus.fire('render.shape', {
                    gfx: shapeElement?.parentNode,
                    element: shapeElement?.element,
                    activityStyle,
                });
        });
        incidentActivities.forEach((activityStyle) => {
            const shapeElement = this.shapeElementsAvailable.get(activityStyle.elementId);
            if (shapeElement)
                this.eventBus.fire('render.shape', {
                    gfx: shapeElement?.parentNode,
                    element: shapeElement?.element,
                });
        });

        completeActivities.forEach((activityStyle) => {
            // const activity = this.elementRegistry.get(activityStyle.elementId);
            // const incomingList: any[] = activity?.businessObject.incoming || [];
            // const completedArrows = incomingList.filter(incomingArrow => completeActivityStyles.find(activity => activity.elementId === incomingArrow.sourceRef.id));
            // const unCompletedArrows = incomingList.filter(incomingArrow => !completeActivityStyles.find(activity => activity.elementId === incomingArrow.sourceRef.id));

            const shapeElement = this.shapeElementsAvailable.get(activityStyle.elementId);
            if (shapeElement)
                this.eventBus.fire('render.shape', {
                    gfx: shapeElement?.parentNode,
                    element: shapeElement?.element,
                });
        });
    }

    canRender(element: Element): boolean {
        //TODO improve strategy for rendering
        return true;
    }

    drawConnection(visuals: SVGElement, connection: Connection): SVGElement {
        //store current elements to use those later
        this.connectionElements.set(connection.id, {
            visual: visuals,
            connection: connection,
        } satisfies ConnectionElement);

        if (this.connectionsToRerender.find((connectionId) => connectionId === connection.id)) {
            if (is(connection, 'bpmn:SequenceFlow')) {
                return changeSVGConnectionToComplete(visuals);
            }
        }
        return super.drawConnection(visuals, connection);
    }

    drawShape(parentNode: SVGElement, element: Shape): SVGElement {
        //store shape element to redraw it later
        this.shapeElementsAvailable.set(element.id, {parentNode, element} satisfies ShapeElement);

        switch (element.type) {
            case 'bpmn:StartEvent':
                this.bpmnCustomOverlayService?.addStartEventElement(element);
                this.bpmnCustomOverlayService?.addEventBusinessData(element);
                break;
            case 'bpmn:BoundaryEvent':
                this.bpmnCustomOverlayService?.addEventBusinessData(element);
                break;
        }

        if (this.runningActivitiesToRerender.find((activityId) => activityId === element.id)) {
            //
            if (is(element, 'bpmn:Task') || is(element, 'bpmn:SubProcess')) {
                return changeSVGTaskTo(parentNode, element, COLOR_RUNNING);
            } else if (is(element, 'bpmn:CallActivity')) {
                return changeSVGCallActivityTo(parentNode, element, COLOR_RUNNING);
            } else if (element.type.includes('Event')) {
                return changeSVGEventToComplete(parentNode, element, COLOR_RUNNING);
            } else if (element.type.includes('Gateway')) {
                return changeSVGParallelGateway(parentNode, element, COLOR_RUNNING);
            }
        }
        //case draw custom shape for activity with incident
        if (this.incidentActivitiesToRerender.find((activityId) => activityId === element.id)) {
            //
            if (is(element, 'bpmn:Task') || is(element, 'bpmn:SubProcess')) {
                return changeSVGTaskTo(parentNode, element, COLOR_INCIDENT, OPACITY_INCIDENT);
            } else if (is(element, 'bpmn:CallActivity')) {
                return changeSVGCallActivityTo(parentNode, element, COLOR_INCIDENT, OPACITY_INCIDENT);
            } else if (element.type.includes('Event')) {
                return changeSVGEventToComplete(parentNode, element, COLOR_INCIDENT);
            } else if (element.type.includes('Gateway')) {
                return changeSVGParallelGateway(parentNode, element, COLOR_INCIDENT);
            }
        }

        //case draw custom shape for completed activity
        if (this.completeActivitiesToRerender.find((activityId) => activityId === element.id)) {
            //
            if (is(element, 'bpmn:Task') || is(element, 'bpmn:SubProcess')) {
                return changeSVGTaskTo(parentNode, element, COLOR_COMPLETED);
            } else if (is(element, 'bpmn:CallActivity')) {
                return changeSVGCallActivityTo(parentNode, element, COLOR_COMPLETED);
            } else if (element.type.includes('Event')) {
                return changeSVGEventToComplete(parentNode, element, COLOR_COMPLETED);
            } else if (element.type.includes('Gateway')) {
                return changeSVGParallelGateway(parentNode, element, COLOR_COMPLETED);
            }
        }
        return super.drawShape(parentNode, element);
    }
}
//WARNING, this name should not change
export const CUSTOM_BPMN_RENDERER_IDENTIFIER = 'customRenderer';
export const customBpmnRenderer = {
    __init__: [CUSTOM_BPMN_RENDERER_IDENTIFIER],
    customRenderer: ['type', CustomBPMNRenderer],
};
