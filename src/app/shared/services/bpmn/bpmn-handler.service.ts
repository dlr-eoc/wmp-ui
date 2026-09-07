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

import {CustomRendererService} from 'src/app/shared/services/bpmn/custom/custom-renderer.service';
import {BpmnOverlayStorage} from 'src/app/shared/services/bpmn/overlay/storage/bpmn-overlay.storage';
import {BpmnSelectionService} from 'src/app/shared/services/bpmn/diagram/bpmn-selection.service';
import {BpmnActivityStyleStorageService} from 'src/app/shared/services/bpmn/overlay/storage/bpmn-activity-style-storage.service';
import {BpmnCustomOverlayService} from 'src/app/shared/services/bpmn/overlay/bpmn-custom-overlay.service';
import {AlertService} from 'src/app/shared/services/alert.service';
import {BpmnCustomEventStore} from 'src/app/shared/services/bpmn/event/bpmn-custom-event-store.service';
import {BpmnDiagramService} from 'src/app/shared/services/bpmn/diagram/bpmn-diagram.service';
import {BpmnDocumentService} from 'src/app/shared/services/bpmn/diagram/bpmn-document.service';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from 'src/app/shared/services/config.service';
import {BpmnEventService} from 'src/app/shared/services/bpmn/event/bpmn-event.service';
import {BpmnDiagramContainerService} from 'src/app/shared/services/bpmn/container/bpmn-diagram-container.service';
import {BpmnCustomEventHandlerService} from 'src/app/shared/services/bpmn/event/bpmn-custom-event-handler.service';
import {BpmnLabelService} from 'src/app/shared/services/bpmn/overlay/bpmn-label.service';
import {BpmnViewSelectionService} from 'src/app/shared/services/bpmn/overlay/bpmn-view-selection.service';
import {BpmnOverlayHandler} from 'src/app/shared/services/bpmn/overlay/BpmnOverlayHandler';
import {WorkflowFilterServiceBase} from 'src/app/components/workflow-page/service/WorkflowFilterServiceBase';
import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';

export class BpmnHandlerService {
    readonly bpmnOverlayStorage: BpmnOverlayStorage;
    readonly bpmnSelectionService: BpmnSelectionService;
    readonly bpmnActivityStyleStorageService: BpmnActivityStyleStorageService;
    readonly bpmnCustomOverlayService: BpmnCustomOverlayService;
    readonly customRendererService: CustomRendererService;
    readonly bpmnCustomEventStore: BpmnCustomEventStore;
    readonly bpmnDiagramService: BpmnDiagramService;
    readonly bpmnDocumentService: BpmnDocumentService;
    readonly bpmnDiagramContainerService: BpmnDiagramContainerService;
    readonly bpmnEventService: BpmnEventService;
    readonly bpmnCustomEventHandlerService: BpmnCustomEventHandlerService;
    readonly bpmnLabelService: BpmnLabelService;
    readonly bpmnViewSelectionService: BpmnViewSelectionService;
    readonly bpmnOverlayHandler: BpmnOverlayHandler;
    readonly workflowFilterService: WorkflowFilterServiceBase;

    /**
     * This constructor creates a AngularService like structure but with manually creating and providing
     * needed services on creation of other services.
     * @param alertService
     * @param httpClient
     * @param configService
     * @param wmpApiService
     * @param workflowFilterService
     * @param allowSelection
     * @param allowLabelClick
     */
    constructor(
        alertService: AlertService,
        httpClient: HttpClient,
        configService: ConfigService,
        wmpApiService: WmpApiService,
        workflowFilterService: WorkflowFilterServiceBase,
        allowSelection: boolean,
        allowLabelClick: boolean,
    ) {
        this.workflowFilterService = workflowFilterService;
        this.customRendererService = new CustomRendererService();
        this.bpmnOverlayStorage = new BpmnOverlayStorage();
        this.bpmnSelectionService = new BpmnSelectionService();
        this.bpmnCustomEventStore = new BpmnCustomEventStore();
        this.bpmnActivityStyleStorageService = new BpmnActivityStyleStorageService(
            this.bpmnOverlayStorage,
            this.bpmnCustomEventStore,
        );
        this.bpmnCustomOverlayService = new BpmnCustomOverlayService(
            this.bpmnOverlayStorage,
            this.customRendererService,
            this.bpmnCustomEventStore,
        );
        this.bpmnDiagramService = new BpmnDiagramService(
            this.customRendererService,
            this.bpmnOverlayStorage,
            this.bpmnSelectionService,
            this.bpmnActivityStyleStorageService,
            this.bpmnCustomOverlayService,
        );
        this.bpmnDocumentService = new BpmnDocumentService(
            httpClient,
            configService,
            this.bpmnDiagramService,
        );
        this.bpmnDiagramContainerService = new BpmnDiagramContainerService(
            workflowFilterService,
            this.bpmnDocumentService,
        );
        this.bpmnDiagramContainerService.initializeForContainerUpdate(allowSelection, allowLabelClick);
        this.bpmnEventService = new BpmnEventService(
            this.bpmnDiagramService,
            this.bpmnDiagramContainerService,
        );
        this.bpmnCustomEventHandlerService = new BpmnCustomEventHandlerService(
            this.bpmnCustomEventStore,
            workflowFilterService,
            alertService,
            wmpApiService,
        );
        this.bpmnLabelService = new BpmnLabelService(
            this.bpmnOverlayStorage,
            this.bpmnDiagramContainerService,
        );
        this.bpmnViewSelectionService = new BpmnViewSelectionService(
            this.bpmnDiagramService,
            this.bpmnOverlayStorage,
        );
        this.bpmnOverlayHandler = new BpmnOverlayHandler(this.bpmnOverlayStorage, this.bpmnDiagramService);
    }

    /**
     * This function destroys save with cached services still containing subscriptions and data.
     */
    destroySafeWithCache() {
        //workflow filter needs to be destroyed and initialized again
        this.workflowFilterService.destroy();

        //other services should not be destroyed: those need the active subscriptions
        //to operate correctly on page change
    }

    /**
     * This function clears the whole bpmn-handler.
     * Every service get's destroyed and all data is removed from the services.
     */
    clearHandler() {
        //destroy everything
        this.workflowFilterService.destroy();
        this.bpmnActivityStyleStorageService.destroy();
        this.bpmnCustomOverlayService.destroy();
        this.bpmnDiagramService.destroy();
        this.bpmnDocumentService.destroy();
        this.bpmnDiagramContainerService.destroy();
        this.bpmnEventService.clearAndDestroy();
        this.bpmnCustomEventHandlerService.destroy();
        this.bpmnOverlayHandler.destroy();

        this.clearData();
    }

    private clearData() {
        this.bpmnOverlayStorage.clear();
        this.bpmnActivityStyleStorageService.clear();
    }
}
