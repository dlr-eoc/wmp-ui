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

import {BpmnOverlayStorage} from 'src/app/shared/services/bpmn/overlay/storage/bpmn-overlay.storage';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {BpmnDiagramService} from 'src/app/shared/services/bpmn/diagram/bpmn-diagram.service';
import {BpmnHtmlOverlay} from 'src/app/models/bpmn-diagram.model';

/**
 * This BpmnOverlayHandler needs to be used together with the {@link BpmnOverlayStorage}!
 * The handler synchronizes the overlays and handles the usage.
 */
export class BpmnOverlayHandler extends AsyncDestroyable {
    private bpmnOverlayStorage: BpmnOverlayStorage;
    private bpmnDiagramService: BpmnDiagramService;

    constructor(bpmnOverlayStorage: BpmnOverlayStorage, bpmnDiagramService: BpmnDiagramService) {
        super();
        this.bpmnOverlayStorage = bpmnOverlayStorage;
        this.bpmnDiagramService = bpmnDiagramService;

        this.subscribeWithDestroyHandler(this.bpmnOverlayStorage.currentOverlay$, (value) => {
            const overlayToAdd = value;
            if (overlayToAdd) {
                try {
                    const overlayService = this.bpmnDiagramService.overlayService;
                    const idOfOverlayCreated = overlayService.add(overlayToAdd.elementId, {
                        position: overlayToAdd.position,
                        html: overlayToAdd.html,
                    });
                    this.bpmnOverlayStorage.addCreatedOverlay(overlayToAdd, idOfOverlayCreated);
                } catch (e) {
                    throw new Error('Error creating overlay');
                }
            } else {
                //ignore case for undefined, do not remove anything
            }
        });
        this.subscribeWithDestroyHandler(this.bpmnOverlayStorage.overlayToRemove$, (value) => {
            if (value) this.removeOverlay(value);
        });
    }

    private removeOverlay(value: BpmnHtmlOverlay) {
        if (value?.idOfCreatedOverlay)
            this.bpmnDiagramService.overlayService.remove(value.idOfCreatedOverlay);
        else {
            throw new Error('Invalid overlay to remove');
        }
    }
}
