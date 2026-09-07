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

import {MenuItem} from "primeng/api";
import {HistoricProcessInstance} from "src/app/components/workflow-page/models/HistoricProcessInstance";

export enum JOB_ACTION_LABEL {
    RETRY = "Retry",
    SUSPEND = "Suspend",
    ACTIVATE = "Resume",
    TERMINATE = "Terminate",
}
export function getWorkflowTableMenuItems(instance: HistoricProcessInstance) {
    const updatedItems = {...WORKFLOW_COLUMN_MENU_ITEMS[0]};

    if (["SUSPENDED", "EXTERNALLY_TERMINATED", "COMPLETED"].indexOf(instance.state || "") > -1) {
        updatedItems.items = updateItemsDisable(updatedItems.items ?? [], JOB_ACTION_LABEL.SUSPEND);
    }

    if (!instance.incidentJobId) {
        updatedItems.items = updateItemsDisable(updatedItems.items ?? [], JOB_ACTION_LABEL.RETRY);
    }

    if (instance.state != "SUSPENDED") {
        updatedItems.items = updateItemsDisable(updatedItems.items ?? [], JOB_ACTION_LABEL.ACTIVATE);
    }
    if (["EXTERNALLY_TERMINATED", "COMPLETED"].indexOf(instance.state || "") > -1) {
        updatedItems.items = updateItemsDisable(updatedItems.items ?? [], JOB_ACTION_LABEL.TERMINATE);
    }
    return [{...updatedItems}] satisfies MenuItem[];
}
function updateItemsDisable(currentItems: MenuItem[], labelToDisable: JOB_ACTION_LABEL) {
    return currentItems.map((item) => {
        if (item.label === labelToDisable) {
            const test = {...item};
            test.disabled = true;
            return test;
        }
        return {...item};
    });
}
export const WORKFLOW_COLUMN_MENU_ITEMS: MenuItem[] = [
    {
        label: "Actions",
        items: [
            {
                label: JOB_ACTION_LABEL.RETRY,
                icon: "pi pi-refresh",
            },
            {
                label: JOB_ACTION_LABEL.SUSPEND,
                icon: "pi pi-pause",
            },
            {
                label: JOB_ACTION_LABEL.ACTIVATE,
                icon: "pi pi-play",
            },
            {
                label: JOB_ACTION_LABEL.TERMINATE,
                icon: "pi pi-trash",
            },
        ] satisfies MenuItem[],
    },
] satisfies MenuItem[];
