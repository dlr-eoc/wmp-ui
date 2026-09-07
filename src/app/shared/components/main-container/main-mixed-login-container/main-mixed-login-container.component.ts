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

import {Component} from "@angular/core";
import {RouterOutlet} from "@angular/router";

@Component({
    selector: "app-main-mixed-login-container",
    templateUrl: "./main-mixed-login-container.component.html",
    styleUrl: "./main-mixed-login-container.component.scss",
    imports: [RouterOutlet],
})
export class MainMixedLoginContainerComponent {
    //  implements OnInit
    // private messageService = inject(MessageService);
    // // private alertService = inject(AlertService);
    // constructor() {}
    // ngOnInit(): void {
    //     this.messageService.add({
    //         severity: "warn",
    //         summary: "Warn Message",
    //         detail: "Message Content",
    //         key: "bl",
    //         life: 3000,
    //     });
    // }
}
