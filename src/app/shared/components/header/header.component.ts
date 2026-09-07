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

import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService} from 'src/app/shared/services/user/authentication.service';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {MenuItem} from 'primeng/api';
import {getDisplayNameFromMainURL} from 'src/app/shared/services/client/router/data/RouterServiceUtils';
import {ThemeFilterService} from 'src/app/shared/components/header/filter/theme-filter.service';
import {ToggleSwitch, ToggleSwitchChangeEvent} from 'primeng/toggleswitch';
import {ClrConditionalModule, ClrDropdownModule, ClrIconModule, ClrNavigationModule} from '@clr/angular';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {ContextMenuComponent} from './context-menu/context-menu.component';
import {FormsModule} from '@angular/forms';
import {WorkflowFilterService} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {APP_URL_DASHBOARD, APP_URL_WORKFLOWS} from 'src/app/app.constants';
import {WorkflowFilterCopyComponent} from 'src/app/shared/components/workflow/workflow-filter-copy/workflow-filter-copy.component';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    imports: [
        ClrNavigationModule,
        RouterLink,
        ClrIconModule,
        RouterLinkActive,
        ContextMenuComponent,
        ToggleSwitch,
        FormsModule,
        ClrDropdownModule,
        ClrConditionalModule,
        WorkflowFilterCopyComponent,
    ],
})
export class HeaderComponent extends AsyncDestroyable implements OnInit, OnDestroy {
    auth = inject(AuthenticationService);
    private themeFilterService = inject(ThemeFilterService);
    workflowFilterService = inject(WorkflowFilterService);

    isLightMode: boolean = false;
    workflowFilterLink: string | undefined;

    getDisplayName(url: string) {
        return getDisplayNameFromMainURL(url);
    }

    workflowsURL = APP_URL_WORKFLOWS;
    dashboardURL = APP_URL_DASHBOARD;

    items: MenuItem[] = [
        {label: 'Components'},
        {label: 'Form'},
        {label: 'InputText', routerLink: '/inputtext'},
    ];

    // home: MenuItem = {icon: "pi pi-home", routerLink: "/"};

    constructor() {
        super();
        this.subscribeWithDestroyHandler(
            this.themeFilterService.filter$,
            //convert to isLightMode to assure correctly displayed toggle
            (value) => (this.isLightMode = !value?.darkMode),
        );
        this.subscribeWithDestroyHandler(this.workflowFilterService.workflowFilterLink$, (value) => {
            this.workflowFilterLink = value;
        });
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    logoutUser() {
        this.auth.logout();
    }

    ngOnInit(): void {}

    changeDarkMode($event: ToggleSwitchChangeEvent) {
        //true is light mode, false is darkmode
        this.themeFilterService.mergeFilterAndUpdate({darkMode: !$event.checked});
    }
}
