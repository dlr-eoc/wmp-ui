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

import {BpmnActivityStyle} from 'src/app/models/bpmn-diagram.model';
import {BehaviorSubject, Observable} from 'rxjs';
import {HistoricActivityInstanceDto} from 'src/app/shared/services/camunda-api';
import {
    COLOR_COMPLETED,
    COLOR_INCIDENT,
    COLOR_RUNNING,
} from 'src/app/shared/components/bpmn-diagram/bpmn-diagram.utils';
import {createOverlayCallActivityButton} from 'src/app/shared/components/bpmn-diagram/custom/CustomBPMNUtils';
import {BpmnOverlayStorage} from 'src/app/shared/services/bpmn/overlay/storage/bpmn-overlay.storage';
import {BpmnCustomEventStore} from 'src/app/shared/services/bpmn/event/bpmn-custom-event-store.service';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';

export class BpmnActivityStyleStorageService extends AsyncDestroyable {
    private _activityStyles$ = new BehaviorSubject<BpmnActivityStyle[]>([]);
    private readonly bpmnOverlayStorageService: BpmnOverlayStorage;
    private readonly bpmnCustomHandlerService: BpmnCustomEventStore;

    constructor(
        bpmnOverlayStorageService: BpmnOverlayStorage,
        bpmnCustomHandlerService: BpmnCustomEventStore,
    ) {
        super();
        this.bpmnOverlayStorageService = bpmnOverlayStorageService;
        this.bpmnCustomHandlerService = bpmnCustomHandlerService;
    }

    setActivityStyles(
        runningActivitiesWithNoIncident: HistoricActivityInstanceDto[],
        incidentActivities: HistoricActivityInstanceDto[],
        completedActivities: HistoricActivityInstanceDto[],
    ) {
        const activityStyles = [
            ...completedActivities.map(
                (activity) =>
                    ({
                        elementId: activity.activityId ?? '',
                        element: activity,
                        color: COLOR_COMPLETED,
                        type: 'complete',
                    }) satisfies BpmnActivityStyle,
            ),
            ...incidentActivities.map(
                (activity) =>
                    ({
                        elementId: activity.activityId ?? '',
                        element: activity,
                        color: COLOR_INCIDENT,
                        type: 'incident',
                    }) satisfies BpmnActivityStyle,
            ),
            ...runningActivitiesWithNoIncident.map(
                (activity) =>
                    ({
                        elementId: activity.activityId ?? '',
                        element: activity,
                        color: COLOR_RUNNING,
                        type: 'running',
                    }) satisfies BpmnActivityStyle,
            ),
        ];
        const bpmnActivityStylesCallActivities = activityStyles.filter((element) => {
            return element.element.activityType === 'callActivity';
        });
        //first update overlays
        bpmnActivityStylesCallActivities.forEach((callActivityStyle) => {
            createOverlayCallActivityButton(
                callActivityStyle.elementId,
                callActivityStyle.element,
                this.bpmnOverlayStorageService,
                this.bpmnCustomHandlerService,
            );
        });
        //then update styles for custom renderer
        this._activityStyles$.next(activityStyles);
    }

    get activityStyles$(): Observable<BpmnActivityStyle[]> {
        return this._activityStyles$.asObservable();
    }
    clear() {
        this._activityStyles$.next([]);
    }
}
