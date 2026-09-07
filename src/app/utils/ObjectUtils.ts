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

import {FilterBase} from "src/app/shared/services/utils/FilterManager";

export function filterNotEmptyElementsObject<T extends FilterBase>(object: T): Partial<T> {
    return Object.keys(object)
        .filter((v) => object[v] !== undefined)
        .reduce((previousValue, key) => {
            return {...previousValue, [key]: object[key]};
        }, {} as Partial<T>);
}

export function objectToUrlWithQueryParameter<T extends FilterBase>(object: T, url: string): string {
    const queryParameterDirty = Object.keys(filterNotEmptyElementsObject(object)).reduce(
        (previousValue, key) => {
            previousValue = previousValue + key + "=" + object[key] + "&";
            return previousValue;
        },
        "?",
    );
    return url + queryParameterDirty;
}
