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

import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {scan} from 'rxjs/operators';
import {v4 as uuid} from 'uuid';
import {MessageService} from 'primeng/api';
import {TOAST_POSITION_BOTTOM_RIGHT_KEY} from 'src/app/app.constants';

const DEFAULT_LIFE_TIME_ALERT = 3000;

@Injectable({
    providedIn: 'root',
})
export class AlertService {
    private alerts$ = new BehaviorSubject<WmpAlert[]>([]);
    private currentAlerts: WmpAlert[] = [];

    constructor() {}

    private messageService = inject(MessageService);

    addWarning(alert: WmpAlert | string) {
        if (typeof alert !== 'string') {
            this.addAlert({...alert, type: WmpAlertType.WARN});
        } else {
            this.addAlert({text: alert, type: WmpAlertType.WARN});
        }
    }

    addAlert(alert: WmpAlert) {
        if (alert.id === undefined) {
            alert.id = uuid();
        }

        this.messageService.add({
            severity: alert.type,
            summary: this.getSummaryFromAlert(alert),
            detail: alert.text,
            key: this.getPositionKeyFromType(alert.type),
            life: DEFAULT_LIFE_TIME_ALERT,
            id: alert.id,
        });

        // Some alerts should only be present once - check for the id
        if (this.currentAlerts.filter((a) => a.id === alert.id).length === 0) {
            this.currentAlerts.push(alert);
            this.alerts$.next(this.currentAlerts);
        }
    }

    public deleteAlert(alert: WmpAlert) {
        this.currentAlerts = this.currentAlerts.filter((a) => a.id !== alert.id);
        this.alerts$.next(this.currentAlerts);
    }

    public getAlerts(): Observable<WmpAlert[]> {
        return this.alerts$.pipe(scan((acc, value) => Object.assign(acc, value)));
    }

    private getSummaryFromAlert(alert: WmpAlert) {
        if (alert.summary) {
            return alert.summary;
        }
        switch (alert.type) {
            case WmpAlertType.ERROR:
                return 'Error';
            case WmpAlertType.SUCCESS:
                return 'Success';
            case WmpAlertType.WARN:
                return 'Warning';
            default:
                return (alert?.type ?? '').toString();
        }
    }

    private getPositionKeyFromType(type: WmpAlertType | undefined) {
        switch (type) {
            case WmpAlertType.ERROR:
            case WmpAlertType.WARN:
                return TOAST_POSITION_BOTTOM_RIGHT_KEY;
            default:
                return TOAST_POSITION_BOTTOM_RIGHT_KEY;
        }
    }
}

export interface WmpAlert {
    id?: string; // id still necessary? see multiple alert handling in {@link AlertService}
    type?: WmpAlertType;
    text: string;
    summary?: string; //summary of alert (title of message), none present - default used
}

/**
 * Enum mapped onto primeng
 */
export enum WmpAlertType {
    SUCCESS = 'success',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    CONTRAST = 'contrast',
    SECONDARY = 'secondary',
}
