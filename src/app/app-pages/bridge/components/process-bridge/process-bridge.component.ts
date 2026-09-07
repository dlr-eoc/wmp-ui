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

import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ProcessBridgeDetailComponent} from 'src/app/app-pages/bridge/components/process-bridge/process-bridge-detail/process-bridge-detail.component';
import {ProcessBridgeService} from 'src/app/app-pages/bridge/service/process-bridge.service';
import {ProcessBridgeConfigTableComponent} from 'src/app/app-pages/bridge/components/process-bridge/process-bridge-config-data/process-bridge-config-table.component';
import {Tab, TabList, TabPanel, TabPanels, Tabs} from 'primeng/tabs';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {WMPProcessBridgeDataDto} from 'src/app/app-pages/bridge/models/WMPBridge';
import {VisualizeConfigService} from 'src/app/shared/services/user/visualize/visualize-config.service';
import {PAGE_CONFIG_IDENTIFIER} from 'src/app/app-pages/ConfigValues';
import {InfoConfigElement} from 'src/app/shared/services/user/models/VisualizeConfigData';
import {ProcessBridgeInstanceTableComponent} from 'src/app/app-pages/bridge/components/process-bridge/process-bridge-instance-table/process-bridge-instance-table.component';
import {BpmnDiagramContainerComponent} from 'src/app/shared/components/bpmn-diagram/bpmn-diagram-container.component';
import {
    BpmnManagerService,
    PROCESS_BRIDGE_BPMN_IDENTIFIER,
} from 'src/app/shared/services/bpmn/bpmn-manager.service';

@Component({
    selector: 'app-process-bridge',
    imports: [
        ProcessBridgeDetailComponent,
        ProcessBridgeConfigTableComponent,
        TabList,
        Tabs,
        TabPanels,
        TabPanel,
        Tab,
        ProcessBridgeInstanceTableComponent,
        BpmnDiagramContainerComponent,
    ],
    templateUrl: './process-bridge.component.html',
    styleUrl: './process-bridge.component.scss',
})
export class ProcessBridgeComponent extends AsyncDestroyable implements OnInit, OnDestroy {
    private processBridgeService = inject(ProcessBridgeService);
    private visualizeConfigService = inject(VisualizeConfigService);

    bpmnIdentifier = PROCESS_BRIDGE_BPMN_IDENTIFIER;
    processBridgeDto: WMPProcessBridgeDataDto | undefined = undefined;
    activityConfig: undefined | InfoConfigElement;
    incidentInfoConfig: undefined | InfoConfigElement;

    readonly bpmnManagerService = inject(BpmnManagerService).getBpmnManager(PROCESS_BRIDGE_BPMN_IDENTIFIER);

    constructor() {
        super();
        this.subscribeWithDestroyHandler(
            this.processBridgeService.selectedProcessBridge$,
            (value) => (this.processBridgeDto = value),
        );
        this.subscribeWithDestroyHandler(this.visualizeConfigService.config$, (configHandler) => {
            this.activityConfig = configHandler.getInfoConfigForComponent('activityRun');
            this.incidentInfoConfig = configHandler.getInfoConfigForComponent('bridgeIncidents');
        });

        this.processBridgeService.loadProcessBridges();

        this.visualizeConfigService.updateConfigForPage(PAGE_CONFIG_IDENTIFIER.PROCESS_BRIDGE);
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    ngOnInit(): void {}
}
