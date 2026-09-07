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

import {WmpApiService} from "src/app/shared/services/wmp-api/wmp-api.service";
import {WorkflowFilterProcessDefinition} from "src/app/components/workflow-page/service/workflow-filter.service";

export async function getProcessDefinition(
    api: WmpApiService,
    processDefinitionId: string | undefined,
): Promise<undefined | WorkflowFilterProcessDefinition> {
    if (processDefinitionId) {
        const selectedProcessDefinition = await api.getProcessDefinition(processDefinitionId);
        if (selectedProcessDefinition?.id && selectedProcessDefinition?.key) {
            return {
                id: selectedProcessDefinition.id,
                key: selectedProcessDefinition.key,
                version: selectedProcessDefinition.version,
            } satisfies WorkflowFilterProcessDefinition;
        }
    }
    return undefined;
}
