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
import {BpmnHtmlOverlay} from 'src/app/models/bpmn-diagram.model';

import {
    HistoricActivityInstanceDto,
    HistoricJobLogDto,
    HistoricProcessInstanceDto,
} from 'src/app/shared/services/camunda-api';
import {
    ActivityClickEvent,
    BpmnCustomEventStore,
    EventClickEventType,
    RetryActivityEvent,
    StartEventOverlayEvent,
} from 'src/app/shared/services/bpmn/event/bpmn-custom-event-store.service';
import {Z_INDEX_BPMN_BUTTON} from 'src/app/shared/components/bpmn-diagram/bpmn-diagram.utils';

export function createOverlayCallActivityButton(
    elementId: string,
    activity: HistoricActivityInstanceDto,
    bpmnOverlayStorageService: BpmnOverlayStorage,
    bpmnCustomHandlerService: BpmnCustomEventStore,
) {
    const htmlElement = document.createElement('div', {});

    htmlElement.onclick = () => {
        bpmnCustomHandlerService.getOverlayCallActivityButtonEventStoreSubject$().next({
            historicActivityDto: activity,
            clickType: EventClickEventType.LINK_CALL_ACTIVITY,
        } satisfies ActivityClickEvent);
    };
    htmlElement.style.width = '20px';
    htmlElement.style.height = '20px';
    htmlElement.style.top = '4px';
    htmlElement.style.left = '4px';
    htmlElement.style.position = 'relative';
    htmlElement.style.cursor = 'zoom-in';

    //setting zIndex to something higher, assure able to be clicked
    htmlElement.style.zIndex = Z_INDEX_BPMN_BUTTON + '';
    htmlElement.style.position = 'relative';

    htmlElement.innerHTML = '<i class="pi pi-link" style="color: blue"></i>';

    bpmnOverlayStorageService.addOverlay({
        idOfCreatedOverlay: undefined,
        html: htmlElement,
        position: {
            top: 0,
            left: 0,
        },
        type: 'custom',
        elementId: elementId,
        uniqueIdentifier: elementId + 'CallActivityLink',
    } satisfies BpmnHtmlOverlay);
}
export const OVERLAY_CALL_ACTIVITY_LINK = 'CallActivityLink';

export function createSomeOverlayTEST(
    activity: HistoricActivityInstanceDto,
    job: HistoricJobLogDto,
    bpmnOverlayStorageService: BpmnOverlayStorage,
    bpmnCustomHandlerService: BpmnCustomEventStore,
) {
    const elementId = activity.activityId;
    if (!elementId) {
        throw new Error('No ActivityId found for given activity.');
    }
    const htmlElement = document.createElement('div', {});

    htmlElement.onclick = () => {
        //fire event on click
        bpmnCustomHandlerService.getOverlayRetryActivityStoreSubject$.next({
            historicActivityDto: activity,
            historicJobLogDto: job,
            clickType: EventClickEventType.RETRY_ACTIVITY,
        } satisfies RetryActivityEvent);
    };
    htmlElement.style.width = '20px';
    htmlElement.style.height = '20px';

    htmlElement.style.top = '4px';
    htmlElement.style.left = '72px';
    htmlElement.style.position = 'relative';
    // htmlElement.style.display = 'flex';
    // htmlElement.style.justifyContent = 'flex-end';

    htmlElement.style.cursor = 'pointer';

    //setting zIndex to something higher, assure able to be clicked
    htmlElement.style.zIndex = Z_INDEX_BPMN_BUTTON + '';

    htmlElement.innerHTML =
        '<div style="width:22px;height:22px;padding:1px;background:rgb(255 255 255 / 0.53);"><i class="pi pi-history" style="color: #0055ff"></i></div>';

    bpmnOverlayStorageService.addOverlay({
        idOfCreatedOverlay: undefined,
        html: htmlElement,
        position: {
            top: 0,
            left: 0,
        },
        type: 'custom',
        elementId: elementId,
        //using complete activityId as unique identifier, possible multiple activities in overlay storage
        //(e.g. multiple BPMNs at the time with same process definitions)
        uniqueIdentifier: elementId + '_' + activity.id,
    } satisfies BpmnHtmlOverlay);
}

export function createOverlayLinkToParentProcessInstance(
    elementId: string,
    processInstance: HistoricProcessInstanceDto,
    bpmnOverlayStorageService: BpmnOverlayStorage,
    bpmnCustomHandlerService: BpmnCustomEventStore,
) {
    const htmlElement = document.createElement('div', {});
    htmlElement.style.width = '20px';
    htmlElement.style.height = '20px';
    htmlElement.style.top = '-14px';
    htmlElement.style.left = '-14px';
    htmlElement.style.position = 'relative';
    htmlElement.style.cursor = 'zoom-out';
    htmlElement.onclick = () => {
        bpmnCustomHandlerService.getOverlayStartEventOverlayStoreSubject$().next({
            clickType: EventClickEventType.START_EVENT_NAVIGATE_BACK,
            processInstance: processInstance,
        } satisfies StartEventOverlayEvent);
    };

    //setting zIndex to something higher, assure able to be clicked
    htmlElement.style.zIndex = Z_INDEX_BPMN_BUTTON + '';
    htmlElement.style.position = 'relative';

    htmlElement.innerHTML = '<i class="pi pi-directions-alt" style="color: blue"></i>';

    bpmnOverlayStorageService.addOverlay({
        idOfCreatedOverlay: undefined,
        html: htmlElement,
        position: {
            top: 0,
            left: 0,
        },
        type: 'custom',
        elementId: elementId,
        uniqueIdentifier: elementId + 'ParentLink',
    } satisfies BpmnHtmlOverlay);
}

/**
 * @deprecated NOT working, see TODOs

 */
export function createTooltipOverlay(
    elementId: string,
    tooltipMessage: string,
    bpmnOverlayStorageService: BpmnOverlayStorage,
) {
    const htmlElement = document.createElement('div', {});
    htmlElement.style.width = '36.42px';
    htmlElement.style.height = '36.42px';
    htmlElement.style.top = '0px';
    htmlElement.style.left = '0px';
    htmlElement.style.position = 'relative';

    //setting zIndex to something higher, assure able to be clicked
    htmlElement.style.zIndex = Z_INDEX_BPMN_BUTTON + 2 + '';

    //FIXME this pTooltip unable to be shown, it won't render correctly if added by bpmn.js
    // simple class working with recognition of names but not custom params like pTooltip
    htmlElement.innerHTML =
        '<i class="pi pi-directions-alt" pTooltip="' + tooltipMessage + '" style="color: blue"></i>';

    bpmnOverlayStorageService.addOverlay({
        idOfCreatedOverlay: undefined,
        html: htmlElement,
        position: {
            top: 0,
            left: 0,
        },
        type: 'custom',
        elementId: elementId,
        uniqueIdentifier: elementId + 'Tooltip',
    } satisfies BpmnHtmlOverlay);
}
