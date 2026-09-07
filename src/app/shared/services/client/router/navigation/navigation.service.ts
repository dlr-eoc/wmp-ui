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
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {ActivatedRoute, Params, Router} from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class NavigationService extends AsyncDestroyable implements OnDestroy {
    private router = inject(Router);
    private activeRoute = inject(ActivatedRoute);

    /**
     * Replace the query params with given filter.
     * @param filter
     * @param replaceUrl - default true, in some cases a change is necessary
     */
    updateQueryParams<T extends Params>(filter: T | undefined, replaceUrl: boolean = true): Promise<boolean> {
        return this.router.navigate([], {
            queryParams: filter,
            replaceUrl: replaceUrl,
        });
    }

    /**
     * Navigating to new URL with params. Default navigation without params? - Use {@link navigateByUrl}
     * @param urlDifferentTypes
     * @param params
     */
    navigateToWithParams<T extends Params>(
        urlDifferentTypes: string[] | string,
        params: T,
    ): Promise<boolean> {
        // store data of update for context info!
        const url = Array.isArray(urlDifferentTypes) ? urlDifferentTypes : [urlDifferentTypes];

        return this.router.navigate([url], {
            queryParams: {...params},
        });
    }

    ngOnDestroy(): void {
        super.destroy();
    }

    /**
     *
     * @param url
     */
    navigateByUrl(url: string) {
        return this.router.navigateByUrl(url);
    }

    /**
     * This function checks for a given url if the current location suits.
     * Example this.url: "/workflows/test/something" - urlToCheck: "/workflows" - returns true
     * @param urlToCheck
     */
    isCurrentPageSameAs(urlToCheck: string) {
        if (urlToCheck.includes('/')) {
            return this.url.startsWith(urlToCheck);
        } else {
            return this.url.startsWith('/' + urlToCheck);
        }
    }
    /**
     * Get the current router url (without ip)
     */
    get url() {
        return this.router.url;
    }

    get hostNameAndPort() {
        const href = window.location.href;
        const asURL = new URL(href);
        return asURL.host;
    }

    get snapshot() {
        return this.activeRoute.snapshot;
    }
}
