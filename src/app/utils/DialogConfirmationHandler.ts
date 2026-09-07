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

import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";

export class DialogConfirmationHandler {
    private readonly _isDialogOpen: Subject<boolean>;
    private readonly _onDialogConfirmed: Subject<void>;
    private readonly _onHandlerAfterDialogConfirmed: Subject<void>;
    private readonly _onDestroy = new Subject<void>();

    constructor() {
        this._isDialogOpen = new Subject();
        this._isDialogOpen.next(false); //default: dialog not open on creation
        this._onDialogConfirmed = new Subject();
        this._onHandlerAfterDialogConfirmed = new Subject();
    }
    onDestroy() {
        this._onDestroy.next();
        this._isDialogOpen.next(false);
    }

    /**
     * This function triggers the start of a confirmation dialog. After the registration of the confirmation
     * handler the _isDialogOpen value is getting set to true to show the dialog.
     * Confirmation -> the Subject _onDialogConfirmed gets a new (void) value and the handler is called.
     *
     * @param actionAfterConfirmed - the function that should be called after the dialog was confirmed
     * @return An Observable to signalize if the dialog got successfully confirmed and the actionAfterConfirmed is done
     */
    openDialogAndHandleResult(actionAfterConfirmed: () => void) {
        //register handler: what happens if the dialog got confirmed?
        this._onDialogConfirmed
            .pipe(takeUntil(this._onDestroy))
            .subscribe(this.handleDialogConfirmed(actionAfterConfirmed));
        //change boolean to open the dialog
        this._isDialogOpen.next(true);

        return this._onHandlerAfterDialogConfirmed.asObservable();
    }

    /**
     * This function handles
     * @param actionAfterConfirmed
     * @private
     */
    private handleDialogConfirmed(actionAfterConfirmed: () => void) {
        return () => {
            actionAfterConfirmed();
            this._isDialogOpen.next(false);
            this._onHandlerAfterDialogConfirmed.next();
        };
    }

    get isDialogOpen(): Subject<boolean> {
        return this._isDialogOpen;
    }

    get onDialogConfirmed(): Subject<void> {
        return this._onDialogConfirmed;
    }
}
