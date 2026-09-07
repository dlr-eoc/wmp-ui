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

import {Component, input, OnDestroy, OnInit, output} from '@angular/core';
import {FallbackPipe} from 'src/app/pipes/conversion.pipe';
import {TableComponent} from 'src/app/shared/components/table/table.component';
import {LOG_CONFIG_TABLES} from 'src/app/app-pages/ConfigValues';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {EMPTY_LOG_MESSAGE_DATA, LogMessageData} from 'src/app/app-pages/log/models/LogModels';
import {TableLazyLoadEvent, TableModule} from 'primeng/table';
import {Tooltip} from 'primeng/tooltip';
import {LogTableMessageComponent} from 'src/app/app-pages/log/components/log-table/log-table-message/log-table-message.component';
import {CdkCopyToClipboard} from '@angular/cdk/clipboard';
import {FormsModule} from '@angular/forms';
import {Panel} from 'primeng/panel';
import {DateISOStringPipe} from 'src/app/shared/pipes/date-iso.pipe';
import {Observable} from 'rxjs';
import {ColumnDefSortAndFilterable} from 'src/app/shared/components/table/data/TableTypes';
import {OFFSET_NUMBER_DEFAULT_LOG_PAGE} from 'src/app/app-pages/log/components/log-page.component';
import {WorkflowFilterSelectionGroupComponent} from 'src/app/shared/components/workflow/workflow-filter-selection-group/workflow-filter-selection-group.component';

@Component({
    selector: 'app-log-table',
    imports: [
        FallbackPipe,
        TableComponent,
        TableModule,
        Tooltip,
        LogTableMessageComponent,
        CdkCopyToClipboard,
        FormsModule,
        Panel,
        DateISOStringPipe,
        WorkflowFilterSelectionGroupComponent,
    ],
    templateUrl: './log-table.component.html',
    styleUrl: './log-table.component.scss',
})
export class LogTableComponent extends AsyncDestroyable implements OnDestroy, OnInit {
    $logDataUpdate = input.required<Observable<LogMessageData>>();
    $logColumns = input.required<ColumnDefSortAndFilterable[]>();
    isWidget = input(false);
    offsetLogTable = OFFSET_NUMBER_DEFAULT_LOG_PAGE;
    handleLazyLoad = output<TableLazyLoadEvent>();
    handleSetProcInId = output<string | undefined>();
    handleSetRequestId = output<string | undefined>();

    logs: LogMessageData = EMPTY_LOG_MESSAGE_DATA;

    constructor() {
        super();
    }
    ngOnInit(): void {
        this.subscribeWithDestroyHandler(this.$logDataUpdate(), (logMessages) => {
            this.logs = logMessages;
        });
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    protected readonly LOG_CONFIG_TABLES = LOG_CONFIG_TABLES;
}
