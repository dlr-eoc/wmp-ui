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

import {BehaviorSubject, Observable} from "rxjs";

export interface FilterTableBase extends FilterBase {
    page?: number;
    pageSize?: number;
    orderByField?: string;
    ascendingOrder?: boolean;
}
export interface FilterBase {
    filterIdentifier?: string;
    shouldUpdate?: boolean;
    [p: string]: any;
}
/**
 * This FilterManager
 */
export class FilterManager<T extends FilterBase | Partial<FilterBase>> {
    private readonly emptyFilter = {} as T;
    private _filter$ = new BehaviorSubject<T | undefined>(undefined);
    private readonly emptyFilterPreset: T = this.emptyFilter;

    constructor(givenEmptyFilter?: T) {
        //overwrite current filter with empty filter given in constructor if present
        if (givenEmptyFilter) this.emptyFilterPreset = {...givenEmptyFilter};
    }

    mergeFilter(filter?: T): void {
        const filterToUpdate = {...this.currentFilterObject, ...filter};
        this._filter$.next(filterToUpdate);
    }

    overwriteFilter(filter?: T): void {
        const filterToUpdate = filter || this.emptyFilterPreset;
        this._filter$.next(filterToUpdate);
    }

    updateFilterIdentifier(filterIdentifier: string) {
        const filterToUpdate = {...this.currentFilterObject, filterIdentifier: filterIdentifier};
        this._filter$.next(filterToUpdate);
    }

    get filter$(): Observable<T | undefined> {
        return this._filter$.asObservable();
    }

    /**
     * CurrentFilterObject or emptyFilterPreset if undefined.
     */
    get currentFilterObject(): T {
        return this._filter$.value ?? this.emptyFilterPreset;
    }

    isEmptyFilter() {}
}
