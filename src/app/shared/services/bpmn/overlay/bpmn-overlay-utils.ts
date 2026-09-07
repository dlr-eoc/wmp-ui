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

import {Shape} from 'diagram-js/lib/model';

export function getTimeDefinitionFromElement(element: Shape) {
    if (element.businessObject.eventDefinitions) {
        return getTimeDefinitionFromEventDefinitions(element.businessObject.eventDefinitions);
    }
    return undefined;
}
function getTimeDuration(value: any): string | undefined {
    return value?.timeDuration?.body ?? undefined;
}
function getTimeCycle(value: any): string | undefined {
    return value?.timeCycle?.body ?? undefined;
}

function getTimeDefinitionFromEventDefinitions(eventDefinitions: any) {
    const timeDuration = getTimeDuration(
        eventDefinitions.find((value: any) => {
            return getTimeDuration(value);
        }),
    );
    const timeCycle = getTimeCycle(
        eventDefinitions.find((value: any) => {
            return getTimeCycle(value);
        }),
    );
    return timeDuration ?? timeCycle;
}
