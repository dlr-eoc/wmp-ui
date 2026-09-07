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
 * Checking if no value has been stored for the given key. Creating an empty map in this case.
 * @returns the child map of the given key, always an empty map at minimum - careful no deep copy used, just new Map()
 * @param parent - the 2D map to check for undefined values
 * @param key - the key to the child map
 */
export function fillMapIfUndefined<T extends number | string, V extends number | string, W>(
    parent: Map<T, Map<V, W>>,
    key: T,
) {
    const childMapToCheck = parent.get(key);

    if (!childMapToCheck) {
        parent.set(key, new Map<V, W>());
        return new Map<V, W>(parent.get(key));
    } else {
        return new Map(childMapToCheck);
    }
}
