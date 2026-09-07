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

import {BpmnDiagramOverlayLabel, BpmnHtmlOverlay} from 'src/app/models/bpmn-diagram.model';
import {BehaviorSubject, Observable} from 'rxjs';

/**
 * This Storage needs to be used together with the {@link BpmnOverlayHandler}!
 * The handler synchronizes the overlays and handles the usage
 */
export class BpmnOverlayStorage {
    private _currentOverlay$ = new BehaviorSubject<BpmnHtmlOverlay | undefined>(undefined);
    private _overlayToRemove$ = new BehaviorSubject<BpmnHtmlOverlay | undefined>(undefined);
    private _createdOverlays$ = new BehaviorSubject<BpmnHtmlOverlay[]>([]);
    private _labels$ = new BehaviorSubject<BpmnDiagramOverlayLabel[]>([]);
    private _selection$ = new BehaviorSubject<BpmnHtmlOverlay | undefined>(undefined);

    /**
     * Add overlay or overrides (if one with same elementId present) overlay in BehaviorSubject.
     * @param overlay
     */
    addOverlay(overlay: BpmnHtmlOverlay) {
        this._currentOverlay$.next(overlay);
    }

    /**
     * Adding labels to overlay
     * @param labels
     */
    updateLabels(labels: BpmnDiagramOverlayLabel[]) {
        this._labels$.next(labels);
    }

    setSelection(selection: BpmnHtmlOverlay | undefined) {
        this.removeAllSelections(); //first remove all selections
        if (selection) {
            this.addOverlay(selection);
        }
        this._selection$.next(selection);
    }

    /**
     * Clears all data from the OverlayStorage
     */
    clear() {
        this._createdOverlays$.getValue().forEach((overlay) => {
            //remove everyCreatedOverlay
            this._overlayToRemove$.next(overlay);
        });
        //set all states to initial value
        this._currentOverlay$.next(undefined);
        this._overlayToRemove$.next(undefined);
        this._createdOverlays$.next([]);
        // this._selection$.next(undefined);
        this._labels$.next([]);
    }

    /**
     * Updates the overlay with idOfOverlayCreated.
     */
    addCreatedOverlay(overlay: BpmnHtmlOverlay, idOfOverlayCreated: string) {
        const overlayToAdd = {...overlay};
        overlayToAdd.idOfCreatedOverlay = idOfOverlayCreated;
        this.replaceOrAddOverlay(overlayToAdd);
    }

    private replaceOrAddOverlay(overlay: BpmnHtmlOverlay) {
        const createdOverlays = this._createdOverlays$.getValue();
        const foundOverlay = createdOverlays.find(
            (otherOverlay) =>
                otherOverlay.uniqueIdentifier === overlay.uniqueIdentifier &&
                otherOverlay.type === overlay.type,
        );
        if (foundOverlay) {
            //already present overlay, remove old one, add to list
            this._overlayToRemove$.next(foundOverlay); //assure to remove old overlay
            const otherOverlays = createdOverlays.filter((otherOverlay) => {
                //filter all whom are with not the same uniqueIdentifier or the same type
                return (
                    otherOverlay.uniqueIdentifier !== overlay.uniqueIdentifier ||
                    otherOverlay.type !== overlay.type
                );
            });
            this._createdOverlays$.next([...otherOverlays, overlay]);
        } else {
            //just add it to list
            this._createdOverlays$.next([...createdOverlays, overlay]);
        }
    }

    private removeAllSelections() {
        this._createdOverlays$
            .getValue()
            .filter((otherOverlay) => otherOverlay.type === 'selection')
            .forEach((overlayToRemove) => this._overlayToRemove$.next(overlayToRemove));
    }

    get labels$(): Observable<BpmnDiagramOverlayLabel[]> {
        return this._labels$.asObservable();
    }

    get currentOverlay$(): Observable<BpmnHtmlOverlay | undefined> {
        return this._currentOverlay$.asObservable();
    }

    get selection$(): Observable<BpmnHtmlOverlay | undefined> {
        return this._selection$.asObservable();
    }

    get overlayToRemove$(): BehaviorSubject<BpmnHtmlOverlay | undefined> {
        return this._overlayToRemove$;
    }
}
