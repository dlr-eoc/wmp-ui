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
import {ToggleSwitch, ToggleSwitchChangeEvent} from "primeng/toggleswitch";
import {SharedModule} from "src/app/shared/shared.module";
import {SelectChangeEvent} from "primeng/select";
import {ProcessBridgeService} from "src/app/app-pages/bridge/service/process-bridge.service";
import {AsyncDestroyable} from "src/app/utils/AsyncDestroyable";
import {InfoConfigElement} from "src/app/shared/services/user/models/VisualizeConfigData";
import {AutoComplete, AutoCompleteCompleteEvent, AutoCompleteSelectEvent} from "primeng/autocomplete";
import {notEmpty} from "src/app/utils/ArrayUtils";
import {ProcessBridgeModel, WMPProcessBridgeDataDto} from "src/app/app-pages/bridge/models/WMPBridge";

@Component({
    selector: "app-process-bridge-detail",
    imports: [ToggleSwitch, SharedModule, AutoComplete],
    templateUrl: "./process-bridge-detail.component.html",
    styleUrl: "./process-bridge-detail.component.scss",
})
export class ProcessBridgeDetailComponent extends AsyncDestroyable implements OnDestroy {
    private processBridgeService = inject(ProcessBridgeService);

    checked: boolean = false;
    availableBridges: WMPProcessBridgeDataDto[] = [];
    suggestionsBridges: WMPProcessBridgeDataDto[] = [];
    selectedBridge: WMPProcessBridgeDataDto | undefined = undefined;

    processBridgeModels: ProcessBridgeModel[] = [];
    suggestionsModels: ProcessBridgeModel[] = [];
    selectedBridgeModel: ProcessBridgeModel | undefined = undefined;

    activityConf = input.required<undefined | InfoConfigElement>();
    incidentConf = input.required<undefined | InfoConfigElement>();

    constructor() {
        super();
        this.subscribeWithDestroyHandler(this.processBridgeService.selectedProcessBridge$, (value) => {
            this.selectedBridge = value;
            this.checked = value?.configContainer?.config?.enabled ?? false;
        });
        this.subscribeWithDestroyHandler(this.processBridgeService.processBridges$, (value) => {
            this.availableBridges = value;
            this.suggestionsBridges = value;
        });
        this.subscribeWithDestroyHandler(this.processBridgeService.processBridgeModels$, (value) => {
            this.processBridgeModels = value;
            this.suggestionsModels = value;
        });
        this.subscribeWithDestroyHandler(this.processBridgeService.selectedModelProcessBridge$, (value) => {
            this.selectedBridgeModel = value;
        });
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    handleChangeProcessBridgeActive = ($event: ToggleSwitchChangeEvent) => {
        this.processBridgeService.updatedEnableOfCurrentBridge($event.checked);
    };

    handleBridgeChange($event: SelectChangeEvent) {
        this.processBridgeService.selectProcessBridge($event.value as WMPProcessBridgeDataDto);
    }

    handleBridgeModelChange($event: AutoCompleteSelectEvent) {
        this.processBridgeService.selectProcessBridgeModel($event.value as ProcessBridgeModel);
    }

    handeBridgeSearch($event: AutoCompleteCompleteEvent) {
        // console.debug($event);
        const query = $event.query;
        if (query && query !== "") {
            this.suggestionsBridges = this.availableBridges
                .map((bridge) => {
                    if (bridge.name.includes(query)) {
                        return bridge;
                    }
                    return undefined;
                })
                .filter(notEmpty);
        } else {
            this.suggestionsBridges = [...this.availableBridges];
        }
    }

    handeBridgeModelSearch($event: AutoCompleteCompleteEvent) {
        const query = $event.query;
        if (query && query !== "") {
            this.suggestionsModels = this.processBridgeModels
                .map((model) => {
                    if (model.modelName.includes(query)) {
                        return model;
                    }
                    return undefined;
                })
                .filter(notEmpty);
        } else {
            this.suggestionsModels = [...this.processBridgeModels];
        }
    }
}
