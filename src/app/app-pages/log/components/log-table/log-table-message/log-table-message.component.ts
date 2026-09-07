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

import {Component, input, viewChild} from "@angular/core";
import {SlicePipe} from "@angular/common";
import {FallbackPipe} from "src/app/pipes/conversion.pipe";
import {Popover} from "primeng/popover";
import {Button} from "primeng/button";
import {Tooltip} from "primeng/tooltip";
import {CdkCopyToClipboard} from "@angular/cdk/clipboard";

@Component({
    selector: "app-log-table-message",
    imports: [SlicePipe, FallbackPipe, Popover, Button, Tooltip, CdkCopyToClipboard],
    templateUrl: "./log-table-message.component.html",
    styleUrl: "./log-table-message.component.scss",
})
export class LogTableMessageComponent {
    $message = input.required<string | undefined>();

    readonly op = viewChild.required<Popover>("op");

    togglePopOver(event: MouseEvent) {
        this.op().toggle(event);
    }
}
