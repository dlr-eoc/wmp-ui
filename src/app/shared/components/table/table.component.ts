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

import {
    Component,
    ElementRef,
    inject,
    input,
    OnChanges,
    OnDestroy,
    OnInit,
    output,
    SimpleChanges,
    TemplateRef,
    viewChild,
} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {Table, TableLazyLoadEvent, TableModule, TableService} from 'primeng/table';
import {ColumnDefSortAndFilterable} from 'src/app/shared/components/table/data/TableTypes';
import {DomHandler} from 'primeng/dom';
import {ObjectUtils} from 'primeng/utils';
import {tableFactory, TableSelectionType} from 'src/app/shared/components/table/TableUtils';
import {
    TableConfigElement,
    VISUAL_CONFIGURATION_TYPE,
} from 'src/app/shared/services/user/models/VisualizeConfigData';
import {VisualizeConfigService} from 'src/app/shared/services/user/visualize/visualize-config.service';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';

@Component({
    selector: 'app-table',
    imports: [TableModule, NgTemplateOutlet],
    //Those providers are needed to assure table can be used correctly.
    // Else the checkboxes would not work correctly.
    // See https://github.com/primefaces/primeng/issues/7985#issuecomment-515537861
    // and https://stackoverflow.com/a/53961309
    providers: [
        DomHandler,
        ObjectUtils,
        TableService,
        {
            provide: Table,
            useFactory: tableFactory,
            deps: [TableComponent],
        },
    ],
    templateUrl: './table.component.html',
    styleUrl: './table.component.scss',
})
/**
 *  This Component is a helper to create tables more easily.
 *  See {@link RequestPageTableComponent} (single select)
 *  or {@link WorkflowTableComponent} (multi select)<br><br>
 *
 *  Example Code:<br>
 *  ```
 *  <app-table
 *     [columnTemplate]="customTableColumns"
 *     [totalAvailableCount]="totalAvailableRequests"
 *     [availableData]="availableRequests"
 *     [defaultColumnsOfTable]="columnsOfTable"
 *     [tableConfigurationIdentifier]="REQUEST_CONFIG_TABLES.REQUEST_TABLE_LIST"
 *     selectionMode="single"
 *     (onLazyLoad)="handleLazyLoad($event)"
 *     (onSingleSelectionChanged)="handleSelectionChange($event)"
 * >
 *     <ng-template let-entry="entryOfTable" let-columns="columnsOfTable" #customTableColumns>
 *         <tr [pSelectableRow]="entry">
 *             @for (column of columns; track column.field) {
 *                 @switch (column.field) {
 *                     @case ("creationDate") {
 *                         <td>{{ entry[column.field] | date: "medium" }}</td>
 *                     }
 *                     @default {
 *                         @if (column.customColumn) {//custom columns need a resolve to retrieve the correct information
 *                             <td>{{ this.getFromRequestAttributes(column, entry) }}</td>
 *                         } @else {
 *                             <td>{{ entry[column.field] }}</td>
 *                         }
 *                     }
 *                 }
 *             }
 *         </tr>
 *     </ng-template>
 * </app-table>
 *  ```
 *
 */
export class TableComponent<T> extends AsyncDestroyable implements OnInit, OnDestroy, OnChanges {
    private visualizeConfig = inject(VisualizeConfigService);

    columnTemplate = input<TemplateRef<any>>();
    tableReference = viewChild.required<ElementRef<Table>>('tableReference');

    paginationEnabled = input<boolean>(true);
    lazyEnabled = input<boolean>(true);
    menuHeaderEnabled = input<boolean>(false);
    defaultRows = input<number>(10);

    totalAvailableCount = input<number>(0);
    availableData = input.required<T[]>();
    defaultColumnsOfTable = input.required<ColumnDefSortAndFilterable[]>();

    firstSelection = input<T[]>([]);

    selectionMode = input<TableSelectionType>(undefined);

    tableConfigurationIdentifier = input<string>('');

    onLazyLoad = output<TableLazyLoadEvent>();
    onSelectionChanged = output<T[]>();
    onSingleSelectionChanged = output<T | undefined>();

    selectedElementOrArrayOfElement: T[] | T | undefined = undefined;

    customColumnsFromVisualizeConfig: ColumnDefSortAndFilterable[] = [];
    columnsOfTable: ColumnDefSortAndFilterable[] = [];

    first = 0;

    constructor() {
        super();
        this.subscribeWithDestroyHandler(this.visualizeConfig.config$, (value) => {
            const visualConfig = value.getConfigForComponent(
                VISUAL_CONFIGURATION_TYPE.TABLE,
                this.tableConfigurationIdentifier(),
            );
            const tableElement = value.getConfigElementAsType(
                VISUAL_CONFIGURATION_TYPE.TABLE,
                visualConfig,
            ) as TableConfigElement;
            const columns = tableElement.columns.map((columnIdentifier) => {
                return {
                    field: columnIdentifier,
                    header: columnIdentifier,
                    customColumn: true,
                } satisfies ColumnDefSortAndFilterable;
            });
            //TODO visual config
            //FIXME remove this test for custom columns defined by backend, after backend got dummies removed
            const removeDummyData = columns.filter(
                (column) => !column.field.toLowerCase().includes('attrproperty'),
            );
            this.customColumnsFromVisualizeConfig = [...removeDummyData];
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        //assure to build columns of table correctly
        this.columnsOfTable = [...this.defaultColumnsOfTable(), ...this.customColumnsFromVisualizeConfig];
    }

    ngOnDestroy(): void {
        this.destroy();
    }

    ngOnInit(): void {
        this.selectedElementOrArrayOfElement = this.firstSelection();
    }

    handleLazyLoad($event: TableLazyLoadEvent) {
        this.onLazyLoad.emit($event);
    }

    handleSelectionChange() {
        //On this function call, the selections already present in directive input

        if (this.selectionMode() === 'multiple') {
            //see primeng doc, on multiple always an array
            this.onSelectionChanged.emit(this.selectedElementOrArrayOfElement as T[]);
        } else {
            this.onSingleSelectionChanged.emit(this.selectedElementOrArrayOfElement as T);
        }
    }
}
