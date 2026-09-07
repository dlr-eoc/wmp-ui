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

import {inject, Injectable, OnDestroy} from '@angular/core';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {ConfigService} from 'src/app/shared/services/config.service';
import {HttpClient} from '@angular/common/http';
import {EMPTY_LOG_MESSAGE_DATA, LogFilter, LogMessageData} from 'src/app/app-pages/log/models/LogModels';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {LogFilterService} from 'src/app/app-pages/log/service/log-filter.service';
import {getLogFilterBody, LOGS_COLUMNS_DEFAULT} from 'src/app/app-pages/log/utils/log.utils';
import {ColumnDefSortAndFilterable} from 'src/app/shared/components/table/data/TableTypes';
import {
    WorkflowFilter,
    WorkflowFilterService,
} from 'src/app/components/workflow-page/service/workflow-filter.service';

@Injectable({
    providedIn: 'root',
})
/**
 * See logging.yml in folder for more information on spec.
 */
export class LogService extends AsyncDestroyable implements OnDestroy {
    private httpClient = inject(HttpClient);
    private configService = inject(ConfigService);
    private logFilterService = inject(LogFilterService);
    private workflowFilterService = inject(WorkflowFilterService);

    private readonly apiURL: string;
    private _logs$ = new BehaviorSubject<LogMessageData>(EMPTY_LOG_MESSAGE_DATA);
    private _logColumns$ = new BehaviorSubject(LOGS_COLUMNS_DEFAULT);
    private backendLogSubscription: undefined | Subscription;
    private logFilter: LogFilter | undefined = undefined;
    private workflowFilter: WorkflowFilter | undefined = undefined;

    constructor() {
        super();
        this.apiURL = this.configService.settings.jakartaURL;
        //TODO performance, optimize update from filter changes
        this.subscribeWithDestroyHandler(this.logFilterService.filter$, (filter) => {
            this.logFilter = filter;
            this.handleDataUpdate();
        });
        this.subscribeWithDestroyHandler(this.workflowFilterService.filter$, (filter) => {
            this.workflowFilter = filter;
            if (filter?.shouldUpdate) this.handleDataUpdate();
        });
    }

    private handleDataUpdate() {
        if (
            !this.logFilter ||
            !this.workflowFilter ||
            (!this.workflowFilter.shouldUpdate && !this.logFilter.shouldUpdate)
        ) {
            //TODO performance, possible optimization of data update, check logWidget/logPage where to update data
            //this.navigationService.isCurrentPageSameAs(APP_URL_WORKFLOWS)
            return; //insufficient data, don't update
        }

        //case sufficient data present start update
        this.loadDataAndUpdate(this.logFilter, this.workflowFilter);
    }

    private loadDataAndUpdate(filter: LogFilter, workflowFilter: WorkflowFilter) {
        if (this.backendLogSubscription)
            //unsubscribe old subscription before starting new one
            this.backendLogSubscription.unsubscribe();

        //FIXME 126 complete filter if working correctly
        this.backendLogSubscription = this.subscribeWithDestroyHandler(
            this.httpClient.put<LogMessageData>(
                `${this.apiURL}/wmp/log`,
                getLogFilterBody(filter, workflowFilter),
            ),
            (logMessages) => {
                this._logs$.next(logMessages);
            },
        );
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    updateColumns(columns: ColumnDefSortAndFilterable[]) {
        this._logColumns$.next(columns);
    }

    get logColumns$(): Observable<ColumnDefSortAndFilterable[]> {
        return this._logColumns$.asObservable();
    }

    get logs$(): Observable<LogMessageData> {
        return this._logs$.asObservable();
    }
}
