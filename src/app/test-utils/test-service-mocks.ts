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

import {of, Subject} from 'rxjs';

export const MOCK_EMPTY_visualConfig = {
    descriptionDataKey: '',
};

export const MOCK_EMPTY_bpmnManager = {
    get processInstanceHandler() {
        return {
            processInstanceActivityService: {
                processInstanceActivityLog$: new Subject(),
            },
            processInstanceJobService: {
                processInstanceJobLogs$: new Subject(),
                processInstanceJobLogsLoading: new Subject(),
                stacktraceMap: new Subject(),
            },
        };
    },
    get bpmnHandler() {
        return {
            workflowFilterService: {
                filter$: of({}),
                cleanupOldFilterStates: async () => null,
                mergeFilter: () => {},
            },
            bpmnDiagramContainerService: {
                bpmnElementClicked$: new Subject(),
                bpmnNoElementClicked$: new Subject(),
                bpmnCallActivityClicked$: new Subject(),
                initializeForContainerUpdate: () => {},
            },
            bpmnDiagramService: {
                get loadingWorkflowData$() {
                    return of(false);
                },
                zoomHome: () => {},
                attachToElement: () => {},
                eventBus: {
                    on: () => {},
                },
                stopCustomRenderer: () => {},
            },
            clearHandler: () => {},
            destroySafeWithCache: () => {},
        };
    },
    startManagerAfterContentInit: () => {},
    changeVisible: () => {},
};
