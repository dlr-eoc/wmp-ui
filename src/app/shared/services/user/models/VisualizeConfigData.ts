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

/**
 * This file contains DUMMY Values for the visualization configuration.
 * TODO visual configuration remove dummy implementation after completion in backend
 */
export const DUMMY_DATA_TABLE_NAMES = ['requestTable', 'requestTable2'];
export const DUMMY_INFO_NAMES = ['status', 'status2'];
export const DUMMY_BPMN_NAMES = ['overview'];
export const DUMMY_CONTAINER_NAMES = ['dashboardContainer', 'dashboardContainer2'];

export enum VISUAL_PAGE_TYPE {
    REQUEST = 'REQUEST',
    DASHBOARD = 'DASHBOARD',
}

export enum VISUAL_CONFIGURATION_TYPE {
    TABLE = 'TABLE',
    INFO = 'INFO',
    CONTAINER = 'CONTAINER',
    BPMN = 'BPMN',
}

export interface VisualizeConfiguration {
    pageIdentifier: VISUAL_PAGE_TYPE;
    configurations: Map<VISUAL_CONFIGURATION_TYPE, VisualConfiguration>;
    //possible additional metadata
}

export interface VisualConfiguration {
    configurationType: VISUAL_CONFIGURATION_TYPE;
    //possible additional metadata
}

export interface TableVisualConfig extends VisualConfiguration {
    configurations: Map<string, TableConfigElement>; //tableId->configOfTable
    //possible additional metadata
}

export interface InfoVisualConfig extends VisualConfiguration {
    configurations: Map<string, InfoConfigElement>; //infoId->config of info element
}

export interface ContainerVisualConfig extends VisualConfiguration {
    configurations: Map<string, ContainerConfigElement>; //containerId->config of container element
}
export interface BpmnVisualConfig extends VisualConfiguration {
    configurations: Map<string, BPMNConfigElement>; //BPMNId ->config
}

export interface VisualConfigElement {
    readonly type: VISUAL_CONFIGURATION_TYPE;
    readonly id: string; //any unique identifier for this element
    readonly componentId: string | undefined; // id of component where it should be rendered, could be undefined
}

export interface InfoConfigElement extends VisualConfigElement {
    readonly infoId: string; // id of element
    readonly titleDataKey: string; // key to the dataValue of title
    readonly descriptionDataKey: string; // key to the dataValue of description
    readonly style: string; // styling adjustments stored in backend
    readonly childElement: VisualConfigElement | undefined; // element to display inside of info element, a table for example
    readonly type: VISUAL_CONFIGURATION_TYPE.INFO;
}

export interface TableConfigElement extends VisualConfigElement {
    readonly tableId: string;
    readonly columns: string[];
    //possible additional data
}
export interface ContainerConfigElement extends VisualConfigElement {
    readonly style: string; // styling adjustments stored in backend
    readonly childElements: VisualConfigElement[] | undefined; // elements to display inside of info element, a table for example
}
export interface BPMNConfigElement extends VisualConfigElement {
    readonly style: string; // styling adjustments stored in backend
    readonly processDefinitionKey: string; // processDefinitionKey to be used for displaying BPMN
    readonly processDefinitionId: string | undefined; // optional specific definitionId, could result in errors
}

export const VISUALIZE_CONFIG_DUMMY = {
    pageIdentifier: VISUAL_PAGE_TYPE.DASHBOARD,
    configurations: getDummyConfigs(),
} satisfies VisualizeConfiguration;

function getDummyConfigs(): Map<VISUAL_CONFIGURATION_TYPE, VisualConfiguration> {
    const map = new Map<VISUAL_CONFIGURATION_TYPE, VisualConfiguration>();
    map.set(VISUAL_CONFIGURATION_TYPE.TABLE, getDummyTableConfig());
    map.set(VISUAL_CONFIGURATION_TYPE.CONTAINER, getDummyContainerConfig());
    return map;
}

export function getDummyTableConfig(): TableVisualConfig {
    const map = new Map<string, TableConfigElement>();
    map.set(DUMMY_DATA_TABLE_NAMES[0], {
        tableId: 'requestTable_V1',
        columns: ['someColumn', 'someColumn2'],
    } as TableConfigElement);
    return {
        configurationType: VISUAL_CONFIGURATION_TYPE.TABLE,
        configurations: map,
    } satisfies TableVisualConfig;
}

export function getDummyContainerConfig(): ContainerVisualConfig {
    const map = new Map<string, ContainerConfigElement>();
    map.set(
        DUMMY_CONTAINER_NAMES[0],
        getDummyContainerElement(DUMMY_CONTAINER_NAMES[0], [
            getDummyInfoElement('Status', 'display:flex;max-width:8rem'),
            getDummyInfoElement('running'),
            getDummyInfoElement('incidents'),
            getDummyBpmnElement('V1_Processing_DefinitionKey', ''),
        ]),
    );
    return {
        configurationType: VISUAL_CONFIGURATION_TYPE.INFO,
        configurations: map,
    } satisfies ContainerVisualConfig;
}
function getDummyBpmnElement(definitionKey: string, definitionId: string) {
    return {
        id: definitionKey,
        processDefinitionKey: definitionKey,
        style: '',
        processDefinitionId: definitionId,
        type: VISUAL_CONFIGURATION_TYPE.BPMN,
        componentId: DUMMY_BPMN_NAMES[0] + definitionKey,
    } satisfies BPMNConfigElement;
}
function getDummyInfoElement(identifier: string, style?: string) {
    return {
        id: identifier,
        infoId: DUMMY_INFO_NAMES[0],
        style: style ?? '',
        titleDataKey: identifier,
        descriptionDataKey: `€${identifier} of the WMP-UI`,
        type: VISUAL_CONFIGURATION_TYPE.INFO,
        childElement: undefined,
        componentId: DUMMY_INFO_NAMES[0] + identifier,
    } satisfies InfoConfigElement;
}
function getDummyContainerElement(identifier: string, childElements: VisualConfigElement[]) {
    return {
        id: identifier,
        type: VISUAL_CONFIGURATION_TYPE.CONTAINER,
        componentId: undefined,
        childElements: childElements,
        style: 'display:flex;gap:2rem;flex-direction:row;flex-grow',
    } satisfies ContainerConfigElement;
}
