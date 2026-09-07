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

import {ChangeDetectionStrategy, Component, inject, input, OnDestroy, OnInit, signal} from '@angular/core';
import {SituationViewModel} from 'src/app/shared/services/wmp-api/SituationViewModel';
import {ChartModule} from 'primeng/chart';
import {BpmnHandlerService} from 'src/app/shared/services/bpmn/bpmn-handler.service';
import {ClrLoadingModule} from '@clr/angular';
import {ProgressSpinner} from 'primeng/progressspinner';
import {DashboardDataService} from 'src/app/app-pages/dashboard/service/dashboard-data.service';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';

@Component({
    selector: 'app-situation-dashboard',
    templateUrl: './situation-dashboard.component.html',
    styleUrls: ['./situation-dashboard.component.scss'],
    imports: [ChartModule, ClrLoadingModule, ProgressSpinner],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SituationDashboardComponent extends AsyncDestroyable implements OnInit, OnDestroy {
    private dashboardDataService = inject(DashboardDataService);

    readonly bpmnHandlerService = input.required<BpmnHandlerService>();

    dataLookup = signal({} as Record<'request' | 'incident', Record<number, SituationViewModel[]>>);
    pieRequestsData = signal<any>(undefined);
    pieIncidentData = signal<any>(undefined);
    pieChartOptionsLegendLeftSide = signal<any>(undefined);
    pieChartOptionsLegendRight = signal<any>(undefined);

    handleSelectionRequest(event: any) {
        const elementsClickedFound = this.dataLookup()?.request[event.element.index][0];
        if (elementsClickedFound && elementsClickedFound.processDefinitionId) {
            this.bpmnHandlerService().workflowFilterService.mergeFilterAndUpdate({
                processDefinition: {
                    key: elementsClickedFound.processDefinitionId,
                    id: elementsClickedFound.processDefinitionId,
                },
            });
        }
    }
    handleSelectionIncident(event: any) {
        const elementClickedFound = this.dataLookup()?.incident[event.element.index][0];
        if (elementClickedFound && elementClickedFound.processDefinitionId) {
            this.bpmnHandlerService().workflowFilterService.mergeFilterAndUpdate({
                processDefinition: {
                    key: elementClickedFound.processDefinitionId,
                    id: elementClickedFound.processDefinitionId,
                },
            });
        }
    }

    async ngOnInit(): Promise<void> {
        this.updateChartStyles();
        this.subscribeWithDestroyHandler(this.dashboardDataService.situationViewModels$, (value) => {
            if (value) {
                this.updateChartData(value);
            }
        });
    }

    private updateChartData(viewModels: Record<string, SituationViewModel[]>) {
        let pieRequestsDataToUpdate = {labels: [] as string[], datasets: [{data: [] as number[]}]};
        let pieIncidentDataToUpdate = {labels: [] as string[], datasets: [{data: [] as number[]}]};
        let dataLookupToUpdate = {request: {}, incident: {}} as Record<
            'request' | 'incident',
            Record<number, SituationViewModel[]>
        >;
        let indexRequests = 0;
        let indexIncidents = 0;
        Object.keys(viewModels).forEach((processDefinition) => {
            const models = viewModels[processDefinition];
            let incidents = 0;
            let requests = 0;
            models.forEach((model) => {
                incidents += model.incidents ?? 0;
                requests += model.requests ?? 0;
            });

            const requestDataSet = pieRequestsDataToUpdate.datasets[0].data;
            const incidentDataSet = pieIncidentDataToUpdate.datasets[0].data;
            // const label = `${models} (v${viewModel.version})`;
            // const label = `${processDefinition}`;
            const label = `${models[0].workflowName}`;
            if (incidents > 0) {
                pieIncidentDataToUpdate.labels.push(label);
                incidentDataSet.push(incidents);
                dataLookupToUpdate['incident'][indexIncidents++] = models;
            }
            if (requests > 0) {
                pieRequestsDataToUpdate.labels.push(label);
                requestDataSet.push(requests);
                dataLookupToUpdate['request'][indexRequests++] = models;
            }
        });
        this.dataLookup.set(dataLookupToUpdate);
        this.pieRequestsData.set(pieRequestsDataToUpdate);
        this.pieIncidentData.set(pieIncidentDataToUpdate);
    }

    private updateChartStyles() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--clr-p1-color');
        this.pieChartOptionsLegendLeftSide.set({
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: false,
                        textColor: textColor,
                    },
                    position: 'left',
                },
                //TODO possible tooltip customization see https://www.chartjs.org/docs/latest/samples/tooltip/html.html
                // tooltip: {
                //     enabled: false,
                //     position: 'nearest',
                //     external: (context: any) => {
                //         const {chart, tooltip} = context;
                //         let tooltipEl = chart.canvas.parentNode.querySelector('div');
                //         tooltipEl = document.createElement('div');
                //         tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
                //         const table = document.createElement('table');
                //         table.style.margin = '0px';
                //         const test = document.createTextNode('Test');
                //         tooltipEl.appendChild(table);
                //         tooltipEl.appendChild(test);
                //         chart.canvas.parentNode.appendChild(tooltipEl);
                //         return '<div style="width: 40rem">TEST</div>';
                //     },
                // },
            },
        });
        this.pieChartOptionsLegendRight.set({
            ...this.pieChartOptionsLegendLeftSide,
            plugins: {legend: {position: 'right'}},
        });
    }

    ngOnDestroy(): void {
        super.destroy();
    }
}
