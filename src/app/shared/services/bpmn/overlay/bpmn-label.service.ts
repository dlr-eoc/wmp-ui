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

import {BpmnDiagramOverlayLabel, BpmnHtmlOverlay} from 'src/app/models/bpmn-diagram.model';
import {BpmnOverlayStorage} from 'src/app/shared/services/bpmn/overlay/storage/bpmn-overlay.storage';
import {BpmnDiagramContainerService} from 'src/app/shared/services/bpmn/container/bpmn-diagram-container.service';

export class BpmnLabelService {
    private overlayService: BpmnOverlayStorage;
    private bpmnDiagramContainerService: BpmnDiagramContainerService;

    constructor(
        overlayService: BpmnOverlayStorage,
        bpmnDiagramContainerService: BpmnDiagramContainerService,
    ) {
        this.overlayService = overlayService;
        this.bpmnDiagramContainerService = bpmnDiagramContainerService;
    }

    updateFromLabels(labels: BpmnDiagramOverlayLabel[], allowLabelClick: boolean) {
        //optimize label creation
        if (labels.length > 0) {
            labels.forEach((label) => {
                this.addLabel(
                    label.elementId,
                    label.value,
                    label.color,
                    label.offset,
                    label.offsetRight,
                    label.metadata,
                    label.description,
                    allowLabelClick,
                );
            });
        }
    }

    private addLabel(
        elementName: string,
        number: string | number,
        color: string = 'info',
        offset: number = 0,
        offsetRight: number = 0,
        metadata: any,
        description: string | undefined,
        allowLabelClicked: boolean,
    ) {
        const htmlElement = document.createElement('span');
        htmlElement.classList.add('badge', 'badge-' + color);
        htmlElement.style.backgroundColor = color;
        htmlElement.style.border = '1px solid black';
        htmlElement.innerHTML = number + '';

        if (allowLabelClicked) {
            htmlElement.onclick = () => {
                this.bpmnDiagramContainerService.bpmnLabelClicked$.next({
                    activityId: elementName,
                    metadata: metadata,
                });
            };
            htmlElement.classList.add('badge-clickable');
        }
        if (description) {
            htmlElement.title = description;
        }

        const label: BpmnHtmlOverlay = {
            elementId: elementName,
            uniqueIdentifier: elementName + metadata,
            html: htmlElement,
            position: {
                bottom: 25,
                left: offset + 5,
                right: offsetRight !== 0 ? offsetRight : undefined,
            },
            idOfCreatedOverlay: undefined,
            type: 'label',
        };
        this.overlayService.addOverlay(label);
    }
}
