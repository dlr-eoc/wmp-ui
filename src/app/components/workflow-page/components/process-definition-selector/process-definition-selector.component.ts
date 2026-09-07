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
import {HistoricIncidentDto, ProcessDefinitionDto} from "src/app/shared/services/camunda-api";
import {WmpApiService} from "src/app/shared/services/wmp-api/wmp-api.service";
import {ClarityModule} from "@clr/angular";
import {FormsModule} from "@angular/forms";
import {Panel} from "primeng/panel";
import {AutoComplete, AutoCompleteCompleteEvent, AutoCompleteSelectEvent} from "primeng/autocomplete";
import {notEmpty} from "src/app/utils/ArrayUtils";
import {SlicePipe} from "@angular/common";
import {Tooltip} from "primeng/tooltip";
import {WorkflowFilterService} from "src/app/components/workflow-page/service/workflow-filter.service";
import {AsyncDestroyable} from "src/app/utils/AsyncDestroyable";
import {Badge} from "primeng/badge";
import {Button} from "primeng/button";
import {Divider} from "primeng/divider";

type ProcessDefinitionIncidents = {
    definitionIncidents: Record<string, number>; //processDefinitionKey->number of incidents of total process definition
    versionIncidents: Record<string, number>; //version -> number of incidents
};
export interface ProcessDefinition {
    key: string;
    id: string;
    version: number;
}

@Component({
    selector: "app-process-definition-selector",
    templateUrl: "./process-definition-selector.component.html",
    styleUrls: ["./process-definition-selector.component.scss"],
    imports: [ClarityModule, FormsModule, Panel, AutoComplete, SlicePipe, Tooltip, Badge, Button, Divider],
})
export class ProcessDefinitionSelectorComponent extends AsyncDestroyable implements OnInit, OnDestroy {
    private api = inject(WmpApiService);
    private workflowFilterService = inject(WorkflowFilterService);

    processDefinitions: ProcessDefinitionDto[] = [];
    suggestionsProcessDefinitionKeys: string[] = [];
    processDefinitionKeys: string[] = [];

    selectedProcessDefinitionKey?: string | null;
    filteredProcessDefinitions: ProcessDefinitionDto[] = [];
    filteredProcessDefinitionSuggestions: ProcessDefinitionDto[] = [];
    selectedProcessDefinition?: ProcessDefinitionDto | null;
    showProcessDefinitionMenu: boolean = false;
    currentIncidents: ProcessDefinitionIncidents = {definitionIncidents: {}, versionIncidents: {}};
    processDefinitionIncidents: HistoricIncidentDto[] = [];

    processDefinitionId?: string;

    constructor() {
        super();
    }
    ngOnDestroy(): void {
        super.destroy();
    }

    async ngOnInit() {
        this.api
            .getHistoricIncidents()
            .then((incidents) => {
                this.processDefinitionIncidents = incidents;
            })
            .then(() => {
                this.refreshIncidents();
            })
            .then(() => {
                this.api.getProcessDefinitions().then((value) => {
                    const sortedProcessDefinitions = value.sort((a, b) => b.version - a.version);
                    this.processDefinitions = sortedProcessDefinitions; //first set process definitions, begin afterwards with listening on filter
                    this.subscribeWithDestroyHandler(this.workflowFilterService.filter$, (filter) => {
                        this.processDefinitionId = filter?.processDefinition?.id ?? undefined;
                        // Fill filter with input
                        if (this.processDefinitionId !== undefined) {
                            if (filter?.processDefinition?.key !== undefined) {
                                this.selectedProcessDefinitionKey = filter?.processDefinition?.key;
                                this.selectedProcessDefinition = this.processDefinitions.find(
                                    (pd) => pd.id === filter?.processDefinition?.id,
                                );
                            }
                            this.filteredProcessDefinitions = this.processDefinitions.filter(
                                (pd) => pd.key === this.selectedProcessDefinitionKey,
                            );
                            this.refreshIncidents();
                        } else {
                            //case no filter present - reset component
                            this.selectedProcessDefinitionKey = undefined;
                            this.selectedProcessDefinition = undefined;
                        }
                    });

                    const procDefs = this.processDefinitions
                        .map((pd) => pd.key)
                        .filter((k): k is string => {
                            return k !== undefined && k !== null;
                        });
                    this.processDefinitionKeys = [...new Set(procDefs)];
                    this.suggestionsProcessDefinitionKeys = this.processDefinitionKeys;

                    return sortedProcessDefinitions;
                });
            });
    }

    handleVersionAutocomplete(_$event: AutoCompleteCompleteEvent) {
        // this.filteredProcessDefinitions
        this.filteredProcessDefinitionSuggestions = [...this.filteredProcessDefinitions];
    }

    handleClearProcessDefinition() {
        this.selectedProcessDefinitionKey = undefined;
        this.selectedProcessDefinition = undefined;
        this.workflowFilterService.mergeFilterAndUpdate({
            processDefinition: undefined,
        });
    }

    handleProcessDefinitionAutocomplete($event: AutoCompleteCompleteEvent) {
        const query = $event.query;
        // this.selectedProcessDefinition = undefined; //deselect current process definition
        if (query && query !== "") {
            this.suggestionsProcessDefinitionKeys = this.processDefinitionKeys
                .map((key) => {
                    if (key.toLowerCase().includes(query.toLowerCase())) {
                        return key;
                    }
                    return undefined;
                })
                .filter(notEmpty);
        } else {
            this.suggestionsProcessDefinitionKeys = [...this.processDefinitionKeys];
        }
    }

    onProcessDefinitionChanged($event: AutoCompleteSelectEvent) {
        this.handleProcessDefinitionChanged($event.value as ProcessDefinitionDto);
    }

    onProcessDefinitionKeyChanged($event: AutoCompleteSelectEvent) {
        const selectedKey = $event.value as string;
        this.filteredProcessDefinitions = this.processDefinitions.filter((pd) => pd.key === selectedKey);

        if (this.filteredProcessDefinitions.length > 0) {
            this.selectedProcessDefinitionKey = selectedKey;
            //select the first one
            this.selectedProcessDefinition = this.filteredProcessDefinitions[0];
            this.handleProcessDefinitionChanged(this.selectedProcessDefinition);
        } else {
            this.selectedProcessDefinitionKey = selectedKey;
            this.selectedProcessDefinition = undefined;
            //possible warning here? should be an error, selecting a non present processDefinition
        }
        // this.onProcessDefinitionChanged({value: this.selectedProcessDefinition});
    }

    handleProcessDefinitionChanged(p: ProcessDefinitionDto) {
        let processDefinition = undefined;
        this.processDefinitionId = p?.id || undefined;
        if (p) {
            processDefinition = {key: p.key, id: p.id, version: p.version} satisfies ProcessDefinition;
        }
        //update filter, resulting in workflow-data.service update; some data needs to be always reset to
        //undefined on processDefinition selection
        this.workflowFilterService.mergeFilterAndUpdate({
            processDefinition: processDefinition,
            processInstanceId: undefined,
            activity: undefined,
            callActivity: undefined,
            sequenceFlow: undefined,
        });
    }

    refreshIncidents() {
        this.currentIncidents = this.processDefinitionIncidents.reduce(
            (acc, cur) => {
                const processDefinitionKey = cur.processDefinitionKey;
                if (processDefinitionKey) {
                    //case incident occurred at child - failedActivityId should be null
                    if (cur.failedActivityId === null) {
                        if (acc.definitionIncidents[processDefinitionKey] === undefined) {
                            acc.definitionIncidents[processDefinitionKey] = 0;
                        }

                        //add to definition +1
                        acc.definitionIncidents[processDefinitionKey] += 1;

                        if (processDefinitionKey === this.selectedProcessDefinitionKey) {
                            const foundMatchingProcess = this.filteredProcessDefinitions.find(
                                (processDefinition) => processDefinition.id === cur.processDefinitionId,
                            );
                            if (foundMatchingProcess) {
                                if (acc.versionIncidents[foundMatchingProcess.version] === undefined) {
                                    acc.versionIncidents[foundMatchingProcess.version] = 0;
                                }
                                acc.versionIncidents[foundMatchingProcess.version] += 1;
                            }
                        }
                    }
                }

                return acc;
            },
            {definitionIncidents: {}, versionIncidents: {}} as ProcessDefinitionIncidents,
        );
    }

    resetSelectedProcessDefinition() {
        this.selectedProcessDefinitionKey = undefined;
        this.selectedProcessDefinition = undefined;
        this.filteredProcessDefinitions = [];
    }
}
