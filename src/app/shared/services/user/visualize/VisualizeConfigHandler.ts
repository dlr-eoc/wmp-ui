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
    InfoConfigElement,
    InfoVisualConfig,
    TableConfigElement,
    TableVisualConfig,
    VISUAL_CONFIGURATION_TYPE,
    VisualConfiguration,
} from "src/app/shared/services/user/models/VisualizeConfigData";

export class VisualizeConfigHandler {
    private config: Map<VISUAL_CONFIGURATION_TYPE, VisualConfiguration | undefined>;

    constructor(config: Map<VISUAL_CONFIGURATION_TYPE, VisualConfiguration | undefined>) {
        this.config = config;
    }

    getInfoConfigForComponent(componentId: string): InfoConfigElement | undefined {
        const configElement = this.getConfigForComponent(VISUAL_CONFIGURATION_TYPE.INFO, componentId);
        //assure to correctly convert element to use it correctly in components
        return configElement ? (configElement as InfoConfigElement) : undefined;
    }

    getConfigForComponent(type: VISUAL_CONFIGURATION_TYPE, componentId: string) {
        const configuration = this.config.get(type);
        if (!configuration) {
            return undefined;
        }
        const elementAsType = this.getConfigurationAsType(type, configuration);

        return [...elementAsType.configurations.values()].find((element) => {
            if (element && "componentId" in element) {
                if (element.componentId === componentId) {
                    return element;
                }
            }
            return undefined;
        });
    }

    public getConfigurationAsType(type: VISUAL_CONFIGURATION_TYPE, element: VisualConfiguration) {
        switch (type) {
            case VISUAL_CONFIGURATION_TYPE.INFO:
                return element as InfoVisualConfig;
            case VISUAL_CONFIGURATION_TYPE.TABLE:
                return element as TableVisualConfig;
            default:
                throw new Error(`Unknown type: ${type}`);
        }
    }
    public getConfigElementAsType(
        type: VISUAL_CONFIGURATION_TYPE,
        element: TableConfigElement | InfoConfigElement | undefined,
    ) {
        if (!element) {
            return undefined;
        }
        switch (type) {
            case VISUAL_CONFIGURATION_TYPE.INFO:
                return element as InfoConfigElement;
            case VISUAL_CONFIGURATION_TYPE.TABLE:
                return element as TableConfigElement;
            default:
                throw new Error(`Unknown type: ${type}`);
        }
    }
}
