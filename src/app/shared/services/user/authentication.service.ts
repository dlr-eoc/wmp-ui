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

import {HttpClient} from '@angular/common/http';
import {inject, Injectable, OnDestroy} from '@angular/core';
import {lastValueFrom, Observable, Subject} from 'rxjs';
import {ConfigService} from 'src/app/shared/services/config.service';
import {LocalStorageService} from 'src/app/shared/services/client/storage/local-storage.service';
import {NavigationService} from 'src/app/shared/services/client/router/navigation/navigation.service';
import {FilterStorageService} from 'src/app/shared/services/client/filter/filter-storage.service';
import {UserProfileDto, UserService} from 'src/app/shared/services/camunda-api';
import {FormControl, FormGroup} from '@angular/forms';
import {AlertService, WmpAlertType} from 'src/app/shared/services/alert.service';
import {LoginPageComponent} from 'src/app/components/login-page/login-page.component';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {APP_URL_WORKFLOWS} from 'src/app/app.constants';

@Injectable({
    providedIn: 'root',
})
/**
 * The AuthenticationService is handling login/logout functionality. The {@link AuthenticationInterceptor}
 * is using the information of the AuthenticationService to add Authentication to every request.
 */
export class AuthenticationService extends AsyncDestroyable implements OnDestroy {
    private http = inject(HttpClient);
    private navigationService = inject(NavigationService);
    private configService = inject(ConfigService);
    private userService = inject(UserService);
    private alertService = inject(AlertService);

    private localStorageService = inject(LocalStorageService);
    private filterStorageService = inject(FilterStorageService);

    public static BASIC_AUTH_KEY = 'wmpBasicAuth';
    public static BASIC_AUTH_USER_KEY = 'wmpBasicAuthUser';

    public kerberosUser?: string;
    public authenticationTried: boolean = false;

    private apiUrl = '';

    constructor() {
        super();
        const configService = this.configService;

        this.apiUrl = configService.settings.jakartaURL;
    }

    ngOnDestroy(): void {
        super.destroy();
    }

    async canActivate(): Promise<boolean> {
        // Try Kerberos Authentication (Request with "withCredentials") first
        if (!this.authenticationTried) {
            this.authenticationTried = true;
            try {
                let data = await lastValueFrom(
                    this.http.get(this.apiUrl + '/api/login', {
                        responseType: 'text',
                    }),
                );

                // When a HTML document is returned, than Kerberos is not active
                if (data.startsWith('<')) {
                    // Try to extract BasicAuthInformation from LocalStorage
                    if (this.getBasicAuthHeader() === null) {
                        this.navigationService.navigateByUrl('/login');
                        return false;
                    }
                    return true;
                }

                this.kerberosUser = data.toString();
                return true;
            } catch (e) {
                // Try to extract BasicAuthInformation from LocalStorage
                if (this.getBasicAuthHeader() === null) {
                    this.navigationService.navigateByUrl('/login');
                    return false;
                }
                return true;
            }
        }

        // Check if user is logged in
        if (this.getBasicAuthHeader() === null && this.kerberosUser === undefined) {
            this.navigationService.navigateByUrl('/login');
            return false;
        }
        return true;
    }

    authenticateByKerberos(): Observable<string> {
        return this.http.get(this.apiUrl + '/api/login', {responseType: 'text'});
    }

    login(
        formGroup: FormGroup<{
            username: FormControl<string | null>;
            password: FormControl<string | null>;
        }>,
    ) {
        const username = formGroup.controls.username.value;
        const password = formGroup.controls.password.value;
        const loginResult = new Subject<boolean>();

        if (username && password) {
            try {
                const basicAuthHeader = 'Basic ' + btoa(username + ':' + password);
                this.setBasicAuthHeader(basicAuthHeader);
                super.subscribeWithDestroyHandler(this.userService.getUserProfile(username), {
                    next: (data: UserProfileDto) => {
                        this.setBasicAuthUser(data.lastName + ', ' + data.firstName);
                        this.navigationService
                            .navigateByUrl('/' + APP_URL_WORKFLOWS)
                            .then(() => {
                                this.alertService.addAlert({
                                    id: LoginPageComponent.LOGIN_SUCCESSFUL_ID,
                                    type: WmpAlertType.SUCCESS,
                                    text: LoginPageComponent.LOGIN_SUCCESSFUL_TEXT,
                                });
                                loginResult.next(true);
                            })
                            .catch(() => {
                                //just unable to navigate, to start page, loginResult still
                                loginResult.next(false);
                            });
                    },
                    error: (_e: any) => {
                        this.removeBasicAuthHeader();
                        formGroup.controls.password.reset();
                        loginResult.next(false);
                    },
                });
            } catch (e: any) {
                formGroup.controls.password.reset();
                loginResult.next(false);
            }
        }
        //return the loginResult as obersvable
        return loginResult.asObservable();
    }

    getLoggedInUser() {
        if (this.kerberosUser !== undefined) {
            return this.kerberosUser;
        }

        if (this.getBasicAuthUser() !== null) {
            return this.getBasicAuthUser();
        }

        return '';
    }

    logout() {
        this.kerberosUser = undefined;

        this.localStorageService.removeItem(AuthenticationService.BASIC_AUTH_KEY);
        this.localStorageService.removeItem(AuthenticationService.BASIC_AUTH_USER_KEY);
        this.filterStorageService.removeFilterStorage();

        return this.navigationService.navigateByUrl('/login');
    }

    getBasicAuthHeader(): string | null {
        return this.localStorageService.getItem(AuthenticationService.BASIC_AUTH_KEY);
    }

    getBasicAuthUser(): string | null {
        return this.localStorageService.getItem(AuthenticationService.BASIC_AUTH_USER_KEY);
    }

    setBasicAuthHeader(value: string): void {
        this.localStorageService.setItem(AuthenticationService.BASIC_AUTH_KEY, value);
    }

    setBasicAuthUser(value: string): void {
        this.localStorageService.setItem(AuthenticationService.BASIC_AUTH_USER_KEY, value);
    }

    removeBasicAuthHeader(): void {
        this.localStorageService.removeItem(AuthenticationService.BASIC_AUTH_KEY);
    }

    removeBasicAuthUser(): void {
        this.localStorageService.removeItem(AuthenticationService.BASIC_AUTH_USER_KEY);
    }
}
