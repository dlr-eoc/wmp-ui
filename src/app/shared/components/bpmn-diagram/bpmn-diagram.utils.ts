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

import {BpmnActivityStyle, BPMNElementType, BpmnHtmlOverlay} from 'src/app/models/bpmn-diagram.model';
import {append as svgAppend, attr as svgAttr, create as svgCreate} from 'tiny-svg';
import {Shape} from 'diagram-js/lib/model';
import {ElementLike} from 'diagram-js/lib/model/Types';

export const TASK_BORDER_RADIUS = 8;
export const STROKE_WIDTH_DEFAULT_ACTIVITY_SVG = 2;
export const STROKE_WIDTH_CALL_ACTIVITY_SVG = 4;
export const COLOR_COMPLETED = 'rgba(66,143,37,1)';
export const COLOR_INCIDENT = 'rgba(218,89,89,1)';
export const COLOR_TERMINATED = 'rgba(121,50,50,1)';
export const COLOR_RUNNING = 'rgba(37,67,143,1)';
export const COLOR_SUCCESSFUL = 'rgba(0,127,173,1)';
export const COLOR_SELECTED_TASK = 'rgba(54,153,196,0.59)';
export const COLOR_RUNNING_LABEL = '#00dcf0';
export const COLOR_WAITING_LABEL = '#00dcf0';
export const COLOR_COMPLETED_LABEL = '#a2a2a2';
export const OPACITY_DEFAULT = 0.2;
export const OPACITY_INCIDENT = 0.7;
//z index set to something else than auto (assure to set position correctly, else won't work)
export const Z_INDEX_BPMN_BUTTON = 42;

function getColorWithOpacity(rgbaColor: string, opacity: number) {
    return rgbaColor.split(',1)')[0] + ',' + opacity.toString() + ')';
}

export const COLOR_INCIDENT_WITH_OPACITY = getColorWithOpacity(COLOR_INCIDENT, OPACITY_DEFAULT);
export const COLOR_TERMINATED_WITH_OPACITY = getColorWithOpacity(COLOR_TERMINATED, OPACITY_DEFAULT);

export function getElementTypeFromElement(e: ElementLike) {
    const type = e.type;
    if (
        type.endsWith('Event') ||
        type.endsWith('Task') ||
        type.endsWith('SubProcess') ||
        type.endsWith('Gateway')
    ) {
        return BPMNElementType.ACTIVITY;
    } else if (type.endsWith('CallActivity')) {
        return BPMNElementType.CALL_ACTIVITY;
    } else {
        throw new Error(`Element type "${type}" is not supported`);
    }
}
export function changeSVGConnectionToComplete(parentNode: SVGElement) {
    const rect = svgCreate('rect');
    svgAttr(rect, {
        width: 100,
        height: 80,
        rx: TASK_BORDER_RADIUS,
        ry: TASK_BORDER_RADIUS,
        stroke: COLOR_COMPLETED || '#000',
        strokeWidth: STROKE_WIDTH_DEFAULT_ACTIVITY_SVG,
        fill: '#fff',
    });
    const path = svgCreate('path');

    //TODO change this arrow to different color
    svgAttr(path, {
        fill: '#0f0',
    });
    parentNode.insertBefore(path, parentNode.firstChild);
    //remove
    // parentNode.childNodes.forEach(removeWithTagName(parentNode, "rect"));
    //add rectangle as parent of child
    // parentNode.insertBefore(rect, parentNode.firstChild);
    return parentNode;
}

export function changeSVGEventToComplete(parentNode: SVGElement, element: Shape, color: string) {
    const circle = svgCreate('circle');
    const radius = element.height / 2;
    svgAttr(circle, {
        cx: radius,
        cy: radius,
        xy: radius,
        r: radius,
        stroke: color,
        strokeWidth: STROKE_WIDTH_DEFAULT_ACTIVITY_SVG,
        fill: color,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        fillOpacity: OPACITY_DEFAULT,
    });
    //remove old shape
    parentNode.childNodes.forEach(removeWithTagName(parentNode, 'circle'));
    //add new shape
    svgAppend(parentNode, circle);

    return parentNode;
}

/**
 * Creating a ParallelGateway with given color. Using a rotated rectangle for display.
 * @param parentNode
 * @param element
 * @param color
 */
export function changeSVGParallelGateway(parentNode: SVGElement, element: Shape, color: string) {
    const rect = svgCreate('rect');
    svgAttr(rect, {
        width: element.width - 14,
        height: element.height - 14,
        x: -18, //moving because of rotation
        y: 17.5, //moving because of rotation
        transform: 'rotate(-45)',
        stroke: color ?? '#000',
        strokeWidth: STROKE_WIDTH_DEFAULT_ACTIVITY_SVG,
        fillOpacity: OPACITY_DEFAULT,
        fill: color ?? '#fff',
    });

    //remove old shape
    parentNode.childNodes.forEach(removeWithTagName(parentNode, 'polygon'));
    //add rectangle as parent of child
    parentNode.insertBefore(rect, parentNode.firstChild);
    return parentNode;
}
export function changeSVGTaskTo(parentNode: SVGElement, element: Shape, color: string, opacity?: number) {
    const rect = svgCreate('rect');
    svgAttr(rect, {
        width: element.width,
        height: element.height,
        rx: TASK_BORDER_RADIUS,
        ry: TASK_BORDER_RADIUS,
        stroke: color ?? '#000',
        strokeWidth: STROKE_WIDTH_DEFAULT_ACTIVITY_SVG,
        fill: color ?? '#fff',
        fillOpacity: opacity ?? OPACITY_DEFAULT,
    });
    //remove
    parentNode.childNodes.forEach(removeWithTagName(parentNode, 'rect'));
    //add rectangle as parent of child
    parentNode.insertBefore(rect, parentNode.firstChild);
    return parentNode;
}

export function changeSVGCallActivityTo(
    parentNode: SVGElement,
    element: Shape,
    color: string,
    opacity?: number,
) {
    const rect = svgCreate('rect');
    svgAttr(rect, {
        width: element.width,
        height: element.height,
        rx: TASK_BORDER_RADIUS,
        ry: TASK_BORDER_RADIUS,
        stroke: '#000',
        strokeWidth: STROKE_WIDTH_CALL_ACTIVITY_SVG,
        fill: color ?? '#fff',
        fillOpacity: opacity ?? OPACITY_DEFAULT,
    });

    //remove outer rectangle from call activity
    removeFirstRect(parentNode);
    //add rectangle as parent of child
    parentNode.insertBefore(rect, parentNode.firstChild);
    return parentNode;
}
function removeFirstRect(parentNode: SVGElement) {
    const childNodes = parentNode.childNodes;
    if (childNodes && childNodes.length > 0) {
        const childNode = childNodes[0];
        parentNode.removeChild(childNode);
    }
}
function removeWithTagName(parentNode: SVGElement, nodeNameToDelete: string) {
    return (childNode: ChildNode) => {
        if (childNode.nodeName === nodeNameToDelete) {
            parentNode.removeChild(childNode);
        }
    };
}

export function changeActivityToComplete(
    elementRegistry: any,
    overlayService: any,
    overlays: BpmnHtmlOverlay[],
    bpmnCompleteActivitiesStyles: BpmnActivityStyle[],
) {
    const colorCompleteActivity = 'rgba(6,242,27,0.08)';

    const activities = bpmnCompleteActivitiesStyles.map((bpmnActivityStyles) =>
        elementRegistry.get(bpmnActivityStyles.elementId),
    );
    // const curActivity = elementRegistry.get(elementId);
    // const widthInPxWithDefaultBorderOffset = widthInPx + 1; // Default bpmn activity border is 2px

    activities.forEach((activity) => {
        const incomingList: any[] = activity.businessObject.incoming;
        if (incomingList && incomingList.length > 0) {
            const completedArrows = incomingList.filter((incomingArrow) =>
                activities.find((activity) => activity.id === incomingArrow.sourceRef.id),
            );
            const unCompletedArrows = incomingList.filter(
                (incomingArrow) => !activities.find((activity) => activity.id === incomingArrow.sourceRef.id),
            );
            completedArrows.forEach((completeArrow) => {
                const htmlElement = document.createElement('div', {});
                htmlElement.style.width = completeArrow.width + 'px';
                htmlElement.style.height = completeArrow.height + 'px';
                htmlElement.style.backgroundColor = 'rgba(255,255,255,0.65)';
                const overlay: BpmnHtmlOverlay = {
                    elementId: completeArrow.id,
                    uniqueIdentifier: completeArrow.id,
                    html: htmlElement,
                    position: {},
                    idOfCreatedOverlay: undefined as any,
                    type: 'border',
                };

                overlay.idOfCreatedOverlay = overlayService.add(completeArrow.id, {
                    position: {
                        top: 0,
                        left: 0,
                    },
                    html: htmlElement,
                });
            });
        }

        //just mark activity as complete
        const htmlElement = document.createElement('div', {});

        htmlElement.style.width = activity.width + 'px';
        htmlElement.style.height = activity.height + 'px';

        htmlElement.style.borderRadius =
            activity.type === 'bpmn:StartEvent' || activity.type === 'bpmn:EndEvent' ? '18px' : '10px';
        htmlElement.style.backgroundColor = colorCompleteActivity;
        htmlElement.style.pointerEvents = 'none';

        const elementId = activity.id;
        const overlay: BpmnHtmlOverlay = {
            elementId: elementId,
            uniqueIdentifier: elementId,
            html: htmlElement,
            position: {},
            idOfCreatedOverlay: undefined as any,
            type: 'border',
        };

        overlay.idOfCreatedOverlay = overlayService.add(elementId, {
            position: {
                top: 0,
                left: 0,
            },
            html: htmlElement,
        });
        overlays.push(overlay);
    });
}
