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

import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: "fallback", standalone: true})
export class FallbackPipe implements PipeTransform {
    transform(input: any, fallback: any): any {
        if (input !== undefined && input !== null) return input;
        return fallback;
    }
}

/**
 * Pipe used for maps that could be undefined. In that case an empty map is returned
 * @return the given map if not undefined/null or an empty map with correct generics
 */
@Pipe({name: "fallbackEmptyMap", standalone: true})
export class FallbackEmptyMapPipe implements PipeTransform {
    transform<K, V>(input: Map<K, V> | undefined | null): Map<K, V> {
        if (input !== undefined && input !== null) return input;
        return new Map<K, V>();
    }
}
