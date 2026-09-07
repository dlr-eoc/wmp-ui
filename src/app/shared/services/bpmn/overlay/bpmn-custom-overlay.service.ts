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

import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {HistoricProcessInstanceDto} from 'src/app/shared/services/camunda-api';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {BpmnOverlayStorage} from 'src/app/shared/services/bpmn/overlay/storage/bpmn-overlay.storage';
import {createOverlayLinkToParentProcessInstance} from 'src/app/shared/components/bpmn-diagram/custom/CustomBPMNUtils';
import {Shape} from 'diagram-js/lib/model';
import {CustomRendererService} from 'src/app/shared/services/bpmn/custom/custom-renderer.service';
import {BpmnCustomEventStore} from 'src/app/shared/services/bpmn/event/bpmn-custom-event-store.service';
import {getTimeDefinitionFromElement} from 'src/app/shared/services/bpmn/overlay/bpmn-overlay-utils';
import {takeUntil} from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class BpmnCustomOverlayService extends AsyncDestroyable implements OnDestroy {
    private readonly bpmnOverlayStorageService: BpmnOverlayStorage;
    private readonly customRendererService: CustomRendererService;
    private readonly bpmnCustomEventStoreService: BpmnCustomEventStore;

    private customOverlayStartEventSet = false;

    private _processInstance$ = new Subject<HistoricProcessInstanceDto>();
    private _startElementId$ = new Subject<string>();
    private _onRendererInactive$ = new Subject<void>();

    constructor(
        bpmnOverlayStorageService: BpmnOverlayStorage,
        customRendererService: CustomRendererService,
        bpmnCustomEventStoreService: BpmnCustomEventStore,
    ) {
        super();
        this.bpmnOverlayStorageService = bpmnOverlayStorageService;
        this.customRendererService = customRendererService;
        this.bpmnCustomEventStoreService = bpmnCustomEventStoreService;

        this.subscribeWithDestroyHandler(this.customRendererService.isActive$, (customRendererActive) => {
            //on active control change - set to default values to assure on bpmn change
            //custom values will be able to set again
            this.customOverlayStartEventSet = false;

            if (customRendererActive) {
                //wait for both data, afterwards create link - preventing missing process instance
                //(because added x ms later)
                combineLatest([this._processInstance$, this._startElementId$])
                    .pipe(takeUntil(this._onRendererInactive$))
                    .subscribe(([processInstance, startElementId]) => {
                        if (processInstance?.superProcessInstanceId && startElementId) {
                            //case valid data available for link to parent
                            createOverlayLinkToParentProcessInstance(
                                startElementId,
                                processInstance,
                                this.bpmnOverlayStorageService,
                                this.bpmnCustomEventStoreService,
                            );
                        }
                    });
            } else {
                //removing subscription on inactive custom renderer
                this._onRendererInactive$.next();
            }
        });
    }

    ngOnDestroy(): void {
        this._onRendererInactive$.next();
        super.destroy();
    }

    /**
     * Update of the processInstance. This should be called to assure CustomOverlays
     * of ProcessInstance are rendered.
     * @param processInstance - the process instance currently selected
     */
    updateProcessInstance(processInstance: HistoricProcessInstanceDto) {
        this._processInstance$.next(processInstance);
    }

    /**
     * StartEventElement given by {@link CustomBPMNRenderer}. Only the first one given will be used.
     * Using for rendering custom navigation back to parent.
     * @param element - the start event element given
     */
    addStartEventElement(element: Shape) {
        if (!this.customOverlayStartEventSet) {
            this.customOverlayStartEventSet = true;
            this._startElementId$.next(element.id);
        }
    }
    //Record of ElementId(of the activity) - string of timer definition
    private _timerDurationOfActivity$ = new BehaviorSubject<Record<string, string | undefined>>(
        {} as Record<string, string | undefined>,
    );

    get timerDurationOfActivity$(): Observable<Record<string, string | undefined>> {
        return this._timerDurationOfActivity$.asObservable();
    }

    addEventBusinessData(element: Shape) {
        const timeDefinitionAsString = getTimeDefinitionFromElement(element);
        if (timeDefinitionAsString) {
            const currentValue = this._timerDurationOfActivity$.getValue();
            currentValue[element?.id] = timeDefinitionAsString;
            this._timerDurationOfActivity$.next(currentValue);
        }
    }
}
