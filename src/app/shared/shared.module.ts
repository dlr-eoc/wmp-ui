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
import {CommonModule} from '@angular/common';
import {HeaderComponent} from './components/header/header.component';
import {LengthPipe} from './pipes/length.pipe';
import {ReplacePipe} from './pipes/replace.pipe';
import {MillisecondPipe} from './pipes/millisecond.pipe';
import {ClarityModule} from '@clr/angular';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgxMaskModule} from 'ngx-mask';
import {RouterModule} from '@angular/router';
import {FallbackPipe} from 'src/app/pipes/conversion.pipe';
import {Button} from 'primeng/button';
import {ToggleSwitch} from 'primeng/toggleswitch';
import {MainPrimeContainerComponent} from 'src/app/shared/components/main-container/main-prime-ngcontainer/main-prime-container.component';
import {MainMixedLoginContainerComponent} from 'src/app/shared/components/main-container/main-mixed-login-container/main-mixed-login-container.component';
import {Breadcrumb} from 'primeng/breadcrumb';
import {ContextMenuComponent} from 'src/app/shared/components/header/context-menu/context-menu.component';

const declarations: any[] = [
    HeaderComponent,
    MainPrimeContainerComponent,
    MainMixedLoginContainerComponent,
    LengthPipe,
    ReplacePipe,
    MillisecondPipe,
];

const commonModules: any[] = [
    CommonModule,
    RouterModule,
    ClarityModule,
    ReactiveFormsModule,
    FormsModule,
    NgxMaskModule.forRoot(),
];

// const functions: any[] = [fieldMatchValidator];
/**
 * @deprecated see https://v17.angular.io/guide/sharing-ngmodules#sharing-modules and https://angular.dev/guide/ngmodules/overview
 * <br> Do not use NgModule in new code! Use Standalone Components and add only necessary imports
 */
@NgModule({
    imports: [
        commonModules,
        FallbackPipe,
        Button,
        ToggleSwitch,
        Breadcrumb,
        ContextMenuComponent,
        ...declarations,
    ],
    exports: [...declarations, ...commonModules],
})
export class SharedModule {}
