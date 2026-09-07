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

import {Component, inject, input, OnDestroy, OnInit} from '@angular/core';
import {LogTableComponent} from 'src/app/app-pages/log/components/log-table/log-table.component';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {ColumnDefSortAndFilterable} from 'src/app/shared/components/table/data/TableTypes';
import {TableLazyLoadEvent} from 'primeng/table';
import {getSortingFromPrimeNGTableState} from 'src/app/components/utils/table/workflow.filter.utils';
import {LogFilter} from 'src/app/app-pages/log/models/LogModels';
import {LogFilterComponent} from 'src/app/app-pages/log/components/log-filter/log-filter.component';
import {Observable} from 'rxjs';
import {Panel} from 'primeng/panel';
import {LogFilterService} from 'src/app/app-pages/log/service/log-filter.service';
import {LogService} from 'src/app/app-pages/log/service/log.service';

@Component({
    selector: 'app-log-widget',
    imports: [LogTableComponent, LogFilterComponent, Panel],
    templateUrl: './log-widget.component.html',
    styleUrl: './log-widget.component.scss',
})
export class LogWidgetComponent extends AsyncDestroyable implements OnDestroy, OnInit {
    logFilterService = inject(LogFilterService);
    logService = inject(LogService);
    $logColumns = input.required<Observable<ColumnDefSortAndFilterable[]>>();
    logColumns: ColumnDefSortAndFilterable[] = [];
    constructor() {
        super();
    }
    ngOnInit(): void {
        this.subscribeWithDestroyHandler(this.$logColumns(), (value) => (this.logColumns = value));
    }

    ngOnDestroy(): void {
        super.destroy();
    }
    handleSubmitFilter(logFilter: LogFilter | undefined) {
        if (logFilter) {
            //use loglevel in widget only, adjust for other data
            const partLogFilter = {logLevel: logFilter.logLevel} satisfies Partial<LogFilter>;
            this.logFilterService.mergeFilterAndUpdate(partLogFilter);
        }
    }
    handleLazyLoad($event: TableLazyLoadEvent) {
        const entries = $event.first ?? 10;
        const numberOfRows = $event.rows ?? 10;

        //TODO use different sort from state, currently just "WorkflowFilterSortElement"
        const sortingFromPrimeNGTableState = getSortingFromPrimeNGTableState($event);

        this.logFilterService.mergeFilterAndUpdate({
            page: undefined, //backend uses offset instead of page
            offset: entries, //for log filter used entries
            pageSize: numberOfRows,
            //TODO sorting not implemented completely, see LogFilter interface
            sorting: sortingFromPrimeNGTableState ? sortingFromPrimeNGTableState : undefined,
        } as LogFilter);
    }
}
