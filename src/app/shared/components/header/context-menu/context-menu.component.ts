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

import {Component, inject, OnDestroy, viewChild} from "@angular/core";
import {MenuItem} from "primeng/api";
import {Breadcrumb} from "primeng/breadcrumb";
import {Popover} from "primeng/popover";
import {Tooltip} from "primeng/tooltip";
import {Button} from "primeng/button";
import {NavigationRouterHistoryService} from "src/app/shared/services/client/router/navigation/navigation-router-history.service";
import {AsyncDestroyable} from "src/app/utils/AsyncDestroyable";
import {NavigationService} from "src/app/shared/services/client/router/navigation/navigation.service";
import {NavigationHistoryService} from "src/app/shared/services/client/router/navigation/navigation-history.service";
import {ProcessNavigationElement} from "src/app/shared/services/client/router/data/RouterModels";
import {APP_URL_DASHBOARD} from "src/app/app.constants";

@Component({
    selector: "app-context-menu",
    imports: [Breadcrumb, Popover, Tooltip, Button],
    templateUrl: "./context-menu.component.html",
    styleUrl: "./context-menu.component.scss",
})
export class ContextMenuComponent extends AsyncDestroyable implements OnDestroy {
    private routerService = inject(NavigationRouterHistoryService);
    private navigationHistoryService = inject(NavigationHistoryService);
    private navigationService = inject(NavigationService);

    readonly op = viewChild.required<Popover>("op");

    routerItems: MenuItem[] = [];
    piItems: MenuItem[] = [];
    processNavigationElements: ProcessNavigationElement[] = [];

    routerHome: MenuItem = {icon: "pi pi-home", routerLink: "/"};
    piHome: MenuItem = {icon: "pi pi-home", routerLink: APP_URL_DASHBOARD};

    constructor() {
        super();
        this.subscribeWithDestroyHandler(this.routerService.routerHistory$, (navigationElements) => {
            this.routerItems = navigationElements.map((element) => {
                return {label: element.name, url: element.url} satisfies MenuItem;
            });
        });
        this.subscribeWithDestroyHandler(
            this.navigationHistoryService.processHistory$,
            (navigationElements) => {
                this.piItems = navigationElements.map((element) => {
                    return {label: element.name, url: "/process-instance/" + element.id} satisfies MenuItem;
                });
                if (navigationElements.length > 0)
                    this.piHome.routerLink =
                        "/process-instance/" + navigationElements[navigationElements.length - 1].id;
                this.processNavigationElements = navigationElements;
            },
        );
    }

    /**
     * This function navigates to url. This is more stable than routerLink,
     * possible query parameters are still present in url and won't be encoded.
     * @param url - url to navigate to
     */
    navigate(url: string) {
        return this.navigationService.navigateByUrl(url);
    }

    handleClearRouterHistory() {
        this.routerService.clearHistory();
    }
    handleClearPiHistory() {
        this.navigationHistoryService.clearProcessInstanceHistory();
    }
    ngOnDestroy(): void {
        super.destroy();
    }

    togglePopOver(event: MouseEvent) {
        this.op().toggle(event);
    }
}
