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

import {Injectable, OnDestroy} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {VisualizeConfigService} from "src/app/shared/services/user/visualize/visualize-config.service";
import {AsyncDestroyable} from "src/app/utils/AsyncDestroyable";
import {PAGE_CONFIG_IDENTIFIER} from "src/app/app-pages/ConfigValues";
import {removeDuplicatesAndEmpty} from "src/app/utils/ArrayUtils";

@Injectable({
    providedIn: "root",
})
export class TableConfigService extends AsyncDestroyable implements OnDestroy {
    //local map to store user specific table columns
    private _tableColumns$ = new BehaviorSubject<Map<PAGE_CONFIG_IDENTIFIER, string[]>>(new Map());

    constructor() {
        super();
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    addTableColumn(pageId: PAGE_CONFIG_IDENTIFIER, columnId: string) {
        const columnMap = this._tableColumns$.getValue();
        const columns = [...(columnMap.get(pageId) ?? [])];
        columns.push(columnId);
        columnMap.set(pageId, removeDuplicatesAndEmpty(columns));
        this._tableColumns$.next(columnMap);
    }

    removeTableColumn(pageId: PAGE_CONFIG_IDENTIFIER, columnId: string) {
        const columnMap = this._tableColumns$.getValue();
        const columns = [...(columnMap.get(pageId) ?? [])];
        const updatedColumns = columns.filter((column) => column !== columnId);
        columnMap.set(pageId, removeDuplicatesAndEmpty(updatedColumns));
        this._tableColumns$.next(columnMap);
    }

    removeTableColumns(pageId: PAGE_CONFIG_IDENTIFIER) {
        const columnMap = this._tableColumns$.getValue();
        columnMap.set(pageId, []);
        this._tableColumns$.next(columnMap);
    }

    get tableColumns$(): Observable<Map<PAGE_CONFIG_IDENTIFIER, string[]>> {
        return this._tableColumns$.asObservable();
    }
}
