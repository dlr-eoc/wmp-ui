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

import {inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot} from '@angular/router';
import {
    buildInitialWorkflowFilter,
    getDataFromSnapshot,
} from 'src/app/components/workflow-page/workflow.utils';
import {getProcessDefinition} from 'src/app/utils/bpmn/process.utils';
import {
    WorkflowFilterActivity,
    WorkflowFilterService,
} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {getActivityFilter} from 'src/app/utils/bpmn/activity.utils';
import {filterNotEmptyElementsObject} from 'src/app/utils/ObjectUtils';
import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';
import {
    BpmnManagerService,
    WORKFLOWS_BPMN_IDENTIFIER,
} from 'src/app/shared/services/bpmn/bpmn-manager.service';

@Injectable({
    providedIn: 'root',
})
export class WorkflowUrlService {
    private wmpApiService = inject(WmpApiService);
    private workflowFilterService = inject(WorkflowFilterService);
    private readonly bpmnHandler =
        inject(BpmnManagerService).getBpmnDiagramHandler(WORKFLOWS_BPMN_IDENTIFIER);
    private bpmnDocumentService = this.bpmnHandler.bpmnDocumentService;

    constructor() {}

    /**
     * This function searches the RouteSnapshot for
     * @param routeSnapshot
     */
    async setupWorkflowDataAndFilter(routeSnapshot: ActivatedRouteSnapshot) {
        const defaultPage: number = 1;
        const defaultPageSize: number = 10;
        const processDefinitionId = getDataFromSnapshot(routeSnapshot, 'processDefinitionId');
        const activityId = getDataFromSnapshot(routeSnapshot, 'activityId');

        const processDefinition = await getProcessDefinition(this.wmpApiService, processDefinitionId);

        let activity: undefined | WorkflowFilterActivity = undefined;
        if (processDefinitionId && activityId) {
            //if process definition defined, retrieve document to build oldFilter from activity id given
            const bpmnDocument = await this.bpmnDocumentService.retrieveDocumentFromPDId(processDefinitionId);
            activity = getActivityFilter(bpmnDocument, activityId);
        }

        return buildInitialWorkflowFilter(
            routeSnapshot,
            defaultPageSize,
            defaultPage,
            activity,
            processDefinition,
        ).then((filter) => {
            const filterWithoutEmptyElements = filterNotEmptyElementsObject(filter);
            //override oldFilter, triggers an updateOnPage data of workflows

            this.workflowFilterService.mergeFilterAndUpdate({
                ...filterWithoutEmptyElements,
            });
        });
    }
}
