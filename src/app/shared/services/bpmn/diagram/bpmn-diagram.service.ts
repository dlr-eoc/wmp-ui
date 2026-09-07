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

import {inject} from '@angular/core';
import {BpmnViewerHandler} from 'src/app/shared/services/bpmn/viewer/bpmnViewerHandler';
import ZoomScroll from 'diagram-js/lib/navigation/zoomscroll/ZoomScroll';
import {Canvas} from 'bpmn-js/lib/features/context-pad/ContextPadProvider';
import NavigatedViewer from 'bpmn-js/lib/NavigatedViewer';
import {BehaviorSubject, Observable} from 'rxjs';
import {CustomRendererService} from 'src/app/shared/services/bpmn/custom/custom-renderer.service';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import Overlays from 'diagram-js/lib/features/overlays/Overlays';
import {BpmnOverlayStorage} from 'src/app/shared/services/bpmn/overlay/storage/bpmn-overlay.storage';
import EventBus from 'diagram-js/lib/core/EventBus';
import {AlertService, WmpAlertType} from 'src/app/shared/services/alert.service';
import {BpmnSelectionService} from 'src/app/shared/services/bpmn/diagram/bpmn-selection.service';
import {BpmnActivityStyleStorageService} from 'src/app/shared/services/bpmn/overlay/storage/bpmn-activity-style-storage.service';
import {BpmnCustomOverlayService} from 'src/app/shared/services/bpmn/overlay/bpmn-custom-overlay.service';

export class BpmnDiagramService extends AsyncDestroyable {
    private readonly customRendererService: CustomRendererService;
    private readonly bpmnOverlayStorage: BpmnOverlayStorage;
    private readonly bpmnSelectionService: BpmnSelectionService;
    private readonly bpmnActivityStyleStorageService: BpmnActivityStyleStorageService;
    private readonly bpmnCustomOverlayService: BpmnCustomOverlayService;

    private alertService = inject(AlertService);

    private readonly _bpmnViewerHandler: BpmnViewerHandler;
    private readonly _importDone$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private readonly _loadingWorkflowData$ = new BehaviorSubject<boolean>(true);

    constructor(
        customRendererService: CustomRendererService,
        bpmnOverlayStorage: BpmnOverlayStorage,
        bpmnSelectionService: BpmnSelectionService,
        bpmnActivityStyleStorageService: BpmnActivityStyleStorageService,
        bpmnCustomOverlayService: BpmnCustomOverlayService,
    ) {
        super();
        this.customRendererService = customRendererService;
        this.bpmnOverlayStorage = bpmnOverlayStorage;
        this.bpmnSelectionService = bpmnSelectionService;
        this.bpmnActivityStyleStorageService = bpmnActivityStyleStorageService;
        this.bpmnCustomOverlayService = bpmnCustomOverlayService;

        this._bpmnViewerHandler = new BpmnViewerHandler();
        const customBpmnRenderer = this._bpmnViewerHandler.customBpmnRenderer;
        customBpmnRenderer.initializeRendering(
            this.customRendererService,
            this.bpmnSelectionService,
            this.bpmnActivityStyleStorageService,
            this.bpmnCustomOverlayService,
        );
    }

    updateLoading(isLoading: boolean) {
        this._loadingWorkflowData$.next(isLoading);
    }
    /**
     * This function clears the whole diagram (overlays + BPMN itself).
     */
    clearDiagram() {
        this.clearOverlays();
        this.bpmnViewerHandler.clear();
    }

    /**
     * This function clears all overlays of the current BPMN.
     */
    clearOverlays(): void {
        this.bpmnOverlayStorage.clear();
    }

    /**
     * Stopping CustomRenderer while importing new BPMNs.
     */
    stopCustomRenderer() {
        this.customRendererService.setActive(false);
    }

    async loadFromNewBPMN(bpmnDiagramAsString: string): Promise<boolean> {
        //assure to clear diagram before loading new
        this.stopCustomRenderer();
        this.clearDiagram();

        if (bpmnDiagramAsString) {
            try {
                return this.bpmnViewerHandler.importXML(bpmnDiagramAsString).then((value) => {
                    if (value.warnings.length > 0) {
                        //case any warnings, maybe use for user info later
                        this.alertService.addWarning({
                            text: 'Warnings on XML import found: ' + value.warnings.length,
                        });
                    }
                    //reactivate custom renderer
                    this.customRendererService.setActive(true);
                    //assure to update import, mark it as done
                    this._importDone$.next(true);
                    return true;
                });
            } catch (err) {
                this.alertService.addAlert({
                    text: 'Error while importing XML of BPMN.',
                    type: WmpAlertType.ERROR,
                });
                this._importDone$.next(false);
                return false;
            }
        }
        this._importDone$.next(false);
        return Promise.resolve(false);
    }

    zoomIn() {
        const zoomScroll = this.bpmnViewerHandler.get<ZoomScroll>('zoomScroll');
        zoomScroll.stepZoom(1);
    }

    /**
     * This function has to be called after content is visible otherwise the BPMN will be broken.
     */
    zoomHome() {
        const zoomScroll = this.bpmnViewerHandler.get<ZoomScroll>('zoomScroll');
        //zoomScroll needs to be called before zooming home for modals or not yet visible BPMNs
        zoomScroll.stepZoom(-1);
        zoomScroll.stepZoom(1);
        //afterwards zooming home
        const canvas = this.bpmnViewerHandler.get<Canvas>('canvas');
        canvas?.zoom('fit-viewport', 'auto');
    }

    zoomOut() {
        const zoomScroll = this.bpmnViewerHandler.get<ZoomScroll>('zoomScroll');
        zoomScroll.stepZoom(-1);
    }

    get eventBus() {
        return this.bpmnViewerHandler.get<EventBus>('eventBus');
    }
    attachToElement(nativeElement: HTMLElement) {
        this.bpmnViewerHandler.detach();
        this.bpmnViewerHandler.attachTo(nativeElement);
    }

    /**
     * Warning! Use this bpmnViewer with cautious, the service should handle it in most cases.
     */
    get bpmnViewerHandler(): NavigatedViewer {
        return this._bpmnViewerHandler.bpmnViewer;
    }

    /**
     * Warning! Use this overlayService with cautious, the service should handle it in most cases.
     */
    get overlayService(): Overlays {
        return this._bpmnViewerHandler.bpmnViewer.get<Overlays>('overlays');
    }

    get importDone$(): Observable<boolean> {
        return this._importDone$;
    }

    get loadingWorkflowData$(): Observable<boolean> {
        return this._loadingWorkflowData$.asObservable();
    }
}
