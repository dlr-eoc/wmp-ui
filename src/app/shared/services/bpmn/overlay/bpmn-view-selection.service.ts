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

import ElementRegistry from 'diagram-js/lib/core/ElementRegistry';
import {BPMNElementType, BpmnHtmlOverlay, ClickedBpmnElement} from 'src/app/models/bpmn-diagram.model';
import {BpmnOverlayStorage} from 'src/app/shared/services/bpmn/overlay/storage/bpmn-overlay.storage';
import {BpmnDiagramService} from 'src/app/shared/services/bpmn/diagram/bpmn-diagram.service';
import {
    COLOR_SELECTED_TASK,
    getElementTypeFromElement,
} from 'src/app/shared/components/bpmn-diagram/bpmn-diagram.utils';
import {BehaviorSubject} from 'rxjs';

export class BpmnViewSelectionService {
    private bpmnDiagramService: BpmnDiagramService;
    private overlayService: BpmnOverlayStorage;

    private _sequenceFlowSelected$ = new BehaviorSubject<ClickedBpmnElement | undefined>(undefined);
    private _elementSelected$ = new BehaviorSubject<ClickedBpmnElement | undefined>(undefined);
    private readonly OVERFLOW_SELECTION = 10;

    constructor(bpmnDiagramService: BpmnDiagramService, overlayService: BpmnOverlayStorage) {
        this.bpmnDiagramService = bpmnDiagramService;
        this.overlayService = overlayService;
    }

    onActivitySelection(elementId: string | undefined) {
        //activity selected or deselected - no sequence able to be selected
        this._sequenceFlowSelected$.next(undefined);
        if (elementId) {
            this.addSelectionOverlay(elementId);
        } else {
            this.removeSelection();
        }
    }

    removeSelection() {
        this._sequenceFlowSelected$.next(undefined);
        this.overlayService.setSelection(undefined);
    }

    /**
     * Adds the selection to the given element id.
     * @param elementId - id of the element to select
     * @private
     */
    private addSelectionOverlay(elementId: string) {
        const elementRegistry =
            this.bpmnDiagramService.bpmnViewerHandler.get<ElementRegistry>('elementRegistry');

        const curActivity = elementRegistry.get(elementId);

        if (curActivity) {
            const htmlElement = this.createHtmlForActivity(curActivity);
            this._elementSelected$.next({
                id: elementId,
                name: elementId,
                element: curActivity,
                type: getElementTypeFromElement(curActivity),
            } satisfies ClickedBpmnElement);
            const overlay: BpmnHtmlOverlay = {
                elementId: elementId,
                uniqueIdentifier: elementId,
                html: htmlElement,
                position: {
                    top: 0,
                    left: 0,
                },
                idOfCreatedOverlay: undefined,
                type: 'selection',
            };

            this.overlayService.setSelection(overlay);
        } else {
            console.error('could not set selection, element ' + elementId + ' does not exist');
        }
    }

    /**
     *
     * @param bpmnElement
     */
    onSequenceFlowSelection(bpmnElement: ClickedBpmnElement) {
        this._elementSelected$.next(undefined);
        //rendering maybe not optimal here... use something else? overlay? whole size of overlay possible?

        if (bpmnElement.type === BPMNElementType.SEQUENCE_FLOW) {
            this._sequenceFlowSelected$.next(bpmnElement);
            const overlay: BpmnHtmlOverlay = {
                elementId: bpmnElement.id,
                uniqueIdentifier: bpmnElement.id,
                html: this.createHtmlForSequenceFlow(),
                position: {
                    top: 0,
                    left: 0,
                },
                idOfCreatedOverlay: undefined,
                type: 'selection',
            };
            this.overlayService.setSelection(overlay);
        } else {
            throw new Error('Could not set sequence flow selection, invalid type: ' + bpmnElement.type);
        }
    }

    private createHtmlForSequenceFlow() {
        const htmlElement = document.createElement('div', {});
        htmlElement.style.width = '20px';
        htmlElement.style.height = '20px';
        htmlElement.style.left = '-10px';
        htmlElement.style.top = '-10px';
        htmlElement.style.position = 'relative';

        // htmlElement.style.backgroundColor = COLOR_SELECTED_TASK;

        //transparent background
        htmlElement.style.backgroundColor = 'rgba(0,0,0,0)';
        htmlElement.style.borderRadius = '10px';
        htmlElement.style.border = 'dashed ' + COLOR_SELECTED_TASK;

        // htmlElement.style.opacity = "0.4";
        htmlElement.style.cursor = 'pointer';
        return htmlElement;
    }

    private createHtmlForActivity(curActivity: {id: string; businessObject?: any} & Record<string, any>) {
        const htmlElement = document.createElement('div', {});
        htmlElement.style.width = curActivity.width + this.OVERFLOW_SELECTION + 'px';
        htmlElement.style.height = curActivity.height + this.OVERFLOW_SELECTION + 'px';
        htmlElement.style.left = -this.OVERFLOW_SELECTION / 2 + 'px';
        htmlElement.style.top = -this.OVERFLOW_SELECTION / 2 + 'px';
        htmlElement.style.position = 'relative';

        // htmlElement.style.backgroundColor = COLOR_SELECTED_TASK;

        //transparent background
        htmlElement.style.backgroundColor = 'rgba(0,0,0,0)';

        if (curActivity.type.endsWith('Event')) {
            htmlElement.style.borderRadius = curActivity.width / 2 + 'px';
        } else {
            htmlElement.style.borderRadius = '10px';
        }
        htmlElement.style.border = 'dashed ' + COLOR_SELECTED_TASK;

        // htmlElement.style.opacity = "0.4";
        htmlElement.style.cursor = 'pointer';
        return htmlElement;
    }

    get sequenceFlowSelected$(): BehaviorSubject<ClickedBpmnElement | undefined> {
        return this._sequenceFlowSelected$;
    }

    get elementSelected$(): BehaviorSubject<ClickedBpmnElement | undefined> {
        return this._elementSelected$;
    }
}
