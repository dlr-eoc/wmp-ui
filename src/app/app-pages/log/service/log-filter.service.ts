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
import {LOG_FILTER_IDENTIFIER, LogFilter} from "src/app/app-pages/log/models/LogModels";
import {FilterStorageService} from "src/app/shared/services/client/filter/filter-storage.service";
import {FilterHandler} from "src/app/shared/services/client/filter/filter-handler";
import {NavigationService} from "src/app/shared/services/client/router/navigation/navigation.service";
import {getQueryParamsForLogFilter} from "src/app/app-pages/log/utils/log.utils";

@Injectable({
    providedIn: "root",
})
export class LogFilterService extends FilterHandler<LogFilter> implements OnDestroy {
    constructor() {
        const filterStorageService = inject(FilterStorageService);
        const navigationService = inject(NavigationService);

        super(filterStorageService, navigationService, LOG_FILTER_IDENTIFIER, getQueryParamsForLogFilter);
    }

    ngOnDestroy(): void {
        super.destroy();
    }
}
