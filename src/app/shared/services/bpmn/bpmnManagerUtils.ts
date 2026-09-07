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

import {APP_URL_BRIDGE, APP_URL_DASHBOARD, APP_URL_WORKFLOWS} from 'src/app/app.constants';
import {
    DASHBOARD_BPMN_IDENTIFIER,
    DASHBOARD_BPMN_TICKET_PROC_DEF_IDENTIFIER,
    PROCESS_BRIDGE_BPMN_IDENTIFIER,
    WORKFLOWS_BPMN_IDENTIFIER,
} from 'src/app/shared/services/bpmn/bpmn-manager.service';

/**
 * This function returns the url that should be used to update filters or data.
 * @param managerIdentifier
 */
export function getURLFromManagerIdentifier(managerIdentifier: string) {
    switch (managerIdentifier) {
        case WORKFLOWS_BPMN_IDENTIFIER:
            return APP_URL_WORKFLOWS;
        case DASHBOARD_BPMN_IDENTIFIER:
            return APP_URL_DASHBOARD;
        case PROCESS_BRIDGE_BPMN_IDENTIFIER:
            return APP_URL_BRIDGE;
        default:
            if (managerIdentifier.startsWith(DASHBOARD_BPMN_IDENTIFIER)) {
                return APP_URL_DASHBOARD;
            }
            throw new Error('Unknown manager identifier: ' + managerIdentifier);
    }
}

export function getInitiallyVisibleFromManagerIdentifier(managerIdentifier: string) {
    switch (managerIdentifier) {
        case DASHBOARD_BPMN_TICKET_PROC_DEF_IDENTIFIER:
            return false;
        default:
            return true;
    }
}
