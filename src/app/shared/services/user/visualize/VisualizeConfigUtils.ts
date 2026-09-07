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

import {
    InfoVisualConfig,
    TableVisualConfig,
    TableConfigElement,
    VISUAL_CONFIGURATION_TYPE,
    VisualConfiguration,
    InfoConfigElement,
} from "src/app/shared/services/user/models/VisualizeConfigData";

export function getTableVisualConfig(
    basicContentAsMap: Map<VISUAL_CONFIGURATION_TYPE, VisualConfiguration | undefined>,
) {
    const tableConfig = basicContentAsMap.get(VISUAL_CONFIGURATION_TYPE.TABLE) as
        | TableVisualConfig
        | undefined;
    if (!tableConfig) {
        return undefined;
    }
    return {
        configurationType: VISUAL_CONFIGURATION_TYPE.TABLE,
        configurations: new Map<string, TableConfigElement>(Object.entries(tableConfig?.configurations)),
    } as TableVisualConfig;
}

export function getInfoVisualConfig(
    basicContentAsMap: Map<VISUAL_CONFIGURATION_TYPE, VisualConfiguration | undefined>,
) {
    const infoConfig = basicContentAsMap.get(VISUAL_CONFIGURATION_TYPE.INFO) as InfoVisualConfig | undefined;
    if (!infoConfig) {
        return undefined;
    }
    return {
        configurationType: VISUAL_CONFIGURATION_TYPE.INFO,
        configurations: new Map<string, InfoConfigElement>(Object.entries(infoConfig?.configurations)),
    } as InfoVisualConfig;
}
