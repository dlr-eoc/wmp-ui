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

import {Component, inject, input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {
    InfoConfigElement,
    VisualConfigElement,
} from 'src/app/shared/services/user/models/VisualizeConfigData';
import {DashboardDataService} from 'src/app/app-pages/dashboard/service/dashboard-data.service';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';

@Component({
    selector: 'app-info',
    imports: [],
    templateUrl: './info.component.html',
    styleUrl: './info.component.scss',
})
export class InfoComponent extends AsyncDestroyable implements OnChanges, OnDestroy {
    configElement = input.required<undefined | VisualConfigElement>();
    styleAsString = input.required<undefined | string>();
    createdTextFromData: string | undefined = undefined;
    private readonly dashboardDataService = inject(DashboardDataService);
    infoConfig: InfoConfigElement | undefined;

    constructor() {
        super();
    }

    ngOnDestroy(): void {
        super.destroy();
    }

    ngOnChanges(_changes: SimpleChanges): void {
        if (this.configElement()) {
            this.infoConfig = this.configElement() as InfoConfigElement;
            if (this.infoConfig.descriptionDataKey.includes('€Status')) {
                this.createdTextFromData = 'Running on Demo VisualizationConfig defined in Frontend';
            } else if (this.infoConfig.descriptionDataKey.includes('€incidents')) {
                this.subscribeWithDestroyHandler(this.dashboardDataService.situationViewModels$, (model) => {
                    if (model) {
                        let numberTotalIncidents = 0;
                        Object.keys(model).forEach((processDefinition) => {
                            const models = model[processDefinition];
                            let incidents = 0;
                            models.forEach((model) => {
                                incidents += model.incidents ?? 0;
                            });
                            numberTotalIncidents = incidents;
                        });
                        this.createdTextFromData = `Incidents: ${numberTotalIncidents}`;
                    }
                });
            } else if (this.infoConfig.descriptionDataKey.includes('€running')) {
                this.subscribeWithDestroyHandler(this.dashboardDataService.situationViewModels$, (model) => {
                    if (model) {
                        let numberTotalRequests = 0;
                        Object.keys(model).forEach((processDefinition) => {
                            const models = model[processDefinition];
                            let requests = 0;
                            models.forEach((model) => {
                                requests += model.requests ?? 0;
                            });
                            numberTotalRequests = requests;
                        });
                        this.createdTextFromData = `Running Requests: ${numberTotalRequests}`;
                    }
                });
            }
        }
    }
}
