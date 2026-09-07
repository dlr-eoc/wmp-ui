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

import {Subject} from 'rxjs';
import {
    HistoricActivityInstanceDto,
    HistoricJobLogDto,
    HistoricProcessInstanceDto,
} from 'src/app/shared/services/camunda-api';

export enum EventClickEventType {
    LINK_CALL_ACTIVITY = 'LINK_CALL_ACTIVITY',
    START_EVENT_NAVIGATE_BACK = 'START_EVENT_NAVIGATE_BACK',
    RETRY_ACTIVITY = 'RETRY_ACTIVITY',
}
export interface BpmnCustomEvent {
    clickType: EventClickEventType;
}
export interface ActivityClickEvent extends BpmnCustomEvent {
    historicActivityDto: HistoricActivityInstanceDto;
}
export interface StartEventOverlayEvent extends BpmnCustomEvent {
    processInstance: HistoricProcessInstanceDto;
}
export interface RetryActivityEvent extends BpmnCustomEvent {
    historicActivityDto: HistoricActivityInstanceDto;
    historicJobLogDto: HistoricJobLogDto;
}
/**
 * This service just handles different custom events fired by the CustomBPMNRenderer.
 * @see{CustomBPMNRenderer}
 */
export class BpmnCustomEventStore {
    private readonly _overlayCallActivityClickEventStore$ = new Subject<undefined | ActivityClickEvent>();
    readonly overlayCallActivityClickEventStore$ = this._overlayCallActivityClickEventStore$.asObservable();
    private readonly _overlayStartEventOverlayStore$ = new Subject<undefined | StartEventOverlayEvent>();
    readonly overlayStartEventOverlayStore$ = this._overlayStartEventOverlayStore$.asObservable();
    private readonly _overlayRetryActivityStore$ = new Subject<undefined | RetryActivityEvent>();
    readonly overlayRetryActivityStore$ = this._overlayRetryActivityStore$.asObservable();

    constructor() {}

    /**
     * Careful with this handler! Assure to fire those events only for CustomBPMN Elements
     * (such as CallActivity Navigation Icon)
     * @see{CustomBPMNRenderer}
     */
    getOverlayCallActivityButtonEventStoreSubject$() {
        return this._overlayCallActivityClickEventStore$;
    }
    /**
     * Careful with this handler! Assure to fire those events only for CustomBPMN Elements
     * (such as Event Parent Navigation Icon)
     * @see{CustomBPMNRenderer}
     */
    getOverlayStartEventOverlayStoreSubject$() {
        return this._overlayStartEventOverlayStore$;
    }
    /**
     * Careful with this handler! Assure to fire those events only for CustomBPMN Elements
     * (such as Event Parent Navigation Icon)
     * @see{CustomBPMNRenderer}
     */
    get getOverlayRetryActivityStoreSubject$() {
        return this._overlayRetryActivityStore$;
    }
}
