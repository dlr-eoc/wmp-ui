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

import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {FilterBase, FilterManager} from 'src/app/shared/services/utils/FilterManager';
import {Observable} from 'rxjs';
import {FilterStorageService} from 'src/app/shared/services/client/filter/filter-storage.service';
import {NavigationService} from 'src/app/shared/services/client/router/navigation/navigation.service';
import {ActivatedRouteSnapshot, Params} from '@angular/router';
import {isFilterOfCurrentUrl} from 'src/app/shared/services/client/filter/filter-handler.utils';

export class FilterHandler<T extends FilterBase> extends AsyncDestroyable {
    //this filter manager should not be accessible somewhere else!
    //Problems with asynchronous state if used somewhere else
    private readonly _filterManager = new FilterManager<T>();

    /**
     * This function loads initial data from snapshot existing on creation of the filter handler.
     * Afterward a subscription is created on the filter handling url param changes.
     * The FilterStorageService gets initialized.
     * Assure to destroy subscriptions of the FilterHandler correctly in child class:
     * ```
     * ngOnDestroy(): void {
     *         //destroys subscription/-s in FilterHandler
     *         super.destroy();
     *     }
     * ```
     * @param filterStorageService - the FilterStorageService used global by all services
     * @param navigationService - the NavigationService used global by all services
     * @param filterIdentifier - the specific identifier of a filter, should be unique!
     * @param customQueryParamsMapper - custom mapper for query params
     * @param customParseHandler - custom parse handler to parse from storage
     * @param loadDataFromUrl - deprecated! function to load data from url and override the filter before activating filter storage or navigating handling
     */
    constructor(
        filterStorageService: FilterStorageService,
        navigationService: NavigationService,
        filterIdentifier: string,
        customQueryParamsMapper?: (filterRaw: T) => Params,
        customParseHandler?: (filterRaw: T) => T,
        loadDataFromUrl?: (snapshot: ActivatedRouteSnapshot) => T,
    ) {
        super();
        this._filterManager.updateFilterIdentifier(filterIdentifier);

        //assure to preload data from url before starting
        if (loadDataFromUrl) {
            const snapshot = navigationService.snapshot;
            const filterToPreloadFromUrl = loadDataFromUrl(snapshot);
            this.mergeFilter(filterToPreloadFromUrl);
        }

        //this subscription has to be destroyed in child class using the filter handler
        this.subscribeWithDestroyHandler(this._filterManager.filter$, (filter) => {
            //always update url if filter changes (and in correct context)
            //currently url update of query params disabled!
            if (filter && isFilterOfCurrentUrl(navigationService.url, filter?.filterIdentifier)) {
                //case filter present and not just the identifier changed, more keys present to updateQueryParams
                if (
                    Object.keys(filter).length > 1 &&
                    filter.filterIdentifier &&
                    filter.filterIdentifier !== ''
                ) {
                    const params =
                        customQueryParamsMapper && filter ? customQueryParamsMapper(filter) : filter;
                    return navigationService.updateQueryParams(params);
                }
            }
            return Promise.resolve();
        });

        filterStorageService.initializeFilterStorage(
            filterIdentifier,
            this._filterManager,
            customParseHandler,
        );

        //trigger filter update once after initialization done
        this.retriggerFilterAndUpdate();
    }

    retriggerFilterAndUpdate() {
        //retrigger with current state and mark shouldUpdate:true
        this._filterManager.mergeFilter({shouldUpdate: true} as T);
    }

    mergeFilter(filter?: T, shouldUpdate: boolean = false): void {
        this._filterManager.mergeFilter({...filter, shouldUpdate: shouldUpdate} as T);
    }
    mergeFilterAndUpdate(filter?: T): void {
        this.mergeFilter(filter, true);
    }

    overwriteFilter(filter?: T) {
        this._filterManager.overwriteFilter(filter);
    }

    shouldNotUpdateAnymore() {
        this._filterManager.mergeFilter({shouldUpdate: false} as T);
    }

    currentFilter() {
        return this._filterManager.currentFilterObject;
    }

    get filter$(): Observable<T | undefined> {
        return this._filterManager.filter$;
    }
}
