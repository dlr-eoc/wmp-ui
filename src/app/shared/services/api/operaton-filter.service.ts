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

import {inject, Injectable, OnDestroy, signal} from '@angular/core';
import {FilterDto, FilterService, TaskDto} from 'src/app/shared/services/camunda-api';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {firstValueFrom} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class OperatonFilterService extends AsyncDestroyable implements OnDestroy {
    private readonly WMPApiFilterService = inject(FilterService);
    private readonly _$filters = signal<FilterDto[]>([]);
    private readonly _$filteredTasks = signal<TaskDto[]>([]);
    readonly $filteredTasks = this._$filteredTasks.asReadonly();

    constructor() {
        super();
    }

    ngOnDestroy(): void {
        super.destroy();
    }

    async updateFilterFromName(filterName: string): Promise<TaskDto[]> {
        const filterList = await firstValueFrom(this.WMPApiFilterService.getFilterList());
        this._$filters.set(filterList);
        const test = filterList.find((filter) => filter.name === filterName);
        if (test?.id) {
            return firstValueFrom(this.WMPApiFilterService.executeFilterList(test.id)).then(
                (filterObjects) => {
                    const tasksMapped = filterObjects as TaskDto[];
                    tasksMapped.sort((a, b) => ((a?.created ?? '') < (b.created ?? '') ? 1 : -1));
                    this._$filteredTasks.set(tasksMapped);
                    return tasksMapped;
                },
            );
        }
        return [];
    }
}
