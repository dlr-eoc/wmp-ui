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

import {ColumnDefSortAndFilterable} from "src/app/shared/components/table/data/TableTypes";

export const PROCESS_BRIDGE_INSTANCE_COLUMNS_DEFAULT: ColumnDefSortAndFilterable[] = [
    {field: "processDefinitionKey", header: "Process Key"},
    {field: "businessKey", header: "Request ID", isFilterable: true},
    {field: "id", header: "Process Instance", isFilterable: true},
    {field: "deploymentId", header: "Deployment Id"},
    {field: "state", header: "State", isFilterable: true, isSortable: true},
    {field: "startTime", header: "Start Time", isSortable: true},
    {field: "latestStartTime", header: "Last Activity Start", isSortable: true},
    {field: "latestEndTime", header: "Last Activity End", isSortable: true},
    {field: "incidentMessage", header: "Message"},
];
