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

import {Injectable, OnDestroy} from '@angular/core';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {BehaviorSubject} from 'rxjs';
import {ProcessNavigationElement} from 'src/app/shared/services/client/router/data/RouterModels';
import {HistoricProcessInstanceDto} from 'src/app/shared/services/camunda-api';

@Injectable({
    providedIn: 'root',
})
export class NavigationHistoryService extends AsyncDestroyable implements OnDestroy {
    private _processHistory$ = new BehaviorSubject<ProcessNavigationElement[]>([]);

    constructor() {
        //deprecated, use process instance from WorkflowdataService
        // const _processInstanceService = inject(ProcessInstanceService);

        super();

        // FIXME navigation history needed? - use workflowFilter for history! Complete filter could be used!
        // this.subscribeWithDestroyHandler(_processInstanceService.processInstance$, (processInstance) => {
        //     if (!processInstance?.id) return;
        //     const currentElements = this.processHistory$.value;
        //     const sameIdFound = currentElements.find((element) => element.id === processInstance?.id);
        //     if (sameIdFound) {
        //         // handle
        //     } else {
        //         const parentFound = currentElements.find(
        //             (element) => element.superId === processInstance?.id,
        //         );
        //         const childFound = currentElements.find((element) => element.childId === processInstance?.id);
        //         const element = this.createNavigationElementFromInstance(processInstance, childFound?.id);
        //         if (element) currentElements.push(element);
        //         if (parentFound) {
        //             // handle
        //         } else if (childFound) {
        //             // handle
        //         } else {
        //         }
        //     }
        //     this._processHistory$.next(currentElements);
        // });
    }

    createNavigationElementFromInstance(
        processInstance: HistoricProcessInstanceDto,
        childId?: string,
    ): ProcessNavigationElement | undefined {
        if (processInstance.id)
            return {
                id: processInstance.id,
                name: processInstance.processDefinitionName ?? undefined,
                superId: processInstance.superProcessInstanceId ?? undefined,
                childId: childId,
            };
        return undefined;
    }

    ngOnDestroy(): void {
        super.destroy();
    }

    get processHistory$(): BehaviorSubject<ProcessNavigationElement[]> {
        return this._processHistory$;
    }

    clearProcessInstanceHistory() {
        this._processHistory$.next([]);
    }
}
