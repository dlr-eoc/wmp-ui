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

import {inject, Injectable, OnDestroy} from '@angular/core';
import {WmpApiService} from 'src/app/shared/services/wmp-api/wmp-api.service';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {BehaviorSubject} from 'rxjs';
import {SituationViewModel} from 'src/app/shared/services/wmp-api/SituationViewModel';

@Injectable({
    providedIn: 'root',
})
export class DashboardDataService extends AsyncDestroyable implements OnDestroy {
    private wmpApiService = inject(WmpApiService);
    private _loadingDashboardData$ = new BehaviorSubject<boolean>(true);
    private _situationViewModel$ = new BehaviorSubject<Record<string, SituationViewModel[]> | undefined>(
        undefined,
    );
    readonly situationViewModels$ = this._situationViewModel$.asObservable();
    constructor() {
        super();
    }
    ngOnDestroy(): void {
        super.destroy();
    }

    async loadData() {
        const viewModel = await this.wmpApiService.getSituationViewModel();
        this._situationViewModel$.next(viewModel);
        this._loadingDashboardData$.next(false);
    }
}
