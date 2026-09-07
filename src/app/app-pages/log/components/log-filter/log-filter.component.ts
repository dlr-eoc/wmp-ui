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

import {Component, inject, input, OnDestroy, OnInit, output} from "@angular/core";
import {AsyncDestroyable} from "src/app/utils/AsyncDestroyable";
import {ClrCommonFormsModule} from "@clr/angular";
import {FloatLabel} from "primeng/floatlabel";
import {InputText} from "primeng/inputtext";
import {Button} from "primeng/button";
import {AutoComplete, AutoCompleteCompleteEvent} from "primeng/autocomplete";
import {MultiSelect} from "primeng/multiselect";
import {LOGS_COLUMNS_DEFAULT} from "src/app/app-pages/log/utils/log.utils";
import {LogService} from "src/app/app-pages/log/service/log.service";
import {LogFilter} from "src/app/app-pages/log/models/LogModels";
import {Observable} from "rxjs";
import {ColumnDefSortAndFilterable} from "src/app/shared/components/table/data/TableTypes";
import {FormsModule} from "@angular/forms";
import {WorkflowFilterService} from "src/app/components/workflow-page/service/workflow-filter.service";

@Component({
    selector: "app-log-filter",
    imports: [ClrCommonFormsModule, FloatLabel, InputText, Button, AutoComplete, MultiSelect, FormsModule],
    templateUrl: "./log-filter.component.html",
    styleUrl: "./log-filter.component.scss",
})
export class LogFilterComponent extends AsyncDestroyable implements OnDestroy, OnInit {
    private logService = inject(LogService);
    private workflowFilterService = inject(WorkflowFilterService);

    logFilter$ = input.required<Observable<LogFilter | undefined>>();
    logColumns$ = input.required<Observable<ColumnDefSortAndFilterable[]>>();
    isWidget = input<boolean>(false);
    handleSubmit = output<LogFilter | undefined>();

    processInstanceId: string = "";
    requestId: string = "";
    logLevels = ["ERROR", "WARN", "INFO", "DEBUG"];
    currentLogLevels = [...this.logLevels];
    selectedLogLevel: string = "";
    protected selectedColumns = LOGS_COLUMNS_DEFAULT;
    activityInstanceId: string | undefined = undefined;

    constructor() {
        super();
    }

    ngOnInit(): void {
        this.subscribeWithDestroyHandler(this.logFilter$(), (filter) => {
            this.selectedLogLevel = filter?.logLevel ?? "";
        });
        this.subscribeWithDestroyHandler(this.workflowFilterService.filter$, (filter) => {
            this.processInstanceId = filter?.processInstanceId ?? "";
            this.activityInstanceId = filter?.activity?.activityInstance?.id ?? "";
            this.requestId = filter?.requestId ?? "";
        });
        this.subscribeWithDestroyHandler(this.logColumns$(), (value) => (this.selectedColumns = value));
    }

    submit() {
        const logFilter = {
            processInstanceId: this.processInstanceId !== "" ? this.processInstanceId : undefined,
            requestId: this.requestId !== "" ? this.requestId : undefined,
            logLevel: this.selectedLogLevel !== "" ? this.selectedLogLevel : undefined,
        } as Partial<LogFilter>;
        if (this.activityInstanceId === undefined) {
            //remove activity instance if cleared
            this.workflowFilterService.mergeFilter({activity: undefined});
        }
        this.handleSubmit.emit(logFilter);
    }
    resetForm() {
        if (!this.isWidget()) {
            this.processInstanceId = "";
            this.requestId = "";
            this.activityInstanceId = undefined; //set to undefined - remove in filter
        }
        this.selectedLogLevel = "";
        this.currentLogLevels = [...this.logLevels];
    }

    searchForType($event: AutoCompleteCompleteEvent) {
        if ($event.query === "") {
            this.currentLogLevels = [...this.logLevels];
        } else {
            this.currentLogLevels = this.logLevels.filter((type) => type.includes($event.query));
        }
    }

    changeColumnSelection() {
        this.logService.updateColumns(this.selectedColumns);
    }

    ngOnDestroy(): void {
        super.destroy();
    }

    protected readonly columnsOfTable = LOGS_COLUMNS_DEFAULT;
}
