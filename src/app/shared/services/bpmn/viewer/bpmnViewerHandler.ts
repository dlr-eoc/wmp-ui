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

import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';
import {
    CUSTOM_BPMN_RENDERER_IDENTIFIER,
    CustomBPMNRenderer,
    customBpmnRenderer,
} from 'src/app/shared/components/bpmn-diagram/custom/CustomBPMNRenderer';

export class BpmnViewerHandler {
    private readonly _bpmnViewer: NavigatedViewer;

    constructor() {
        //create viewer with custom renderer, communication happens with service registered in CustomRenderer
        this._bpmnViewer = new NavigatedViewer({
            additionalModules: [customBpmnRenderer],
        });
    }
    get customBpmnRenderer() {
        return this.bpmnViewer.get(CUSTOM_BPMN_RENDERER_IDENTIFIER) as CustomBPMNRenderer;
    }

    get bpmnViewer(): NavigatedViewer {
        return this._bpmnViewer;
    }
}
