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
import {FilterHandler} from 'src/app/shared/services/client/filter/filter-handler';
import {FilterStorageService} from 'src/app/shared/services/client/filter/filter-storage.service';
import {NavigationService} from 'src/app/shared/services/client/router/navigation/navigation.service';
import {THEME_FILTER_IDENTIFIER, ThemeFilter} from 'src/app/utils/theme/ThemeTypes';

@Injectable({
    providedIn: 'root',
})
export class ThemeFilterService extends FilterHandler<ThemeFilter> implements OnDestroy {
    private lastDarkMode: boolean = false;

    constructor() {
        const filterStorageService = inject(FilterStorageService);
        const navigationService = inject(NavigationService);
        const storedFilterBeforeInitialization =
            filterStorageService.getStoredFilterAsStringFromIdentifier(THEME_FILTER_IDENTIFIER);
        super(
            filterStorageService,
            navigationService,
            THEME_FILTER_IDENTIFIER,
            (_raw) => {
                //do not store in url, so return empty
                return {} as ThemeFilter;
            },
            (raw) => raw,
        );

        if (!storedFilterBeforeInitialization) {
            //case no stored filter before FilterHandler started - initialize theme handling
            this.initializeThemeHandling();
        }

        this.subscribeWithDestroyHandler(this.filter$, (themeFilter) => {
            if (themeFilter && themeFilter.shouldUpdate) {
                const darkMode = themeFilter.darkMode;

                const themeControlElement = document.querySelector('html');
                if (darkMode !== this.lastDarkMode) themeControlElement?.classList.toggle('my-app-dark');

                const foundBodyToSetTheme = document.querySelector('body');
                if (themeFilter.darkMode) {
                    foundBodyToSetTheme?.setAttribute('cds-theme', 'dark');
                } else {
                    foundBodyToSetTheme?.setAttribute('cds-theme', 'light');
                }
                this.lastDarkMode = themeFilter.darkMode;
            }
        });
    }

    ngOnDestroy(): void {
        super.destroy();
    }

    private initializeThemeHandling() {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.lastDarkMode = false;
            this.mergeFilterAndUpdate({darkMode: true});
        } else {
            this.lastDarkMode = true;
            this.mergeFilterAndUpdate({darkMode: false});
        }
    }
}
