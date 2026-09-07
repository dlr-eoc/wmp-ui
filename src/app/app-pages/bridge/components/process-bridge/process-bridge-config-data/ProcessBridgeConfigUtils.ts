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

export const PROCESS_BRIDGE_CONFIG_COLUMNS_DEFAULT: ColumnDefSortAndFilterable[] = [
    {field: "name", header: "Name", isFilterable: true},
    {field: "value", header: "Value", isFilterable: true},
    // {field: "emitterConfig", header: "emitterConfig"},
];
