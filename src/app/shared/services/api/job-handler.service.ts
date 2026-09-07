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

import {inject, Injectable} from '@angular/core';
import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';
import {AlertService} from 'src/app/shared/services/alert.service';
import {HistoricProcessInstance} from 'src/app/components/workflow-page/models/HistoricProcessInstance';
import {retryInstance} from 'src/app/utils/bpmn/instance.utils';
import {Observable, Subject} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class JobHandlerService {
    private wmpApiService = inject(WmpApiService);
    private alertService = inject(AlertService);

    private _jobDataChanged$ = new Subject<void>();

    restartJob(instance: HistoricProcessInstance) {
        retryInstance(instance, this.wmpApiService, this.alertService).then(() =>
            this.updateDataChangedAfterAction(),
        );
    }

    async suspendJobChange(instance: HistoricProcessInstance, suspend: boolean) {
        this.wmpApiService
            .suspendProcessInstance(suspend, instance.id)
            .then(() => this.updateDataChangedAfterAction());
    }

    terminateJob(instance: HistoricProcessInstance) {
        new Promise(() => this.wmpApiService.deleteProcessInstance(instance.id)).then(() =>
            this.updateDataChangedAfterAction(),
        );
    }

    terminateJobs(selectedInstances: HistoricProcessInstance[]) {
        new Promise(() =>
            selectedInstances.forEach((i) => {
                this.wmpApiService.deleteProcessInstance(i.id);
            }),
        ).then(() => this.updateDataChangedAfterAction());
    }

    restartSelectedJobs(selectedInstances: HistoricProcessInstance[]) {
        new Promise(() =>
            selectedInstances.forEach((instance) =>
                retryInstance(instance, this.wmpApiService, this.alertService),
            ),
        ).then(() => this.updateDataChangedAfterAction());
    }

    suspendJobs(selectedInstances: HistoricProcessInstance[], suspend: boolean) {
        selectedInstances.forEach(async (instance) => {
            await this.wmpApiService.suspendProcessInstance(suspend, instance.id);
        });
        this.updateDataChangedAfterAction();
    }

    private updateDataChangedAfterAction() {
        this._jobDataChanged$.next();
    }

    get jobDataChanged$(): Observable<void> {
        return this._jobDataChanged$.asObservable();
    }
}
