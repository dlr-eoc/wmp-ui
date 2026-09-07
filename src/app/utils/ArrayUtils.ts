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
 * Removes a specific string from an array. Only removes the first string found.
 * @param array the array to search and remove
 * @param item the string to remove in the array
 */
export function removeFirstStringFromArray(array: string[], item: string): string[] {
    const indexToRemove = array.indexOf(item, 0);
    if (indexToRemove !== -1) {
        array.splice(indexToRemove, 1); //remove item at index
        return array;
    }
    return array;
}

export function notEmpty<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

export function removeDuplicatesAndEmpty<T>(array: (T | undefined | null)[]): T[] {
    return array.filter(notEmpty).filter((value, index, array) => index === array.indexOf(value));
}

/**
 * Example: groupBy(taskData, (task: DayRoutineTask) => task.type);<br>
 * This results in a grouped record of task.type -> [*arrays of that type*]
 */
export const groupBy = <T, K extends keyof never>(array: T[], key: (i: T) => K) =>
    array.reduce(
        (groups, currentItem) => {
            (groups[key(currentItem)] ||= []).push(currentItem);
            return groups;
        },
        {} as Record<K, T[]>,
    );
