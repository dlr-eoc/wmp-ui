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

import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

export class DialogTextInputHandler {
    private readonly _isDialogOpen: Subject<boolean>;
    private readonly _onDialogConfirmed: Subject<string>;
    private readonly _onHandlerAfterDialogConfirmed: Subject<string>;
    private readonly _onDestroy = new Subject<void>();

    constructor() {
        this._isDialogOpen = new Subject();
        this._isDialogOpen.next(false); //default: dialog not open on creation
        this._onDialogConfirmed = new Subject();
        this._onHandlerAfterDialogConfirmed = new Subject();
    }

    /**
     * This function triggers the start of a confirmation dialog. After the registration of the confirmation
     * handler the _isDialogOpen value is getting set to true to show the dialog.
     * Confirmation -> the Subject _onDialogConfirmed gets a new (void) value and the handler is called.
     *
     * @param actionAfterConfirmed - the function that should be called after the dialog was confirmed
     * @return An Observable to signalize if the dialog got successfully confirmed and the actionAfterConfirmed is done
     */
    openDialogAndHandleResult(actionAfterConfirmed: (text: string) => void) {
        //register handler: what happens if the dialog got confirmed?
        this._onDialogConfirmed.pipe(takeUntil(this._onDestroy)).subscribe((text) => {
            this.handleDialogConfirmed(text, actionAfterConfirmed);
        });
        //change boolean to open the dialog
        this._isDialogOpen.next(true);

        return this._onHandlerAfterDialogConfirmed.asObservable();
    }

    onDestroy() {
        this._onDestroy.next();
        this._isDialogOpen.next(false);
    }

    /**
     * This function handles what happens after the dialog got confirmed.
     * @param text - the text entered by the user
     * @param actionAfterConfirmed -  the action to happen after the confirmation
     */
    private handleDialogConfirmed(text: string, actionAfterConfirmed: (text: string) => void) {
        actionAfterConfirmed(text);
        this._onHandlerAfterDialogConfirmed.next('');
        this.onDestroy(); //destroy dialog
    }

    get isDialogOpen(): Subject<boolean> {
        return this._isDialogOpen;
    }

    get onDialogConfirmed(): Subject<string> {
        return this._onDialogConfirmed;
    }
}
