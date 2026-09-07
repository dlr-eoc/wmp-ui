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

import {ChangeDetectionStrategy, Component, inject, OnDestroy} from '@angular/core';
import {SituationDashboardComponent} from 'src/app/components/situation-dashboard/situation-dashboard.component';
import {VisualizeConfigService} from 'src/app/shared/services/user/visualize/visualize-config.service';
import {
    ContainerConfigElement,
    ContainerVisualConfig,
    DUMMY_CONTAINER_NAMES,
    VISUAL_CONFIGURATION_TYPE,
} from 'src/app/shared/services/user/models/VisualizeConfigData';
import {DashboardDataService} from 'src/app/app-pages/dashboard/service/dashboard-data.service';
import {Panel} from 'primeng/panel';
import {
    BpmnManagerService,
    DASHBOARD_BPMN_TICKET_IDENTIFIER,
} from 'src/app/shared/services/bpmn/bpmn-manager.service';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {ObserverTicketsPanelComponent} from 'src/app/components/observer-tickets-panel/observer-tickets-panel.component';

@Component({
    selector: 'app-dashboard',
    imports: [SituationDashboardComponent, Panel, ObserverTicketsPanelComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent extends AsyncDestroyable implements OnDestroy {
    private visualizeConfigService = inject(VisualizeConfigService);
    private dashboardDataService = inject(DashboardDataService);

    readonly _bpmnManagerTicketProcessInstance = inject(BpmnManagerService).getBpmnManager(
        DASHBOARD_BPMN_TICKET_IDENTIFIER,
    );
    readonly bpmnDiagramTicketHandlerService = this._bpmnManagerTicketProcessInstance.bpmnHandler;

    visualContainerConfig: ContainerConfigElement | undefined;

    constructor() {
        super();
        this.dashboardDataService.loadData();
        this.visualizeConfigService.updateConfigForPage('dashboard').then((visualConfigOfDashboard) => {
            const containersOfDashboard = visualConfigOfDashboard.get(
                VISUAL_CONFIGURATION_TYPE.CONTAINER,
            ) as ContainerVisualConfig;
            //TODO visual config, use defined name for dashboard
            this.visualContainerConfig = containersOfDashboard.configurations.get(DUMMY_CONTAINER_NAMES[0]);
        });
    }

    ngOnDestroy(): void {
        super.destroy();
    }
}
