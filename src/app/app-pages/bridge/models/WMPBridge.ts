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

export interface WMPBridge {
    name: string;
}

export interface BridgeParameter {
    name: string;
    value: string | boolean | number | null;
}
export interface BridgeConfigAsKeyValue {
    [key: string]: string;
}
export interface ProcessBridgeConfig {
    archiveName: string;
    enabled: boolean;
    //FIXME use correct emitterConfig type
    emitterConfig: undefined;
}

export interface ProcessBridgeConfigContainer {
    name: string;
    revision: number;
    configClass: string;
    config: ProcessBridgeConfig & BridgeConfigAsKeyValue;
}

export interface ProcessBridgeModelDto {
    name: string;
    content: string; //encoded base64
    path: string;
    lastModified: number;
}

export interface WMPProcessBridgeDataDto {
    name: string;
    configContainer: ProcessBridgeConfigContainer;
    models: Record<string, ProcessBridgeModelDto>;
}
export interface ProcessBridgeModel extends ProcessBridgeModelDto {
    modelName: string;
}
