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

import {removeDuplicatesAndEmpty} from 'src/app/utils/ArrayUtils';

import {
    APP_URL_ADMIN,
    APP_URL_BRIDGE,
    APP_URL_DASHBOARD,
    APP_URL_LOG,
    APP_URL_LOGIN,
    APP_URL_REQUESTS,
    APP_URL_TIMERS,
    APP_URL_WORKFLOWS,
} from 'src/app/app.constants';
import {RouterNavigationElement} from 'src/app/shared/services/client/router/data/RouterModels';

/**
 * Decoding the url and clearing query parameters if present.
 * @return An array of all NavigationElements (could be empty list if unwanted URLs filtered out)
 * @private
 */
export function getDecodedClearedNavigationElements(
    previousURL: string,
    currentURL: string,
): RouterNavigationElement[] {
    return removeDuplicatesAndEmpty([
        getNavigationElementFromURL(previousURL),
        getNavigationElementFromURL(currentURL),
    ]) satisfies RouterNavigationElement[];
}

export function getNavigationElementFromURL(url: string): RouterNavigationElement | undefined {
    const decodedURL = decodeURIComponent(url);
    if (decodedURL.includes('/' + APP_URL_LOGIN)) {
        return undefined;
    }
    const urlClean = getURLWithoutQueryParamsIfPossible(decodedURL);
    const pageUrl = getPageUrl(urlClean);
    return {
        url: urlClean,
        name: getDisplayNameFromMainURL(urlClean),
        pageUrl: pageUrl,
    } satisfies RouterNavigationElement;
}

/**
 *
 * @param cleanUrl clean url without queryParams
 * @return the page url if able to clean or as fallback the clean url
 */
function getPageUrl(cleanUrl: string) {
    if (cleanUrl.includes('/')) {
        const splitSlash = cleanUrl.split('/');
        if (cleanUrl.startsWith('/') && splitSlash.length > 1) {
            return splitSlash[1];
        } else {
            return splitSlash[0];
        }
    }
    return cleanUrl;
}

/**
 *
 * @param urlDirty dirty url to clean query params
 * @return the cleaned url if able to clean or as fallback the dirty url
 */
export function getURLWithoutQueryParamsIfPossible(urlDirty: string) {
    if (urlDirty.includes('?')) {
        return urlDirty.split('?')[0];
    }
    return urlDirty;
}

/**
 * This function takes a main url that is used to link somewhere and returns a display name or as fallback the url. <br>
 * Case1: "/workflows", returns "Workflows" (recognized, returned correct name);<br>
 * Case2: "/admin/users", returns "Admin" (recognized first "/admin", correct name);<br>
 * Case3: "notValidURL", returns "notValidURL" (not recognized missing slash in beginning not a problem, returning string);<br>
 * @param url
 */
export function getDisplayNameFromMainURL(url: string) {
    //add optional leading slash to url to assure all urls contain slash to split correctly
    const urlToCheck = url.includes('/') ? url : '/' + url;
    const urlName = urlToCheck.split('/')[1];

    switch (urlName) {
        case APP_URL_DASHBOARD:
            return 'Dashboard';
        case APP_URL_WORKFLOWS:
            return 'Workflows';
        case APP_URL_BRIDGE:
            return 'Process Bridges';
        case APP_URL_LOG:
            return 'Logs';
        case APP_URL_TIMERS:
            return 'Timers';
        case APP_URL_ADMIN:
            return 'Admin';
        case APP_URL_LOGIN:
            return 'Login';
        case APP_URL_REQUESTS:
            return 'Requests';
        default:
            return urlName ?? url;
    }
}
