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

import {Component, inject, input, OnDestroy} from "@angular/core";
import {ProcessBridgeService} from "src/app/app-pages/bridge/service/process-bridge.service";
import {TableModule} from "primeng/table";
import {ClrIconModule} from "@clr/angular";
import {BridgeConfigAsKeyValue, BridgeParameter} from "src/app/app-pages/bridge/models/WMPBridge";
import {AsyncDestroyable} from "src/app/utils/AsyncDestroyable";
import {TableComponent} from "src/app/shared/components/table/table.component";
import {ColumnDefSortAndFilterable} from "src/app/shared/components/table/data/TableTypes";
import {PROCESS_BRIDGE_CONFIG_COLUMNS_DEFAULT} from "src/app/app-pages/bridge/components/process-bridge/process-bridge-config-data/ProcessBridgeConfigUtils";
import {KeyValue, KeyValuePipe} from "@angular/common";
import {Button} from "primeng/button";
import {Divider} from "primeng/divider";
import {Splitter} from "primeng/splitter";

@Component({
    selector: "app-process-bridge-config-table",
    imports: [TableModule, ClrIconModule, TableComponent, KeyValuePipe, Button, Divider, Splitter],
    templateUrl: "./process-bridge-config-table.component.html",
    styleUrl: "./process-bridge-config-table.component.scss",
})
export class ProcessBridgeConfigTableComponent extends AsyncDestroyable implements OnDestroy {
    private processBridgeService = inject(ProcessBridgeService);

    config: BridgeConfigAsKeyValue = {};
    isBridgeConfig = input.required<boolean>();
    bridgeParameters: BridgeParameter[] = [];
    bridgeParameterKeys: string[] = [];

    columnsOfTable: ColumnDefSortAndFilterable[] = PROCESS_BRIDGE_CONFIG_COLUMNS_DEFAULT;

    constructor() {
        super();
        this.subscribeWithDestroyHandler(this.processBridgeService.selectedProcessBridge$, (value) => {
            if (value) {
                const config = value.configContainer.config;
                this.bridgeParameters = Object.keys(config).map((key: string) => {
                    const keyOfConfig = key as keyof typeof config;
                    return {
                        name: keyOfConfig + "",
                        value: config[keyOfConfig] + "",
                    } satisfies BridgeParameter;
                });
                this.bridgeParameterKeys = this.bridgeParameters.map((value) => value.name);
                this.config = Object.keys(config).reduce((previousValue, currentValue) => {
                    return {...previousValue, [currentValue]: config[currentValue]};
                }, {} as BridgeConfigAsKeyValue);
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    addAttributeToTable(attribute: KeyValue<string, string>) {
        this.bridgeParameters.push({name: attribute.key, value: attribute.value});
        this.bridgeParameterKeys.push(attribute.key);
        //maybe use table config later
        // this.tableConfigService.addTableColumn(PAGE_CONFIG_IDENTIFIER.REQUEST, attribute.key);
    }
    removeAttribute(attribute: KeyValue<string, string>) {
        this.bridgeParameters = this.bridgeParameters.filter((value) => value.name !== attribute.key);
        this.bridgeParameterKeys = this.bridgeParameterKeys.filter((value) => value !== attribute.key);
    }

    getFromRequestAttributes(column: ColumnDefSortAndFilterable, entry: BridgeParameter) {
        return entry.value;
    }
}
