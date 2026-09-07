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

import {inject, Injectable} from '@angular/core';
import {WorkflowFilterService} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {APP_URL_LOG, APP_URL_REQUESTS, APP_URL_WORKFLOWS} from 'src/app/app.constants';
import {RequestFilterService} from 'src/app/app-pages/request/service/request-filter.service';
import {LogFilterService} from 'src/app/app-pages/log/service/log-filter.service';
import {RouterNavigationElement} from 'src/app/shared/services/client/router/data/RouterModels';

@Injectable({
    providedIn: 'root',
})
export class NavigationHandlerService {
    private workflowFilterService = inject(WorkflowFilterService);
    private requestFilterService = inject(RequestFilterService);
    private logFilterService = inject(LogFilterService);
    // private workflowDataService = inject(WorkflowDataService);

    handlePageChange(pageName: string) {
        switch (pageName) {
            //retrigger filter change to assure loaded correctly into query params
            case APP_URL_WORKFLOWS:
                return;
            case APP_URL_LOG:
                this.logFilterService.retriggerFilterAndUpdate();
                this.workflowFilterService.retriggerFilterAndUpdate();
                return;
            case APP_URL_REQUESTS:
                this.requestFilterService.retriggerFilterAndUpdate();
                return;
            //no filter implemented - nothing to retrigger
            default:
                return;
        }
    }

    handleNoPageChange(navElement: RouterNavigationElement | undefined) {
        if (!navElement) {
            return;
        }
        //check page to navigate to
        // this.checkForHandling(navElement.pageUrl);
    }
}
