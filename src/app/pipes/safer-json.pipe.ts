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

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'saferJson',
})
/**
 * This pipe is transforming values into json with a defined space. The result will be limited to a specified
 * length to prevent denial of service. (displaying large json this way could result in performance issues
 * use specific json viewers for those cases)
 * <br><br>Result: prettier json with defined spaces
 */
export class SaferJsonPipe implements PipeTransform {
    transform(value: unknown): string {
        try {
            const json = JSON.stringify(value, null, 2);
            //security: limitation to prevent denial of service
            return json.length > 5000 ? json.slice(0, 5000) + '\n… (truncated)' : json;
        } catch (e) {
            return '';
            // TODO fallback needed?
            // return JSON.stringify(this._replacer(value), null, 2);
        }
    }

    // private _replacer(obj: any, seen: any[] = []): any {
    //     if (obj && typeof obj === 'object') {
    //         if (seen.includes(obj)) {
    //             return '[Circular]';
    //         }
    //         seen.push(obj);
    //         const result: any = Array.isArray(obj) ? [] : {};
    //         for (const key of Object.keys(obj)) {
    //             result[key] = this._replacer((obj as any)[key], seen);
    //         }
    //         return result;
    //     }
    //     return obj;
    // }
}
