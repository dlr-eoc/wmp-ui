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

import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthenticationService} from 'src/app/shared/services/user/authentication.service';
import {AlertService, WmpAlertType} from 'src/app/shared/services/alert.service';

import {NavigationService} from 'src/app/shared/services/client/router/navigation/navigation.service';
import {ClrCommonFormsModule, ClrIconModule, ClrInputModule, ClrPasswordModule} from '@clr/angular';
import {APP_URL_HOME} from 'src/app/app.constants';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        ClrInputModule,
        ClrCommonFormsModule,
        ClrPasswordModule,
        ClrIconModule,
    ],
})
export class LoginPageComponent {
    private authService = inject(AuthenticationService);

    private alertService = inject(AlertService);
    private navigationService = inject(NavigationService);

    public static readonly LOGIN_SUCCESSFUL_ID = 'login_successful_alert';
    public static readonly LOGIN_SUCCESSFUL_TEXT = 'Login successful!';

    error: boolean = false;
    isKerberosAuth: boolean = false;
    isBasicAuth: boolean = true;
    kerberosErrorMessage: string = 'Windows AD User not found';
    kerberosUsername: string = '';

    loginForm = new FormGroup({
        username: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required),
    });

    setAuthTo(authVariant: string): void {
        if (authVariant === 'kerberos') {
            this.isBasicAuth = false;
            this.isKerberosAuth = true;
            this.kerberosUsername = '';
            this.kerberosAuthentication();
        } else if (authVariant === 'basic-auth') {
            this.isBasicAuth = true;
            this.isKerberosAuth = false;
            this.kerberosUsername = '';
        }
    }

    kerberosLogin(): Promise<boolean> {
        this.authService.kerberosUser = this.kerberosUsername;
        this.alertService.addAlert({
            id: LoginPageComponent.LOGIN_SUCCESSFUL_ID,
            type: WmpAlertType.SUCCESS,
            text: LoginPageComponent.LOGIN_SUCCESSFUL_TEXT,
        });
        return this.navigationService.navigateByUrl(APP_URL_HOME);
    }

    kerberosAuthentication(): void {
        this.authService.authenticateByKerberos().subscribe({
            next: (data: string) => {
                if (data != '' && !data.startsWith('<')) {
                    this.isKerberosAuth = true;
                    this.kerberosUsername = data;
                } else {
                    this.kerberosErrorMessage = 'Server does not support Kerberos';
                    this.isKerberosAuth = false;
                }
            },
            error: (_err: any) => {
                this.kerberosErrorMessage = 'Windows AD User not found';
                this.isKerberosAuth = false;
            },
        });
    }

    handleLogin(): void {
        const getUsername = this.loginForm.controls.username.value;
        const getPassword = this.loginForm.controls.password.value;

        if (getUsername != null && getPassword != null) {
            this.error = false;
            this.authService.login(this.loginForm).subscribe((successful) => {
                if (!successful) {
                    this.error = true;
                }
            });
        }
    }
}
