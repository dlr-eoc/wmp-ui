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

import {Component, input, OnChanges, SimpleChanges} from '@angular/core';
import {
    BPMNConfigElement,
    ContainerConfigElement,
    InfoConfigElement,
    VISUAL_CONFIGURATION_TYPE,
    VisualConfigElement,
} from 'src/app/shared/services/user/models/VisualizeConfigData';
import {InfoComponent} from 'src/app/shared/components/visual/info/info.component';
import {VisualBpmnComponent} from 'src/app/shared/components/visual/bpmn/visual-bpmn.component';

@Component({
    selector: 'app-visual',
    imports: [InfoComponent, VisualBpmnComponent],
    templateUrl: './visual.component.html',
    styleUrl: './visual.component.scss',
})
export class VisualComponent implements OnChanges {
    configElement = input.required<undefined | VisualConfigElement>();
    protected readonly VISUAL_CONFIGURATION_TYPE = VISUAL_CONFIGURATION_TYPE;
    type: VISUAL_CONFIGURATION_TYPE | undefined;
    infoConfig: InfoConfigElement | undefined;
    containerConfig: ContainerConfigElement | undefined;
    styleAsString: string | undefined;
    bpmnConfig: BPMNConfigElement | undefined;

    ngOnChanges(changes: SimpleChanges): void {
        this.type = this.configElement()?.type;
        if (this.configElement()) {
            switch (this.type) {
                case VISUAL_CONFIGURATION_TYPE.INFO:
                    this.infoConfig = this.configElement()
                        ? (this.configElement() as InfoConfigElement)
                        : undefined;
                    this.styleAsString = this.infoConfig?.style;
                    break;
                case VISUAL_CONFIGURATION_TYPE.CONTAINER:
                    this.containerConfig = this.configElement()
                        ? (this.configElement() as ContainerConfigElement)
                        : undefined;
                    this.styleAsString = this.containerConfig?.style;
                    console.debug('  DEBUG Style: ' + this.styleAsString);
                    break;
                case VISUAL_CONFIGURATION_TYPE.BPMN:
                    this.bpmnConfig = this.configElement()
                        ? (this.configElement() as BPMNConfigElement)
                        : undefined;
                    this.styleAsString = this.containerConfig?.style;
                    break;
                default:
                    throw new Error(`Unknown type ${this.type} - Unable to parse VisualComponent.`);
            }
        }
    }
}
