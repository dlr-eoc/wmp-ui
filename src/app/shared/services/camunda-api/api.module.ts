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

import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Configuration } from 'src/app/shared/services/camunda-api/configuration';
import { HttpClient } from '@angular/common/http';

import { AuthorizationService } from 'src/app/shared/services/camunda-api/api/authorization.service';
import { BatchService } from 'src/app/shared/services/camunda-api/api/batch.service';
import { ConditionService } from 'src/app/shared/services/camunda-api/api/condition.service';
import { DecisionDefinitionService } from 'src/app/shared/services/camunda-api/api/decisionDefinition.service';
import { DecisionRequirementsDefinitionService } from 'src/app/shared/services/camunda-api/api/decisionRequirementsDefinition.service';
import { DeploymentService } from 'src/app/shared/services/camunda-api/api/deployment.service';
import { EngineService } from 'src/app/shared/services/camunda-api/api/engine.service';
import { EventSubscriptionService } from 'src/app/shared/services/camunda-api/api/eventSubscription.service';
import { ExecutionService } from 'src/app/shared/services/camunda-api/api/execution.service';
import { ExternalTaskService } from 'src/app/shared/services/camunda-api/api/externalTask.service';
import { FilterService } from 'src/app/shared/services/camunda-api/api/filter.service';
import { GroupService } from 'src/app/shared/services/camunda-api/api/group.service';
import { HistoricActivityInstanceService } from 'src/app/shared/services/camunda-api/api/historicActivityInstance.service';
import { HistoricBatchService } from 'src/app/shared/services/camunda-api/api/historicBatch.service';
import { HistoricDecisionDefinitionService } from 'src/app/shared/services/camunda-api/api/historicDecisionDefinition.service';
import { HistoricDecisionInstanceService } from 'src/app/shared/services/camunda-api/api/historicDecisionInstance.service';
import { HistoricDecisionRequirementsDefinitionService } from 'src/app/shared/services/camunda-api/api/historicDecisionRequirementsDefinition.service';
import { HistoricDetailService } from 'src/app/shared/services/camunda-api/api/historicDetail.service';
import { HistoricExternalTaskLogService } from 'src/app/shared/services/camunda-api/api/historicExternalTaskLog.service';
import { HistoricIdentityLinkLogService } from 'src/app/shared/services/camunda-api/api/historicIdentityLinkLog.service';
import { HistoricIncidentService } from 'src/app/shared/services/camunda-api/api/historicIncident.service';
import { HistoricJobLogService } from 'src/app/shared/services/camunda-api/api/historicJobLog.service';
import { HistoricProcessDefinitionService } from 'src/app/shared/services/camunda-api/api/historicProcessDefinition.service';
import { HistoricProcessInstanceService } from 'src/app/shared/services/camunda-api/api/historicProcessInstance.service';
import { HistoricTaskInstanceService } from 'src/app/shared/services/camunda-api/api/historicTaskInstance.service';
import { HistoricUserOperationLogService } from 'src/app/shared/services/camunda-api/api/historicUserOperationLog.service';
import { HistoricVariableInstanceService } from 'src/app/shared/services/camunda-api/api/historicVariableInstance.service';
import { HistoryCleanupService } from 'src/app/shared/services/camunda-api/api/historyCleanup.service';
import { IdentityService } from 'src/app/shared/services/camunda-api/api/identity.service';
import { IncidentService } from 'src/app/shared/services/camunda-api/api/incident.service';
import { JobService } from 'src/app/shared/services/camunda-api/api/job.service';
import { JobDefinitionService } from 'src/app/shared/services/camunda-api/api/jobDefinition.service';
import { MessageService } from 'src/app/shared/services/camunda-api/api/message.service';
import { MetricsService } from 'src/app/shared/services/camunda-api/api/metrics.service';
import { MigrationService } from 'src/app/shared/services/camunda-api/api/migration.service';
import { ModificationService } from 'src/app/shared/services/camunda-api/api/modification.service';
import { ProcessDefinitionService } from 'src/app/shared/services/camunda-api/api/processDefinition.service';
import { ProcessInstanceService } from 'src/app/shared/services/camunda-api/api/processInstance.service';
import { SchemaLogService } from 'src/app/shared/services/camunda-api/api/schemaLog.service';
import { SignalService } from 'src/app/shared/services/camunda-api/api/signal.service';
import { TaskService } from 'src/app/shared/services/camunda-api/api/task.service';
import { TaskAttachmentService } from 'src/app/shared/services/camunda-api/api/taskAttachment.service';
import { TaskCommentService } from 'src/app/shared/services/camunda-api/api/taskComment.service';
import { TaskIdentityLinkService } from 'src/app/shared/services/camunda-api/api/taskIdentityLink.service';
import { TaskLocalVariableService } from 'src/app/shared/services/camunda-api/api/taskLocalVariable.service';
import { TaskVariableService } from 'src/app/shared/services/camunda-api/api/taskVariable.service';
import { TelemetryService } from 'src/app/shared/services/camunda-api/api/telemetry.service';
import { TenantService } from 'src/app/shared/services/camunda-api/api/tenant.service';
import { UserService } from 'src/app/shared/services/camunda-api/api/user.service';
import { VariableInstanceService } from 'src/app/shared/services/camunda-api/api/variableInstance.service';
import { VersionService } from 'src/app/shared/services/camunda-api/api/version.service';

@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: []
})
export class ApiModule {
    public static forRoot(configurationFactory: () => Configuration): ModuleWithProviders<ApiModule> {
        return {
            ngModule: ApiModule,
            providers: [ { provide: Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: ApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
