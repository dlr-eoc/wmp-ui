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

import {BpmnHandlerService} from 'src/app/shared/services/bpmn/bpmn-handler.service';
import {ProcessInstanceHandlerService} from 'src/app/shared/services/bpmn/process-instance/process-instance-handler.service';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {
    BPMNElementType,
    ClickedBpmnCallActivity,
    ClickedBpmnElement,
} from 'src/app/models/bpmn-diagram.model';
import {
    WorkflowFilter,
    WorkflowFilterActivity,
} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {signal, WritableSignal} from '@angular/core';
import {getWorkflowFilterChange} from 'src/app/app-pages/workflow-page/models/WorkflowFilterChange';
import {NavigationService} from 'src/app/shared/services/client/router/navigation/navigation.service';
import {getInstancesWithIncidents} from 'src/app/utils/bpmn/instance.utils';
import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {HistoricProcessInstance} from 'src/app/components/workflow-page/models/HistoricProcessInstance';
import {
    getInitiallyVisibleFromManagerIdentifier,
    getURLFromManagerIdentifier,
} from 'src/app/shared/services/bpmn/bpmnManagerUtils';
import {AlertService} from 'src/app/shared/services/alert.service';

export class BpmnManager extends AsyncDestroyable {
    private readonly _bpmnHandler: BpmnHandlerService;
    private readonly _processInstanceHandler: ProcessInstanceHandlerService;
    private readonly _navigationService: NavigationService;
    private readonly _wmpApiService: WmpApiService;
    private readonly _alertService: AlertService;

    private readonly _$oldFilter = signal<WorkflowFilter | undefined>(undefined);
    private readonly _availableProcessInstances$: Subject<HistoricProcessInstance[]> = new Subject();

    private readonly _countAvailableEntries$ = new BehaviorSubject<number>(0);

    private readonly _urlToUpdate: string;

    readonly identifier: string;

    countAvailableEntries$ = this._countAvailableEntries$.asObservable();
    availableProcessInstances$ = this._availableProcessInstances$.asObservable();
    private readonly _bpmnVisible = signal<boolean>(true);

    constructor(
        bpmnHandler: BpmnHandlerService,
        processInstanceHandlerService: ProcessInstanceHandlerService,
        navigationService: NavigationService,
        wmpApiService: WmpApiService,
        alertService: AlertService,
        managerIdentifier: string,
    ) {
        super();
        this._bpmnHandler = bpmnHandler;
        this._processInstanceHandler = processInstanceHandlerService;
        this._navigationService = navigationService;
        this._wmpApiService = wmpApiService;
        this._alertService = alertService;
        this._urlToUpdate = getURLFromManagerIdentifier(managerIdentifier);
        this.identifier = managerIdentifier;
        this._bpmnVisible.set(getInitiallyVisibleFromManagerIdentifier(managerIdentifier));
    }

    /**
     * This function starts the filter management:
     * - destroying possible old subscriptions on filters
     * - LoadingIndicators, Reset old filter
     * - Subscriptions on the filter
     * - Start of synchronization to the click handling
     */
    startFilterManagement() {
        this.resetOldFilter();

        this.handleBpmnFilterManagement();
        this.handleBpmnClickSynchronization();
    }

    destroy() {
        super.destroy();
        this._bpmnHandler.clearHandler();
        this._processInstanceHandler.clearHandler();
    }
    get bpmnHandler(): BpmnHandlerService {
        return this._bpmnHandler;
    }

    get processInstanceHandler(): ProcessInstanceHandlerService {
        return this._processInstanceHandler;
    }

    private handleBpmnFilterManagement() {
        this.subscribeWithDestroyHandler(this._bpmnHandler.workflowFilterService.filter$, (filter) => {
            //assure to update data only if on correct page
            if (this._navigationService.isCurrentPageSameAs(this._urlToUpdate)) {
                if (filter?.shouldUpdate) {
                    this._processInstanceHandler.workflowBpmnService.updateLoading(true);

                    this._bpmnHandler.workflowFilterService
                        .cleanupOldFilterStates(filter)
                        .then((filterValuesToOverwrite) => {
                            if (filterValuesToOverwrite) {
                                //update old filter, assure to sync clean-up before
                                this._$oldFilter.update((prev) => {
                                    return {...prev, ...filterValuesToOverwrite};
                                });
                            }
                            const filterToUse = {...filter, ...filterValuesToOverwrite};

                            this.updateFromFilterChange(filterToUse).then((filterToOverwrite) => {
                                if (filterToOverwrite) {
                                    this._bpmnHandler.workflowFilterService.mergeFilter(filterToOverwrite);
                                    //case some updates requires more changes
                                    //(e.g. ProcessDefinition load on ProcessInstanceSelection)
                                    //also update old filter - else a ProcessDefinition change would be detected
                                    this._$oldFilter.set(filterToOverwrite);
                                } else {
                                    this._$oldFilter.set({...filterToUse});
                                }
                                this._processInstanceHandler.workflowBpmnService.updateLoading(false);
                            });
                        });
                }
            } else {
                this._processInstanceHandler.workflowBpmnService.updateLoading(false);
            }
        });
    }

    async updateFromFilterChange(filter: WorkflowFilter | undefined) {
        if (!filter || Object.keys(filter).length === 0) {
            //no need to update from oldFilter
            return Promise.resolve();
        }

        const filterChange = getWorkflowFilterChange(filter, this._$oldFilter());
        if (!filterChange) {
            //no need to update from oldFilter
            return Promise.resolve();
        }

        if (filterChange.isChangedProcessInstanceId) {
            ///case show process instance
            return this._processInstanceHandler.processInstanceDataService
                .updateDataForProcessInstanceId(filter, filterChange.isChangedProcessDefinitionId)
                .then((filterOverwriteOldFilter) => {
                    if (filterChange.isElementSelectionChange)
                        this._processInstanceHandler.workflowBpmnService.updateSelectedElement(filter);
                    return filterOverwriteOldFilter;
                });
        } else {
            //case all other filter changes could result in data update
            const resultCountPromise = this.updatePossibleResultsCount(filter);
            const processInstancePromise = this.updateHistoricProcessInstances(filter);
            //retrieving backend data first - afterward updateBPMN
            return Promise.all([resultCountPromise, processInstancePromise])
                .then(() => {
                    if (
                        filterChange.isChangedProcessDefinitionId ||
                        filterChange.isRemovedProcessInstanceId ||
                        filterChange.isChangedHistoricLabels ||
                        filterChange.isChangedTimeRange
                    ) {
                        //case show process definition
                        return this._processInstanceHandler.workflowBpmnService.updateBPMNFromProcessDefinition(
                            filter,
                        );
                    }
                    return;
                })
                .then(() => {
                    this._processInstanceHandler.workflowBpmnService.updateSelectedElement(filter);
                });
        }
    }

    /**
     * Handles Synchronization between BPMN Container and ProcessInstance Data.
     * @private
     */
    private handleBpmnClickSynchronization() {
        const bpmnDiagramContainerService = this._bpmnHandler.bpmnDiagramContainerService;
        const processInstanceActivityService = this._processInstanceHandler.processInstanceActivityService;

        this.subscribeWithDestroyHandler(
            bpmnDiagramContainerService.bpmnElementClicked$,
            ($event: ClickedBpmnElement) => {
                if ($event.type === BPMNElementType.SEQUENCE_FLOW) {
                    // this.bpmnViewSelectionService.onSequenceFlowSelection($event)

                    processInstanceActivityService.updateActivityInstanceFromFilter({
                        sequenceFlow: $event,
                    });
                } else {
                    //case default activity handling
                    processInstanceActivityService.updateActivityInstanceFromFilter({
                        activity: {id: $event.id, name: $event.name} satisfies WorkflowFilterActivity,
                    });
                }
            },
        );

        this.subscribeWithDestroyHandler(bpmnDiagramContainerService.bpmnNoElementClicked$, () => {
            //remove both possible activity selections!
            processInstanceActivityService.updateActivityInstanceFromFilter({});
        });
        this.subscribeWithDestroyHandler(
            bpmnDiagramContainerService.bpmnCallActivityClicked$,
            ($event: ClickedBpmnCallActivity) => {
                processInstanceActivityService.updateActivityInstanceFromFilter({
                    callActivity: $event,
                });
            },
        );
    }

    private async updatePossibleResultsCount(filterToUpdate: WorkflowFilter) {
        const count = await this._wmpApiService.getProcessInstanceCount(filterToUpdate);
        this._countAvailableEntries$.next(count.count ?? 0);
    }
    private async updateHistoricProcessInstances(filter: WorkflowFilter): Promise<void> {
        const instances = await this._wmpApiService.getProcessInstancesWithActivities(filter);
        const instancesWithIncidents = await getInstancesWithIncidents(instances, this._wmpApiService);
        this._availableProcessInstances$.next(instancesWithIncidents);
    }

    resetOldFilter() {
        this._$oldFilter.set(undefined);
    }

    startManagerAfterContentInit(nativeElement: any, observer: WritableSignal<ResizeObserver | undefined>) {
        const bpmnDiagramService = this._bpmnHandler.bpmnDiagramService;

        if (!bpmnDiagramService) {
            throw new Error('BpmnDiagramComponent cannot be loaded');
        } else {
            observer.set(
                new ResizeObserver((_entries) => {
                    try {
                        if (this._bpmnVisible()) {
                            //just resize and zoom home if visible
                            bpmnDiagramService.zoomHome();
                        }
                    } catch (error) {
                        this._alertService.addWarning('Error while resizing BPMN');
                    }
                }),
            );
            observer()?.observe(nativeElement);
            bpmnDiagramService.attachToElement(nativeElement);

            const eventBus = bpmnDiagramService.eventBus;
            //attachment complete, use event bus to handle
            eventBus.on('import.done', ({error}: any) => {
                if (!error) {
                    if (this._bpmnVisible()) {
                        //case always present, zoom home directly
                        bpmnDiagramService.zoomHome();
                    }
                } else {
                    this._alertService.addWarning('Error while importing Element.');
                }
            });

            this.startFilterManagement();
        }
    }

    /**
     * Changing Visible signal - used to control zoomHome handling on imports and resizes
     * @param isVisible
     */
    changeVisible(isVisible: boolean) {
        this._bpmnVisible.set(isVisible);
    }
}
