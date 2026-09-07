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

import {EMPTY, Observable, Observer, Subject, zip} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';

/**
 * Class with helpers for observables.
 * Assure to use OnDestroy interface on component! Example:
 * ```
 * export class ConfirmDialogComponent extends AsyncDestroyable implements OnDestroy {
 *    //[...]
 *     ngOnDestroy(): void {
 *         this.destroy();
 *     }
 *     //[...]
 * }
 * ```
 *
 */
export class AsyncDestroyable {
    private readonly _onDestroy = new Subject<void>();

    /**
     * example usage in parent angular component:
     * ```
     * //Simple Function
     *  ngOnInit() {
     *         this.subscribeWithDestroyHandler(this.dialogTextInputHandler.isDialogOpen, (isDialogOpen) => {
     *             this.dialogOpen = isDialogOpen;
     *         });
     *     }
     * //Usage with Observer
     * ngOnInit() {
     *         this.subscribeWithDestroyHandler(this.dialogTextInputHandler.isDialogOpen, {
     *             next: (isDialogOpen: boolean) => {
     *                 this.dialogOpen = isDialogOpen;
     *             },
     *             error: (e: any) => {
     *                 console.debug(e);
     *                 this.dialogError = true;
     *                 this.dialogOpen = false;
     *                 //... other error handling
     *             },
     *         });
     *     }
     * ```
     * @param observable the observable to ... observe...
     * @param subscribeAction the action to happen on observable change, could be a simple function
     * or a (partial) observer
     */
    subscribeWithDestroyHandler<T>(
        observable: Observable<T> | undefined,
        subscribeAction: ((value: T) => void) | Partial<Observer<T>>,
    ) {
        if (!observable) return EMPTY.pipe(takeUntil(this._onDestroy)).subscribe();
        return observable.pipe(takeUntil(this._onDestroy)).subscribe(subscribeAction);
    }

    /**
     * example usage in parent angular component:
     * ```
     *  ngOnInit() {
     *         this.subscribeWithDestroyHandlerAndDebounce(this.dialogTextInputHandler.isDialogOpen, (isDialogOpen) => {
     *             this.dialogOpen = isDialogOpen;
     *         },100);
     *     }
     * ```
     * @param observable the observable to ... observe...
     * @param subscribeAction the action to happen on observable change
     * @param timeDebounceMs the debounce time in ms (default 100ms)
     */
    subscribeWithDestroyHandlerAndDebounce<T>(
        observable: Observable<T> | undefined,
        subscribeAction: (value: T) => void,
        timeDebounceMs: number = 100,
    ) {
        if (!observable) return EMPTY.pipe(takeUntil(this._onDestroy)).subscribe();
        return observable
            .pipe(takeUntil(this._onDestroy), debounceTime(timeDebounceMs))
            .subscribe(subscribeAction);
    }

    subscribeWithGivenDestroyHandler<T>(
        observable$: Observable<T> | undefined,
        listenOn: Observable<void>,
        subscribeAction: ((value: T) => void) | Partial<Observer<T>>,
    ) {
        if (!observable$) return EMPTY.pipe(takeUntil(this._onDestroy)).subscribe();
        return observable$.pipe(takeUntil(listenOn)).subscribe(subscribeAction);
    }

    subscribeAsZip<T, Z>(
        firstObservable: Observable<T>,
        secondObservable: Observable<Z>,
        subscribeAction: ([val1, val2]: readonly [T, Z]) => void,
    ) {
        return zip(firstObservable, secondObservable)
            .pipe(takeUntil(this._onDestroy))
            .subscribe(subscribeAction);
    }

    /**
     * This function correctly destroys all subscriptions done with the ```subscribeWithDestroyHandler```.<br>
     * Assure to call correctly in parent angular component (implements OnDestroy needed):
     * ```
     * ngOnDestroy(): void {
     *         this.onDestroy.next();
     *     }
     * ```
     */
    destroy(): void {
        this._onDestroy.next();
    }
}
