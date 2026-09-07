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

import {BehaviorSubject, Observable} from 'rxjs';

export class CustomRendererService {
    constructor() {}

    private _isActive$ = new BehaviorSubject<boolean>(false);

    get isActive$(): Observable<boolean> {
        return this._isActive$.asObservable();
    }

    /**
     * This function controls the {@link CustomBPMNRenderer}. It should not be called
     * "just to make something active". Use with caution!
     *
     * The {@link CustomBPMNRenderer} should be set to inactive before importing any new bpm to assure
     * the state of the {@link CustomBPMNRenderer} is correctly reset and every old subscription is removed.
     *<br>
     *
     * <br><br>
     * Using multiple {@link CustomBPMNRenderer} at once is not implemented at this Moment! For this
     * case a register of active {@link CustomBPMNRenderer}s could be helpful
     * @param shouldBeActive - setting the custom renderer to active or inactive
     */
    setActive(shouldBeActive: boolean) {
        this._isActive$.next(shouldBeActive);
    }
}
