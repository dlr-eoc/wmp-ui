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

import {Component, inject, OnDestroy} from '@angular/core';
import {LogFilterComponent} from 'src/app/app-pages/log/components/log-filter/log-filter.component';
import {LogTableComponent} from 'src/app/app-pages/log/components/log-table/log-table.component';
import {Panel} from 'primeng/panel';
import {LogFilter} from 'src/app/app-pages/log/models/LogModels';
import {LOGS_COLUMNS_DEFAULT} from 'src/app/app-pages/log/utils/log.utils';
import {LogService} from 'src/app/app-pages/log/service/log.service';
import {LogFilterService} from 'src/app/app-pages/log/service/log-filter.service';
import {TableLazyLoadEvent} from 'primeng/table';
import {getSortingFromPrimeNGTableState} from 'src/app/components/utils/table/workflow.filter.utils';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {WorkflowFilterService} from 'src/app/components/workflow-page/service/workflow-filter.service';

export const OFFSET_NUMBER_DEFAULT_LOG_PAGE = 10;

@Component({
    selector: 'app-log-page',
    imports: [LogFilterComponent, LogTableComponent, Panel],
    templateUrl: './log-page.component.html',
    styleUrl: './log-page.component.scss',
})
export class LogPageComponent extends AsyncDestroyable implements OnDestroy {
    logService = inject(LogService);
    logFilterService = inject(LogFilterService);
    private workflowFilterService = inject(WorkflowFilterService);

    protected columnsOfTable = LOGS_COLUMNS_DEFAULT;

    constructor() {
        super();

        this.subscribeWithDestroyHandler(
            this.logService.logColumns$,
            (value) => (this.columnsOfTable = value),
        );
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    handleSubmitFilter(logFilter: LogFilter | undefined) {
        if (logFilter) {
            this.workflowFilterService.mergeFilterAndUpdate({
                processInstanceId: logFilter.processInstanceId,
                requestId: logFilter.requestId,
            });
            this.logFilterService.mergeFilterAndUpdate({
                ...logFilter,
                offset: 0, //default offset
                pageSize: OFFSET_NUMBER_DEFAULT_LOG_PAGE,
            });
        }
    }

    handleLazyLoad($event: TableLazyLoadEvent) {
        const offset = $event.first ?? 0;
        const numberOfRows = $event.rows ?? OFFSET_NUMBER_DEFAULT_LOG_PAGE;

        //TODO use different sort from state, currently just "WorkflowFilterSortElement"
        const sortingFromPrimeNGTableState = getSortingFromPrimeNGTableState($event);

        this.logFilterService.mergeFilterAndUpdate({
            page: undefined, //backend uses offset instead of page
            offset: offset, //for log filter used offset
            pageSize: numberOfRows,
            //TODO sorting not implemented completely, see LogFilter interface
            sorting: sortingFromPrimeNGTableState ? sortingFromPrimeNGTableState : undefined,
        } as LogFilter);
    }

    handleSetProcInId(processInstanceId: string | undefined) {
        this.workflowFilterService.mergeFilter({processInstanceId: processInstanceId});
    }
    handleSetRequestId(requestId: string | undefined) {
        this.workflowFilterService.mergeFilter({requestId: requestId});
    }
}
