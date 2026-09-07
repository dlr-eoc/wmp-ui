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

import {convertStatisticsToLabels} from 'src/app/utils/bpmn/bpmn-overlay.utils';
import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';
import {WorkflowFilter} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {OperatonProcessDefinitionService} from 'src/app/shared/services/wmp-api/custom/operaton-process-definition.service';
import {BpmnOverlayStorage} from 'src/app/shared/services/bpmn/overlay/storage/bpmn-overlay.storage';

export class OperatonHistoryService {
    private bpmnOverlayStorageService: BpmnOverlayStorage;
    private wmpApiService: WmpApiService;
    private processDefinitionService: OperatonProcessDefinitionService;

    constructor(
        wmpApiService: WmpApiService,
        processDefinitionService: OperatonProcessDefinitionService,
        bpmnOverlayStorageService: BpmnOverlayStorage,
    ) {
        this.wmpApiService = wmpApiService;
        this.processDefinitionService = processDefinitionService;
        this.bpmnOverlayStorageService = bpmnOverlayStorageService;
    }

    /**
     * This function creates labels from given workflow filter date range if present.
     * Else all labels.
     * @param filter
     * @param bpmnDocument
     */
    async updateLabelsFromProcessDefinition(filter: WorkflowFilter, bpmnDocument: Document) {
        // Labels in BPMN
        const dateRange = filter.dateRange;
        if (dateRange && dateRange.presetName !== 'custom') {
            throw new Error('Not implemented case for non custom date ranges for label generation.');
        }
        const processDefinitionId = filter.processDefinition?.id;
        if (processDefinitionId) {
            const processDefinitionHistoryStatistics =
                await this.wmpApiService.getHistoryProcessInstanceStatisticsByProcessDefinition(
                    processDefinitionId,
                );

            //date range is added to the request, but just the historic labels
            // are created for the given time range; Maybe other data needed from api?
            const from = dateRange?.from;
            const to = dateRange?.to;

            //this is a custom call in backend.
            // Using from- and to- filter to directly filter in backend-sql-query
            // to assure only in range data is shown
            const activityHistoryStatistics =
                await this.wmpApiService.getHistoryActivityInstanceStatisticsByProcessDefinition(
                    processDefinitionId,
                    from ? from : new Date(0),
                    to ? to : new Date(),
                );

            // no filter for date is used but incident data is available
            const activityInstanceStatistics =
                await this.processDefinitionService.getProcessDefinitionStatistics(processDefinitionId);

            if (activityInstanceStatistics) {
                const labels = convertStatisticsToLabels(
                    bpmnDocument,
                    activityInstanceStatistics,
                    processDefinitionHistoryStatistics,
                    activityHistoryStatistics,
                );

                if (filter.showHistoricLabels) {
                    this.bpmnOverlayStorageService.updateLabels(labels);
                } else {
                    this.bpmnOverlayStorageService.updateLabels(labels.filter((label) => !label.historic));
                }
            }
        }
    }
}
