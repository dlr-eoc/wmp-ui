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
    ClickedBpmnCallActivity,
    ClickedBpmnElement,
    ClickedBpmnLabel,
} from 'src/app/models/bpmn-diagram.model';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {
    WorkflowFilter,
    WorkflowFilterService,
} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {HistoricProcessInstanceDto} from 'src/app/shared/services/camunda-api';
import {BpmnDocumentService} from 'src/app/shared/services/bpmn/diagram/bpmn-document.service';
import {WorkflowFilterServiceBase} from 'src/app/components/workflow-page/service/WorkflowFilterServiceBase';

export class BpmnDiagramContainerService extends AsyncDestroyable {
    private _bpmnElementClicked$ = new Subject<ClickedBpmnElement>();
    private _bpmnNoElementClicked$ = new Subject<void>();
    private _bpmnCallActivityClicked$ = new Subject<ClickedBpmnCallActivity>();
    private _bpmnLabelClicked$ = new Subject<ClickedBpmnLabel>();

    private _allowSelection$ = new BehaviorSubject<boolean>(true);
    private _allowLabelClick$ = new BehaviorSubject<boolean>(true);
    private _diagramTitle$ = new BehaviorSubject<string>('');
    private _requestId$ = new BehaviorSubject<string | undefined>(undefined);
    private _diagramVersion$ = new BehaviorSubject<number | undefined | null>(undefined);

    private _isLoading$ = new BehaviorSubject<boolean>(true);

    private readonly workflowFilterService: WorkflowFilterService | WorkflowFilterServiceBase;
    private readonly bpmnDocumentService: BpmnDocumentService;

    constructor(
        workflowFilterService: WorkflowFilterService | WorkflowFilterServiceBase,
        bpmnDocumentService: BpmnDocumentService,
    ) {
        super();
        this.workflowFilterService = workflowFilterService;
        this.bpmnDocumentService = bpmnDocumentService;

        this.subscribeWithDestroyHandler(this.workflowFilterService.filter$, (filter) => {
            //update diagram container from filter on change
            if (filter?.processDefinition?.key) this._diagramTitle$.next(filter.processDefinition.key);
            this._diagramVersion$.next(filter?.processDefinition?.version);
            this._requestId$.next(filter?.requestId);
        });

        this.subscribeWithDestroyHandler(this._bpmnLabelClicked$, ($event: any) => {
            const activityName: string | undefined = this.bpmnDocumentService.getActivityFromCurrentBPMN(
                $event.activityId,
            );

            let filter: WorkflowFilter = {
                activity: {id: $event.activityId, name: activityName ?? $event.activityId},
            };

            if ($event.metadata == 'active') {
                filter.state = HistoricProcessInstanceDto.StateEnum.Active;
                filter.waitingOnly = false;
                filter.incidentsOnly = false;
            } else if ($event.metadata == 'incident') {
                filter.state = undefined;
                filter.incidentsOnly = true;
                filter.waitingOnly = false;
            } else if ($event.metadata == 'waiting') {
                filter.state = undefined;
                filter.waitingOnly = true;
                filter.incidentsOnly = false;
            }

            this.workflowFilterService.mergeFilterAndUpdate(filter);
        });
    }

    initializeForContainerUpdate(allowSelection: boolean, allowLabelClick: boolean): void {
        //new container - set loading to true
        this._isLoading$.next(true);
        //update required information of container
        this._allowSelection$.next(allowSelection);
        this._allowLabelClick$.next(allowLabelClick);
    }

    get isLoading$(): Observable<boolean> {
        return this._isLoading$.asObservable();
    }

    get bpmnElementClicked$(): Subject<ClickedBpmnElement> {
        return this._bpmnElementClicked$;
    }

    get bpmnNoElementClicked$(): Subject<void> {
        return this._bpmnNoElementClicked$;
    }

    get bpmnCallActivityClicked$(): Subject<ClickedBpmnCallActivity> {
        return this._bpmnCallActivityClicked$;
    }

    get bpmnLabelClicked$(): Subject<ClickedBpmnLabel> {
        return this._bpmnLabelClicked$;
    }

    get allowSelection$(): Observable<boolean> {
        return this._allowSelection$.asObservable();
    }

    get allowLabelClick$(): Observable<boolean> {
        return this._allowLabelClick$.asObservable();
    }

    get diagramTitle$(): Observable<string> {
        return this._diagramTitle$.asObservable();
    }

    get requestId$(): Observable<string | undefined> {
        return this._requestId$.asObservable();
    }

    get diagramVersion$(): Observable<number | undefined | null> {
        return this._diagramVersion$.asObservable();
    }

    bpmnUpdateCompleted() {
        this._isLoading$.next(false);
    }
}
