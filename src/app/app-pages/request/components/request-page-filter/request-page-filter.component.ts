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

import {Component, inject, OnDestroy} from "@angular/core";
import {RequestFilter} from "src/app/components/utils/table/request.utils";
import {TableConfigService} from "src/app/shared/services/user/visualize/table-config.service";
import {AsyncDestroyable} from "src/app/utils/AsyncDestroyable";
import {FloatLabel} from "primeng/floatlabel";
import {InputText} from "primeng/inputtext";
import {AutoCompleteCompleteEvent, AutoCompleteModule} from "primeng/autocomplete";
import {Button} from "primeng/button";
import {RequestFilterService} from "src/app/app-pages/request/service/request-filter.service";
import {PAGE_CONFIG_IDENTIFIER} from "src/app/app-pages/ConfigValues";
import {WorkflowFilterService} from "src/app/components/workflow-page/service/workflow-filter.service";
import {FormsModule} from "@angular/forms";

@Component({
    selector: "request-page-filter",
    templateUrl: "./request-page-filter.component.html",
    styleUrl: "./request-page-filter.component.scss",
    imports: [FloatLabel, InputText, AutoCompleteModule, Button, FormsModule],
})
export class RequestPageFilterComponent extends AsyncDestroyable implements OnDestroy {
    private requestFilterService = inject(RequestFilterService);
    private workflowFilterService = inject(WorkflowFilterService);
    private tableConfigService = inject(TableConfigService);

    requestStatusTypes = ["Active", "Inactive", "Unknown"];
    currentStatusTypesSelectable = [...this.requestStatusTypes];
    selectedStatus: string = "";
    searchID: string = "";

    private requestFilter: RequestFilter | undefined = undefined;

    constructor() {
        super();

        this.subscribeWithDestroyHandler(this.workflowFilterService.filter$, (value) => {
            this.searchID = value?.requestId ?? "";
        });
        this.subscribeWithDestroyHandler(this.requestFilterService.filter$, (value) => {
            this.requestFilter = value;
            if (value?.state) {
                //store state from query params
                this.selectedStatus = value?.state ?? "";
            }
        });
    }

    ngOnDestroy(): void {
        super.destroy();
    }

    resetForm() {
        this.currentStatusTypesSelectable = [...this.requestStatusTypes];
        this.selectedStatus = "";
        this.searchID = "";
        this.submit();
    }

    resetTableColumns() {
        this.tableConfigService.removeTableColumns(PAGE_CONFIG_IDENTIFIER.REQUEST);
        this.submit();
    }

    submit() {
        if (this.requestFilter) {
            //just update state of local requestFilter
            this.requestFilter.state = this.selectedStatus !== "" ? this.selectedStatus : undefined;
            //no update here yet, wait for workFlowFilterUpdate
            this.requestFilterService.overwriteFilter({...this.requestFilter});
            //update workflowFilter, assure to update afterward
            const requestId = this.searchID !== "" ? this.searchID : undefined;
            this.workflowFilterService.mergeFilterAndUpdate({
                requestId: requestId,
            });
        }
    }

    searchForType($event: AutoCompleteCompleteEvent) {
        if ($event.query === "") {
            this.currentStatusTypesSelectable = [...this.requestStatusTypes];
        } else {
            this.currentStatusTypesSelectable = this.requestStatusTypes.filter((type) =>
                type.includes($event.query),
            );
        }
    }
}
