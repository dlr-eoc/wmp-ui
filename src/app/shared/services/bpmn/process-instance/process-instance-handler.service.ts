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

import {ProcessInstanceActivityService} from 'src/app/components/process-instance-page/service/process-instance-activity.service';
import {ProcessInstanceIncidentService} from 'src/app/components/process-instance-page/service/process-instance-incident.service';
import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';
import {AlertService} from 'src/app/shared/services/alert.service';
import {OperatonIncidentService} from 'src/app/shared/services/wmp-api/custom/operaton-incident.service';
import {WorkflowFilterServiceBase} from 'src/app/components/workflow-page/service/WorkflowFilterServiceBase';
import {ProcessInstanceVisualizationService} from 'src/app/components/process-instance-page/service/process-instance-visualization.service';
import {BpmnHandlerService} from 'src/app/shared/services/bpmn/bpmn-handler.service';
import {ProcessInstanceParameterService} from 'src/app/components/process-instance-page/service/process-instance-parameter.service';
import {WorkflowBpmnService} from 'src/app/app-pages/workflow-page/service/workflow-bpmn.service';
import {OperatonProcessDefinitionService} from 'src/app/shared/services/wmp-api/custom/operaton-process-definition.service';
import {OperatonHistoryService} from 'src/app/shared/services/api/operaton-history.service';
import {ProcessInstanceDataService} from 'src/app/app-pages/workflow-page/service/process/process-instance-data.service';
import {ProcessInstanceJobService} from 'src/app/components/process-instance-page/service/process-instance-job.service';

export class ProcessInstanceHandlerService {
    private readonly _processInstanceActivityService: ProcessInstanceActivityService;
    private readonly _processInstanceIncidentService: ProcessInstanceIncidentService;
    private readonly _processInstanceVisualizationService: ProcessInstanceVisualizationService;
    private readonly _processInstanceParameterService: ProcessInstanceParameterService;
    private readonly _workflowBpmnService: WorkflowBpmnService;
    private readonly _processInstanceDataService: ProcessInstanceDataService;
    private readonly _processInstanceJobService: ProcessInstanceJobService;

    constructor(
        wmpApiService: WmpApiService,
        workflowFilterService: WorkflowFilterServiceBase,
        alertService: AlertService,
        incidentService: OperatonIncidentService,
        processDefinitionService: OperatonProcessDefinitionService,
        bpmnHandler: BpmnHandlerService,
    ) {
        this._processInstanceActivityService = new ProcessInstanceActivityService(
            wmpApiService,
            workflowFilterService,
            alertService,
        );
        this._processInstanceIncidentService = new ProcessInstanceIncidentService(
            incidentService,
            workflowFilterService,
        );
        this._processInstanceVisualizationService = new ProcessInstanceVisualizationService(
            this._processInstanceIncidentService,
            this._processInstanceActivityService,
            bpmnHandler,
        );
        this._processInstanceParameterService = new ProcessInstanceParameterService(
            wmpApiService,
            alertService,
        );
        const historyService = new OperatonHistoryService(
            wmpApiService,
            processDefinitionService,
            bpmnHandler.bpmnOverlayStorage,
        );
        this._workflowBpmnService = new WorkflowBpmnService(
            this._processInstanceParameterService,
            this._processInstanceVisualizationService,
            bpmnHandler,
            historyService,
        );
        this._processInstanceJobService = new ProcessInstanceJobService(wmpApiService);
        this._processInstanceDataService = new ProcessInstanceDataService(
            wmpApiService,
            this._processInstanceParameterService,
            this._processInstanceJobService,
            this._processInstanceIncidentService,
            this._processInstanceActivityService,
            alertService,
            this._workflowBpmnService,
        );
    }

    get processInstanceActivityService(): ProcessInstanceActivityService {
        return this._processInstanceActivityService;
    }

    get processInstanceIncidentService(): ProcessInstanceIncidentService {
        return this._processInstanceIncidentService;
    }

    get processInstanceVisualizationService(): ProcessInstanceVisualizationService {
        return this._processInstanceVisualizationService;
    }

    get processInstanceParameterService(): ProcessInstanceParameterService {
        return this._processInstanceParameterService;
    }

    get workflowBpmnService(): WorkflowBpmnService {
        return this._workflowBpmnService;
    }

    get processInstanceDataService(): ProcessInstanceDataService {
        return this._processInstanceDataService;
    }

    get processInstanceJobService(): ProcessInstanceJobService {
        return this._processInstanceJobService;
    }

    /**
     * Destroying services with available handling.
     */
    destroy() {
        this._workflowBpmnService.destroy();
        this._processInstanceIncidentService.destroy();
        this._processInstanceVisualizationService.destroy();
        this._workflowBpmnService.destroy();
    }

    clearHandler() {
        this.destroy();
        //TODO check possible resets needed
    }
}
