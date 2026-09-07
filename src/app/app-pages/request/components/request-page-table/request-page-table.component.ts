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
import {AsyncDestroyable} from "src/app/utils/AsyncDestroyable";
import {TableLazyLoadEvent, TableModule} from "primeng/table";
import {AsyncPipe} from "@angular/common";
import {TableComponent} from "src/app/shared/components/table/table.component";
import {WMPRequest} from "src/app/app-pages/request/models/WMPRequest";
import {REQUEST_COLUMNS_DEFAULT, RequestFilter} from "src/app/components/utils/table/request.utils";
import {RequestFailureType, RequestService} from "src/app/app-pages/request/service/request.service";
import {ColumnDefSortAndFilterable} from "src/app/shared/components/table/data/TableTypes";
import {getSortingFromPrimeNGTableState} from "src/app/components/utils/table/workflow.filter.utils";
import {RequestFilterService} from "src/app/app-pages/request/service/request-filter.service";
import {PAGE_CONFIG_IDENTIFIER, REQUEST_CONFIG_TABLES} from "src/app/app-pages/ConfigValues";
import {TableConfigService} from "src/app/shared/services/user/visualize/table-config.service";
import {
    COLOR_INCIDENT_WITH_OPACITY,
    COLOR_TERMINATED_WITH_OPACITY,
} from "src/app/shared/components/bpmn-diagram/bpmn-diagram.utils";
import {FallbackPipe} from "src/app/pipes/conversion.pipe";
import {WorkflowFilterService} from "src/app/components/workflow-page/service/workflow-filter.service";

@Component({
    selector: "app-request-page-table",
    imports: [TableModule, TableComponent, AsyncPipe, FallbackPipe],
    templateUrl: "./request-page-table.component.html",
    styleUrl: "./request-page-table.component.scss",
})
export class RequestPageTableComponent extends AsyncDestroyable implements OnDestroy {
    private requestService = inject(RequestService);
    private requestFilterService = inject(RequestFilterService);
    private tableConfigService = inject(TableConfigService);
    private workflowFilterService = inject(WorkflowFilterService);

    availableRequests: WMPRequest[] = [];

    columnsOfTable: ColumnDefSortAndFilterable[] = REQUEST_COLUMNS_DEFAULT;

    totalAvailableRequests = this.requestService.requestCount$;
    failures: Map<RequestFailureType, Map<string, boolean>> | undefined = undefined;

    constructor() {
        super();
        this.subscribeWithDestroyHandler(this.requestService.requests$, (value) => {
            this.availableRequests = value;
        });
        this.subscribeWithDestroyHandler(this.tableConfigService.tableColumns$, (columns) => {
            const columnsLocallyStored = columns.get(PAGE_CONFIG_IDENTIFIER.REQUEST);
            if (columnsLocallyStored) {
                const convertedColumns = columnsLocallyStored.map((columnIdentifier) => {
                    return {
                        field: columnIdentifier,
                        header: columnIdentifier,
                        customColumn: true,
                    } satisfies ColumnDefSortAndFilterable;
                });
                this.columnsOfTable = [...REQUEST_COLUMNS_DEFAULT, ...convertedColumns];
            }
        });
        this.subscribeWithDestroyHandler(this.requestService.requestFailures$, (value) => {
            this.failures = value;
        });
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    handleSelectionChange(selection: WMPRequest | undefined) {
        this.workflowFilterService.mergeFilterAndUpdate({requestId: selection?.id});
    }

    handleLazyLoad($event: TableLazyLoadEvent) {
        const entries = $event.first ?? 10;
        const numberOfRows = $event.rows ?? 10;

        const sortingFromPrimeNGTableState = getSortingFromPrimeNGTableState($event);
        this.requestFilterService.mergeFilter({
            page: entries / numberOfRows + 1,
            pageSize: numberOfRows,
            //TODO sorting not implemented completely, see RequestFilter interface
            sorting: sortingFromPrimeNGTableState ? sortingFromPrimeNGTableState : undefined,
        } as RequestFilter);
    }

    getFromRequestAttributes(column: ColumnDefSortAndFilterable, entry: WMPRequest) {
        return entry.requestAttributes[column.field];
    }

    protected readonly REQUEST_CONFIG_TABLES = REQUEST_CONFIG_TABLES;
    protected readonly COLOR_INCIDENT_WITH_OPACITY = COLOR_INCIDENT_WITH_OPACITY;
    protected readonly COLOR_TERMINATED_WITH_OPACITY = COLOR_TERMINATED_WITH_OPACITY;
    protected readonly RequestFailureType = RequestFailureType;
}
