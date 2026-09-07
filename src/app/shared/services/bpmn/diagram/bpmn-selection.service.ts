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

import {BehaviorSubject, Observable} from 'rxjs';
import {BpmnConnectionStyle, BpmnDiagramOverlayBorderHighlight} from 'src/app/models/bpmn-diagram.model';

/**
 * @deprecated this service should not hold all data. Services for specific data should hold the data,
 * see architecture information
 */
export class BpmnSelectionService {
    private borderHighlightElements$ = new BehaviorSubject<BpmnDiagramOverlayBorderHighlight[] | []>([]);

    private _connectionElements$ = new BehaviorSubject<BpmnConnectionStyle[]>([]);

    /**
     * @deprecated move to other service
     */
    get connectionElements$(): Observable<BpmnConnectionStyle[]> {
        return this._connectionElements$.asObservable();
    }
    /**
     * @deprecated move to other service
     */
    setConnectionElements(value: BpmnConnectionStyle[]) {
        this._connectionElements$.next(value);
    }
}
