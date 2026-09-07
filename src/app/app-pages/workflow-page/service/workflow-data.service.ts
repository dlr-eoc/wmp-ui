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

import {inject, Injectable, OnDestroy} from '@angular/core';
import {
    WorkflowFilterActivity,
    WorkflowFilterService,
} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {JobHandlerService} from 'src/app/shared/services/api/job-handler.service';
import {Observable, Subject} from 'rxjs';
import {HistoricProcessInstance} from 'src/app/components/workflow-page/models/HistoricProcessInstance';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {
    BpmnManagerService,
    WORKFLOWS_BPMN_IDENTIFIER,
} from 'src/app/shared/services/bpmn/bpmn-manager.service';

@Injectable({
    providedIn: 'root',
})
export class WorkflowDataService extends AsyncDestroyable implements OnDestroy {
    private workflowFilterService = inject(WorkflowFilterService);
    private jobHandlerService = inject(JobHandlerService);

    private readonly _bpmnManager = inject(BpmnManagerService).getBpmnManager(WORKFLOWS_BPMN_IDENTIFIER);

    private _selectedProcessInstances$: Subject<HistoricProcessInstance[]> = new Subject();
    private _activitiesOfCurrentProcessDefinition$: Subject<WorkflowFilterActivity[]> = new Subject();

    private selectedInstances: HistoricProcessInstance[] = [];

    availableProcessInstances$ = this._bpmnManager.availableProcessInstances$;
    countAvailableEntries$ = this._bpmnManager.countAvailableEntries$;

    constructor() {
        super();
        this.subscribeWithDestroyHandler(
            this._selectedProcessInstances$,
            (selectedInstances) => (this.selectedInstances = selectedInstances),
        );
        /**
         * @deprecated use other update
         */
        //synchronization of API with Workflow service
        this.subscribeWithDestroyHandler(this.jobHandlerService.jobDataChanged$, () => {
            return this.startRefreshPageDataWithCurrentFilter();
        });
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    /**
     * This function resets the oldFilter before page change to assure page correctly reloaded.
     * oldFilter set to undefined resulting in correct change detection from loaded filters.
     */
    resetWorkflowDataService() {
        this._bpmnManager.resetOldFilter();
        this.selectedInstances = [];
    }

    startRefreshPageDataWithCurrentFilter() {
        this.resetWorkflowDataService();
        //use empty filter update to trigger
        this.workflowFilterService.mergeFilterAndUpdate();
    }

    /**
     * This function setups the WorkflowDataAndFilter on initialization of a page from the url
     * Sets loading to true - The filter change in the WorkflowUrlService will result in
     * loading false after update automatically.<br>
     * Possible Usage:
     *```
     * //using ngOnInit - now the component is ready to get data updates
     * ngOnInit() {
     *  this.workflowDataService.setupWorkflowDataAndFilter(this.activeRoute.snapshot).then(() => {
     *             //setup done, do something else
     *  });
     * }
     * ```
     *
     */
    async setupWorkflowDataAndFilter() {
        this.resetWorkflowDataService();
    }

    get selectedProcessInstances$(): Observable<HistoricProcessInstance[]> {
        return this._selectedProcessInstances$.asObservable();
    }

    setSelectedProcessInstances(selectedElements: HistoricProcessInstance[]) {
        this._selectedProcessInstances$.next(selectedElements);
    }

    async restartSelectedJobs() {
        this.jobHandlerService.restartSelectedJobs(this.selectedInstances);
        //before restart selected jobs, the selections should be removed
        this._selectedProcessInstances$.next([]);
    }

    terminateSelectedJobs() {
        this.jobHandlerService.terminateJobs(this.selectedInstances);
        //before terminating selected jobs, the selections should be removed
        this._selectedProcessInstances$.next([]);
    }

    suspendJobs(suspend: boolean) {
        //FIXME selected instances not sync with table, update table correctly after time?
        this.jobHandlerService.suspendJobs(this.selectedInstances, suspend);
        //before suspending/unSuspending selected jobs, the selections should be removed
        this._selectedProcessInstances$.next([]);
    }

    get activitiesOfCurrentProcessDefinition$(): Observable<WorkflowFilterActivity[]> {
        return this._activitiesOfCurrentProcessDefinition$.asObservable();
    }
}
