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

export function hexToRgba(hex: string, opacity: number = 1.0): string | undefined {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result && result[1] && result[2] && result[3]) {
        return (
            "rgba(" +
            parseInt(result[1], 16) +
            "," +
            parseInt(result[2], 16) +
            "," +
            parseInt(result[3], 16) +
            "," +
            opacity +
            ")"
        );
    }
    return undefined;

    // result
    //     ? {
    //           r: parseInt(result[1], 16),
    //           g: parseInt(result[2], 16),
    //           b: parseInt(result[3], 16),
    //       }
    //     : null;
}
