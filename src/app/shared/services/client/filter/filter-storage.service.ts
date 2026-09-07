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
import {FilterBase, FilterManager} from 'src/app/shared/services/utils/FilterManager';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {LocalStorageService} from 'src/app/shared/services/client/storage/local-storage.service';

@Injectable({
    providedIn: 'root',
})
/**
 * The FilterStorageService handles all storage actions of the filters. "Manually" editing the storage
 * should not happen anywhere else. This centralized approach results in easy change of storage method.
 */
export class FilterStorageService extends AsyncDestroyable implements OnDestroy {
    //maybe some specific filters should be stored in sessionStorage
    //possible switch of storage service possible
    //private storageService = inject(SessionStorageService);
    private storageService = inject(LocalStorageService);

    private readonly filterStoragePrefix = 'FILTER_';
    private initializedStorageIdentifier: string[] = [];

    ngOnDestroy(): void {
        super.destroy();
        this.initializedStorageIdentifier = [];
    }

    /**
     * This function handles the storage of a filterManager. Nowhere else this data should be modified!
     * Assure to call this function onInit/constructor of a service.
     * First given data from session storage gets loaded and stored in the manager. WARNING:Dates are parsed as string!
     * Afterward the filter is subscribed and every change results into storing in session storage.
     * @param filterIdentifier - the identifier of the filter
     * @param filterManager - the filter manager to use for handling
     * @param customParseHandler - a custom parse handler for loading from storage (date conversions for example)
     */
    initializeFilterStorage<T extends FilterBase>(
        filterIdentifier: string,
        filterManager: FilterManager<T>,
        customParseHandler?: (filterRaw: T) => T,
    ) {
        //first load data if present
        const dataOfFilter = this.getStoredFilterAsStringFromIdentifier(filterIdentifier);
        if (dataOfFilter) {
            const filter = JSON.parse(dataOfFilter) as T;
            filter.filterIdentifier = filterIdentifier;
            if (filter) {
                const fixedFilter = customParseHandler ? customParseHandler(filter) : filter;
                //merge found filter information from storage
                filterManager.mergeFilter(fixedFilter);
            }
        }

        this.subscribeWithDestroyHandler(filterManager.filter$, (filter) => {
            if (filter) {
                //case filter present, store data in session storage
                this.storageService.setItem(
                    this.filterStoragePrefix + filterIdentifier,
                    JSON.stringify(filter),
                );
                //store filter identifier to remove later
                this.initializedStorageIdentifier = [
                    ...this.initializedStorageIdentifier,
                    this.filterStoragePrefix + filterIdentifier,
                ];
            }
        });
    }

    /**
     * This function removes all filter from session storage. Maybe use on logout/login to assure invalid
     * session storages are removed. If those filters are persisted in browser in further development it
     * could be also used for a button to delete custom settings for a user.
     */
    removeFilterStorage() {
        this.initializedStorageIdentifier.forEach((filterIdentifier) => {
            this.storageService.removeItem(filterIdentifier);
        });
    }

    /**
     * This function retrieves the stored string of a given filterIdentifier or undefined if none stored.
     * @param filterIdentifier - the filter identifier to retrieve data from storage
     */
    getStoredFilterAsStringFromIdentifier(filterIdentifier: string) {
        return this.storageService.getItem(this.filterStoragePrefix + filterIdentifier) ?? undefined;
    }
}
