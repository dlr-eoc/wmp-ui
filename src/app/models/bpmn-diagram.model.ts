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

import {OverlayAttrs} from 'diagram-js/lib/features/overlays/Overlays';
import {HistoricActivityInstanceDto} from 'src/app/shared/services/camunda-api';
import {Connection} from 'diagram-js/lib/model';
import {ElementLike} from 'diagram-js/lib/model/Types';

export enum BPMNElementType {
    ACTIVITY = 'ACTIVITY',
    SEQUENCE_FLOW = 'SEQUENCE_FLOW',
    CALL_ACTIVITY = 'CALL_ACTIVITY',
}
export interface ClickedBpmnElement {
    id: string;
    name: string;
    type: BPMNElementType;
    connectionElement?: Connection;
    element?: ElementLike;
}

export interface ClickedBpmnCallActivity extends ClickedBpmnElement {
    calledProcess: string;
}

export interface ClickedBpmnLabel {
    activityId: string;
    metadata?: any;
}

export interface BpmnDiagramOverlayLabel extends BpmnOverlay {
    type: 'label';
    value: string | number;
    color?: string;
    offset?: number;
    offsetRight?: number;
    metadata?: any;
    description?: string;
    historic?: boolean;
}
export interface BpmnDiagramOverlaySelection extends BpmnOverlay {
    type: 'selection';
}

export interface BpmnDiagramOverlaySelected {
    elementName: string;
    color: string;
}

export interface BpmnDiagramOverlayBorderHighlight {
    elementId: string;
    borderColor: string;
    borderStyle: string;
    borderWidth: number;
}

export type ElementType = 'complete' | 'incident' | 'running';

export interface BpmnActivityStyle extends BpmnElementStyle<HistoricActivityInstanceDto> {}

export interface BpmnGatewayStyle extends BpmnElementStyle<unknown> {}
export interface BpmnElementStyle<T> {
    elementId: string;
    element: T;
    color: string;
    type: ElementType;
}

export interface BpmnConnectionStyle {
    id: string;
    isCompleted: boolean;
}

export type BpmnOverlayType = 'label' | 'selection' | 'border' | 'custom' | 'ALL';

/**
 * @param uniqueIdentifier defined for each {@link BpmnOverlayType}
 */
export interface BpmnHtmlOverlay extends OverlayAttrs, BpmnOverlay {
    idOfCreatedOverlay: string | undefined; //id of created overlay or undefined if not created yet
    uniqueIdentifier: string; //
}

export interface BpmnOverlay {
    elementId: string; //unique id for an overlay for each type
    type: BpmnOverlayType;
}
