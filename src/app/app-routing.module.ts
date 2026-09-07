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

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {authenticationGuard} from './guards/authentication.guard';

import {
    APP_URL_ADMIN,
    APP_URL_BRIDGE,
    APP_URL_DASHBOARD,
    APP_URL_HOME,
    APP_URL_LOG,
    APP_URL_LOGIN,
    APP_URL_REQUESTS,
    APP_URL_WORKFLOWS,
} from 'src/app/app.constants';

export const routes: Routes = [
    // login separation from other pages
    {
        path: APP_URL_LOGIN,
        loadComponent: () =>
            import('src/app/shared/components/main-container/main-mixed-login-container/main-mixed-login-container.component').then(
                (m) => m.MainMixedLoginContainerComponent,
            ),
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./components/login-page/login-page.component').then((m) => m.LoginPageComponent),
            },
        ],
    },
    {
        path: '',
        loadComponent: () =>
            import('src/app/shared/components/main-container/main-prime-ngcontainer/main-prime-container.component').then(
                (m) => m.MainPrimeContainerComponent,
            ),
        children: [
            {path: '', redirectTo: APP_URL_HOME, pathMatch: 'full'},
            {
                path: APP_URL_DASHBOARD,
                loadComponent: () =>
                    import('src/app/app-pages/dashboard/dashboard.component').then(
                        (m) => m.DashboardComponent,
                    ),
            },
            {
                path: APP_URL_REQUESTS,
                loadComponent: () =>
                    import('src/app/app-pages/request/components/request-page.component').then(
                        (m) => m.RequestPageComponent,
                    ),
            },
            {
                path: APP_URL_WORKFLOWS,
                loadComponent: () =>
                    import('src/app/app-pages/workflow-page/components/workflow-page.component').then(
                        (m) => m.WorkflowPageComponent,
                    ),
            },
            {
                path: APP_URL_BRIDGE,
                loadComponent: () =>
                    import('src/app/app-pages/bridge/components/process-bridge/process-bridge.component').then(
                        (m) => m.ProcessBridgeComponent,
                    ),
            },
            {
                path: APP_URL_LOG,
                loadComponent: () =>
                    import('src/app/app-pages/log/components/log-page.component').then(
                        (m) => m.LogPageComponent,
                    ),
            },
            {
                path: APP_URL_ADMIN,
                loadComponent: () =>
                    import('src/app/app-pages/admin/admin.component').then((m) => m.AdminComponent),
                children: [
                    {
                        path: 'users',
                        loadComponent: () =>
                            import('src/app/app-pages/admin/components/users/users.component').then(
                                (m) => m.UsersComponent,
                            ),
                    },
                    {
                        path: 'topic-groups',
                        loadComponent: () =>
                            import('src/app/app-pages/admin/components/topic-groups/topic-groups.component').then(
                                (m) => m.TopicGroupsComponent,
                            ),
                    },
                    {
                        path: 'executions',
                        loadComponent: () =>
                            import('src/app/app-pages/admin/components/executions/executions.component').then(
                                (m) => m.ExecutionsComponent,
                            ),
                    },
                ],
            },
            {
                path: '**',
                loadComponent: () =>
                    import('./components/not-found/not-found.component').then((m) => m.NotFoundComponent),
            },
        ],
        canActivate: [authenticationGuard],
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {bindToComponentInputs: true})],
    exports: [RouterModule],
})
export class AppRoutingModule {}
