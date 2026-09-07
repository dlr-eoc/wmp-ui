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

import {inject, Injectable, OnDestroy} from "@angular/core";
import {Router, RoutesRecognized} from "@angular/router";
import {BehaviorSubject, filter, Observable, pairwise} from "rxjs";
import {AsyncDestroyable} from "src/app/utils/AsyncDestroyable";

import {getDecodedClearedNavigationElements, getNavigationElementFromURL} from "src/app/shared/services/client/router/data/RouterServiceUtils";
import {RouterNavigationElement} from "src/app/shared/services/client/router/data/RouterModels";
import {NavigationHandlerService} from "src/app/shared/services/client/router/navigation/navigation-handler.service";

/**
 * This Service is used to handle any router related data.
 */
@Injectable({
    providedIn: "root",
})
export class NavigationRouterHistoryService extends AsyncDestroyable implements OnDestroy {
    private router = inject(Router);
    private navigationHandlerService = inject(NavigationHandlerService);

    private readonly maxNavigationElements = 4; //limitation of how many elements
    private _routerHistory$ = new BehaviorSubject<RouterNavigationElement[]>([]);

    constructor() {
        super();
        this.subscribeWithDestroyHandler(
            this.router.events.pipe(
                filter((evt: any) => evt instanceof RoutesRecognized),
                pairwise(),
                //this needed to assure no errors with handler for asyncs
            ) as Observable<RoutesRecognized[]>,
            (events: RoutesRecognized[]) => {
                this.updateNavigationHistory(events[0].urlAfterRedirects, events[1].urlAfterRedirects);
            },
        );
        this.subscribeWithDestroyHandler(
            this.router.events.pipe(
                filter((evt: any) => evt instanceof RoutesRecognized),
                //this needed to assure no errors with handler for asyncs
            ) as Observable<RoutesRecognized>,
            (routerRecognized) => {
                this.navigationHandlerService.handleNoPageChange(
                    getNavigationElementFromURL(routerRecognized.urlAfterRedirects),
                );
            },
        );
    }

    ngOnDestroy(): void {
        super.destroy();
    }

    private updateNavigationHistory(previousURL: string, currentURL: string) {
        const currentHistory = [...this._routerHistory$.getValue()];
        const navigationElements = getDecodedClearedNavigationElements(previousURL, currentURL);

        if (this.navigatedFromOneToAnotherPage(navigationElements)) {
            const pageName = navigationElements[1].url.split("/")[1] ?? "";
            this.navigationHandlerService.handlePageChange(pageName);
        }

        navigationElements.forEach((navigationElement) => {
            const foundSamePageUrlElement = currentHistory.find(
                (element) => element.pageUrl === navigationElement.pageUrl,
            );
            if (!foundSamePageUrlElement) {
                //case no previous
                currentHistory.push(navigationElement);
                if (currentHistory.length >= this.maxNavigationElements) {
                    currentHistory.shift(); //remove first element
                }
            }
        });

        this._routerHistory$.next(currentHistory);
    }

    private navigatedFromOneToAnotherPage(navigationElements: RouterNavigationElement[]) {
        return (
            navigationElements.length === 2 && navigationElements[0].pageUrl !== navigationElements[1].pageUrl
        );
    }

    clearHistory() {
        this._routerHistory$.next([]);
    }
    /**
     * Limited on x last elements defined in service.
     */
    get routerHistory$(): Observable<RouterNavigationElement[]> {
        return this._routerHistory$;
    }
}
