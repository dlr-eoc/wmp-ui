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

import {Component, inject, input, OnDestroy} from '@angular/core';
import {WMPRequest} from 'src/app/app-pages/request/models/WMPRequest';
import {KeyValue, KeyValuePipe} from '@angular/common';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';
import {TableConfigService} from 'src/app/shared/services/user/visualize/table-config.service';
import {WmpRequestService} from 'src/app/shared/services/wmp-api/custom/wmp-request.service';
import {FloatLabel} from 'primeng/floatlabel';
import {Button} from 'primeng/button';
import {Accordion, AccordionContent, AccordionHeader, AccordionPanel} from 'primeng/accordion';
import {Divider} from 'primeng/divider';
import {RequestPageDetailProcessInstanceComponent} from 'src/app/app-pages/request/components/detail/request-page-detail-pi.component';
import {InputText} from 'primeng/inputtext';
import {PAGE_CONFIG_IDENTIFIER} from 'src/app/app-pages/ConfigValues';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'request-page-detail',
    templateUrl: './request-page-detail.component.html',
    styleUrls: ['./request-page-detail.component.scss'],
    standalone: true,
    imports: [
        FloatLabel,
        Button,
        Accordion,
        AccordionPanel,
        AccordionHeader,
        AccordionContent,
        Divider,
        RequestPageDetailProcessInstanceComponent,
        InputText,
        FormsModule,
        KeyValuePipe,
    ],
})
export class RequestPageDetailComponent extends AsyncDestroyable implements OnDestroy {
    private tableConfigService = inject(TableConfigService);
    private wmpRequestService = inject(WmpRequestService);

    request = input.required<WMPRequest>();

    columns: string[] = [];
    command: string = '';

    constructor() {
        super();
        this.subscribeWithDestroyHandler(this.tableConfigService.tableColumns$, (columns) => {
            this.columns = columns.get(PAGE_CONFIG_IDENTIFIER.REQUEST) ?? [];
        });
    }

    addAttributeToTable(attribute: KeyValue<string, string>) {
        this.tableConfigService.addTableColumn(PAGE_CONFIG_IDENTIFIER.REQUEST, attribute.key);
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    removeAttribute(attribute: KeyValue<string, string>) {
        this.tableConfigService.removeTableColumn(PAGE_CONFIG_IDENTIFIER.REQUEST, attribute.key);
    }

    handleClick() {
        this.wmpRequestService.sendCommand(this.request().id, this.command).then(() => {
            this.command = '';
        });
    }
}
