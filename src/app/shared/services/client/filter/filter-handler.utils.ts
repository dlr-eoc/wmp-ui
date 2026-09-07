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

/**
 * Checking if current filter identifier suits the current url. Used to check if data should be loaded into url
 * or just stays in service.
 * @param url - the current url of the application
 * @param filterIdentifier - the filter identifier to check for
 */
export function isFilterOfCurrentUrl(url: string, filterIdentifier: string | undefined) {
    const test = url.split('/');
    if (test.length > 1) {
        //currently no url adjustment
        // const name = getURLWithoutQueryParamsIfPossible(test[1]);
        return false;
        // switch (name) {
        //     case APP_URL_PROCESS_INSTANCE:
        //         return false; //no filter implemented
        //     case APP_URL_WORKFLOWS:
        //         return false;
        //     //filterIdentifier === WORKFLOW_FILTER_IDENTIFIER;
        //     case APP_URL_LOG: //currently no rul adjustment
        //         return filterIdentifier === LOG_FILTER_IDENTIFIER;
        //     case APP_URL_REQUESTS:
        //
        //         return filterIdentifier === REQUEST_FILTER_IDENTIFIER;
        //     default:
        //         return false;
        // }
    }
    return false;
}
