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

import {HistoricJobLogDto} from 'src/app/shared/services/camunda-api';
import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';
import {Observable, Subject} from 'rxjs';

export class ProcessInstanceJobService {
    private api: WmpApiService;

    private _processInstanceJobLogs$: Subject<HistoricJobLogDto[]> = new Subject<HistoricJobLogDto[]>();
    private _processInstanceJobLogsLoading: Subject<boolean> = new Subject<boolean>();
    private _stacktraceMap: Subject<{[jobId: string]: string}> = new Subject();

    constructor(api: WmpApiService) {
        this.api = api;
    }

    /**
     * Updates job log info and changes bpmn labels of tasks from information given by job logs.
     * @param processInstanceId - the process instance to load job information
     */
    async updateJobInfo(processInstanceId: string) {
        this._processInstanceJobLogsLoading.next(true);
        const jobLogs = await this.api.getHistoricJobLogs(processInstanceId);
        this._processInstanceJobLogs$.next(jobLogs);
        this._processInstanceJobLogsLoading.next(false);

        const gatheredMap: {[jobId: string]: string} = {};
        jobLogs
            .filter((j) => j.failureLog)
            .forEach((j) => {
                if (j.id !== null && j.id !== undefined) {
                    const jobLogId = j.id;
                    this.api.getHistoricJobStackTrace(jobLogId).then((st) => {
                        gatheredMap[jobLogId] = st;
                    });
                }
            });
        this._stacktraceMap.next(gatheredMap);

        return jobLogs;
    }

    get processInstanceJobLogs$(): Observable<HistoricJobLogDto[]> {
        return this._processInstanceJobLogs$.asObservable();
    }

    get processInstanceJobLogsLoading(): Subject<boolean> {
        return this._processInstanceJobLogsLoading;
    }

    get stacktraceMap(): Subject<{[p: string]: string}> {
        return this._stacktraceMap;
    }
}
