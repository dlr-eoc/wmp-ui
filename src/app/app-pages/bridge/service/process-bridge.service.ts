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

import {inject, Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {ProcessBridgeModel, WMPProcessBridgeDataDto} from 'src/app/app-pages/bridge/models/WMPBridge';
import {WmpBridgeController} from 'src/app/shared/services/wmp-api/custom/wmp-bridge-controller.service';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {getInstancesWithIncidents} from 'src/app/utils/bpmn/instance.utils';
import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';
import {HistoricIncidentDto} from 'src/app/shared/services/camunda-api';
import {
    BpmnManagerService,
    PROCESS_BRIDGE_BPMN_IDENTIFIER,
} from 'src/app/shared/services/bpmn/bpmn-manager.service';

export interface ProcessBridgeParameter {
    name: string;
    deploymentId: string;
    businessKey: string;
    value: unknown;
    state: string;
    dateCreation: Date;
}

export interface ProcessBridge {
    name: string;
    parameter: ProcessBridgeParameter[];
}

@Injectable({
    providedIn: 'root',
})
export class ProcessBridgeService extends AsyncDestroyable implements OnDestroy {
    private wmpBridgeController = inject(WmpBridgeController);
    private wmpApiService = inject(WmpApiService);

    private readonly bpmnHandlerProcessBridge = inject(BpmnManagerService).getBpmnDiagramHandler(
        PROCESS_BRIDGE_BPMN_IDENTIFIER,
    );
    private bpmnDiagramService = this.bpmnHandlerProcessBridge.bpmnDiagramService;
    private bpmnDiagramContainerService = this.bpmnHandlerProcessBridge.bpmnDiagramContainerService;

    private _processBridges$: Subject<WMPProcessBridgeDataDto[]> = new Subject();
    private _processBridgeModels$: Subject<ProcessBridgeModel[]> = new Subject();
    //behavior subject needed to assure data loaded before creation is given to component
    private _selectedProcessBridge$: BehaviorSubject<WMPProcessBridgeDataDto | undefined> =
        new BehaviorSubject<WMPProcessBridgeDataDto | undefined>(undefined);
    private _selectedModelProcessBridge$: Subject<ProcessBridgeModel> = new Subject();
    //data of current selected model
    private _processBridgeInstances$: Subject<HistoricIncidentDto[]> = new Subject();

    private currentBridge: WMPProcessBridgeDataDto | undefined = undefined;
    constructor() {
        super();
        this.subscribeWithDestroyHandler(
            this._selectedProcessBridge$.asObservable(),
            (value) => (this.currentBridge = value),
        );
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    selectProcessBridge(wmpProcessBridgeData: WMPProcessBridgeDataDto) {
        this._selectedProcessBridge$.next(wmpProcessBridgeData);

        const modelNames = Object.keys(wmpProcessBridgeData.models);
        const models: ProcessBridgeModel[] = modelNames.map((modelName) => {
            const modelDto = wmpProcessBridgeData.models[modelName];
            return {...modelDto, modelName: modelName} satisfies ProcessBridgeModel;
        });
        this.updateProcessBridgeModels(models);
        if (models.length > 0) {
            if (models[0]) {
                //select first model
                this.selectProcessBridgeModel(models[0]);
            }
        }
    }

    selectProcessBridgeModel(processBridge: ProcessBridgeModel) {
        const processInstancesOfBridgeModel = this.wmpBridgeController.getProcessInstancesOfBridge(
            processBridge.modelName,
        );
        this.subscribeWithDestroyHandler(processInstancesOfBridgeModel, async (value) => {
            const instances = await getInstancesWithIncidents(value, this.wmpApiService);
            this._processBridgeInstances$.next(instances);
            this._selectedModelProcessBridge$.next(processBridge);
            const bpmnModel = atob(processBridge.content);
            this.bpmnDiagramContainerService.initializeForContainerUpdate(false, false);
            this.bpmnDiagramService
                .loadFromNewBPMN(bpmnModel)
                .then((_success) => {
                    return this.bpmnDiagramContainerService.bpmnUpdateCompleted();
                })
                .then(() => {
                    this.bpmnDiagramService.updateLoading(false);
                });
        });
    }

    loadProcessBridges() {
        this.wmpBridgeController.getBridges().then((bridges) => {
            this._processBridges$.next(bridges);

            if (bridges.length > 0) {
                const firstProcessBridge = bridges[0];
                this.selectProcessBridge(firstProcessBridge);
            }
        });
    }

    updatedEnableOfCurrentBridge(enabled: boolean) {
        this.wmpBridgeController.updateBridgeActive(enabled, this.currentBridge).then(() => {
            this.loadProcessBridges();
        });
    }

    private updateProcessBridgeModels(models: ProcessBridgeModel[]) {
        this._processBridgeModels$.next(models);
    }

    get processBridgeModels$(): Subject<ProcessBridgeModel[]> {
        return this._processBridgeModels$;
    }

    get selectedModelProcessBridge$(): Subject<ProcessBridgeModel> {
        return this._selectedModelProcessBridge$;
    }

    get processBridgeInstances$(): Observable<HistoricIncidentDto[]> {
        return this._processBridgeInstances$.asObservable();
    }

    get processBridges$(): Observable<WMPProcessBridgeDataDto[]> {
        return this._processBridges$.asObservable();
    }

    get selectedProcessBridge$(): Observable<WMPProcessBridgeDataDto | undefined> {
        return this._selectedProcessBridge$.asObservable();
    }
}
