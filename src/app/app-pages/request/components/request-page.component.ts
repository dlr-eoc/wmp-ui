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

import {Component, inject, OnDestroy, OnInit} from "@angular/core";
import {RequestService} from "src/app/app-pages/request/service/request.service";
import {WMPRequest} from "src/app/app-pages/request/models/WMPRequest";
import {Splitter} from "primeng/splitter";
import {RequestPageDetailComponent} from "src/app/app-pages/request/components/detail/request-page-detail.component";
import {RequestPageFilterComponent} from "src/app/app-pages/request/components/request-page-filter/request-page-filter.component";
import {Card} from "primeng/card";
import {AsyncDestroyable} from "src/app/utils/AsyncDestroyable";
import {ActivatedRoute} from "@angular/router";
import {getDataFromSnapshot} from "src/app/components/workflow-page/workflow.utils";
import {RequestPageTableComponent} from "src/app/app-pages/request/components/request-page-table/request-page-table.component";
import {VISUAL_PAGE_TYPE} from "src/app/shared/services/user/models/VisualizeConfigData";
import {VisualizeConfigService} from "src/app/shared/services/user/visualize/visualize-config.service";
import {Panel} from "primeng/panel";
import {WorkflowFilterService} from "src/app/components/workflow-page/service/workflow-filter.service";

@Component({
    selector: "app-request-page",
    templateUrl: "./request-page.component.html",
    standalone: true,
    styleUrl: "./request-page.component.scss",
    imports: [
        Splitter,
        RequestPageDetailComponent,
        RequestPageFilterComponent,
        Card,
        RequestPageTableComponent,
        Panel,
    ],
})
export class RequestPageComponent extends AsyncDestroyable implements OnDestroy, OnInit {
    private requestService = inject(RequestService);
    private activeRoute = inject(ActivatedRoute);

    private workflowFilterService = inject(WorkflowFilterService);
    private visualizeConfigService = inject(VisualizeConfigService);

    selectedRequest: WMPRequest | undefined;

    constructor() {
        super();
        this.subscribeWithDestroyHandler(
            this.requestService.selectedRequest$,
            (value) => (this.selectedRequest = value),
        );
        this.visualizeConfigService.updateConfigForPage(VISUAL_PAGE_TYPE.REQUEST);
    }

    ngOnInit(): void {
        const routeSnapshot = this.activeRoute.snapshot;
        const requestID = getDataFromSnapshot(routeSnapshot, "id");
        if (requestID !== undefined) {
            //trigger workflow filter update
            this.workflowFilterService.mergeFilterAndUpdate({requestId: requestID});
        }
    }

    ngOnDestroy(): void {
        this.destroy();
    }
}
