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

import {HistoricVariableInstanceDto} from 'src/app/shared/services/camunda-api';
import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';
import {Observable, Subject} from 'rxjs';
import {BPMNParameter} from 'src/app/components/process-instance-page/components/process-instance-page/process-instance-tab/process-instance-tab-bpmn-parameter.component';
import {getActivityNamesFromDocument} from 'src/app/utils/bpmn/BPMNFormatUtils';
import {AlertService} from 'src/app/shared/services/alert.service';

export class ProcessInstanceParameterService {
    private api: WmpApiService;
    private alertService: AlertService;

    private _activityNameMap: Subject<{[activityId: string]: string}> = new Subject(); // = {};
    private _bpmnParameters$: Subject<BPMNParameter[]> = new Subject(); // = [];
    private _bpmnParametersLoading: Subject<boolean> = new Subject(); // = true;
    private _processInstanceParameterMapping$: Subject<Map<string, Map<string, string>>> = new Subject(); // = new Map<string, Map<string, string>>();
    private _processInstanceVariablesLoading: Subject<boolean> = new Subject();
    private _processInstanceVariables$: Subject<HistoricVariableInstanceDto[]> = new Subject();

    constructor(api: WmpApiService, alertService: AlertService) {
        this.api = api;
        this.alertService = alertService;
    }

    async updateInstanceParameter(processInstanceId: string) {
        this._processInstanceVariablesLoading.next(true);
        this.api
            .getAllHistoricProcessInstanceVariables(processInstanceId)
            .then((data) => {
                this._processInstanceVariables$.next(data);
                this._processInstanceVariablesLoading.next(false);
            })
            .catch((_e) => {
                this.alertService.addWarning({text: 'Unable to retrieve ProcessInstanceParameter'});
                //case error
                this._processInstanceVariables$.next([]);
                this._processInstanceVariablesLoading.next(false);
            });
    }

    /**
     * This function updates bpmn parameters.
     * @param bpmnDocument the bpmnDocument to be used for updates
     */
    async updateBpmnParameterOfDocument(bpmnDocument: Document) {
        this._bpmnParametersLoading.next(true);

        const activityNameMap = getActivityNamesFromDocument(bpmnDocument);

        this._activityNameMap.next(activityNameMap);

        const parameterMap = await this.api.getParameterMapOfProcessDefinition(bpmnDocument);

        const bpmnParameters: BPMNParameter[] = [];
        Object.entries(parameterMap).forEach((entry) => {
            entry[1].inputs.forEach((input) => {
                bpmnParameters.push({
                    activityName: activityNameMap[entry[0]] || entry[0],
                    activityId: entry[0],
                    type: 'Input',
                    key: input.name,
                    value: input.value,
                });
            });

            entry[1].outputs.forEach((output) => {
                bpmnParameters.push({
                    activityName: activityNameMap[entry[0]] || entry[0],
                    activityId: entry[0],
                    type: 'Output',
                    key: output.name,
                    value: output.value,
                });
            });
        });
        this._bpmnParameters$.next(bpmnParameters);
        this._bpmnParametersLoading.next(false);

        const processInstanceParameterMapping: Map<string, Map<string, string>> = new Map<
            string,
            Map<string, string>
        >();
        bpmnParameters.forEach((parameter) => {
            if (processInstanceParameterMapping.has(parameter.activityName)) {
                processInstanceParameterMapping
                    .get(parameter.activityName)
                    ?.set(parameter.key, parameter.value);
            } else {
                processInstanceParameterMapping.set(
                    parameter.activityName,
                    new Map().set(parameter.key, parameter.value),
                );
            }
        });
        this._processInstanceParameterMapping$.next(processInstanceParameterMapping);
    }

    get activityNameMap(): Observable<{[p: string]: string}> {
        return this._activityNameMap.asObservable();
    }

    get bpmnParameters$(): Observable<BPMNParameter[]> {
        return this._bpmnParameters$.asObservable();
    }

    get bpmnParametersLoading(): Observable<boolean> {
        return this._bpmnParametersLoading.asObservable();
    }

    get processInstanceParameterMapping$(): Observable<Map<string, Map<string, string>>> {
        return this._processInstanceParameterMapping$.asObservable();
    }
    get processInstanceVariablesLoading(): Observable<boolean> {
        return this._processInstanceVariablesLoading.asObservable();
    }

    get processInstanceVariables$(): Observable<HistoricVariableInstanceDto[]> {
        return this._processInstanceVariables$.asObservable();
    }
}
