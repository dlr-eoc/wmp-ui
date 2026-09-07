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

import {HttpParams} from "@angular/common/http";
import {WMPRequest} from "src/app/app-pages/request/models/WMPRequest";
import {ColumnDefSortAndFilterable} from "src/app/shared/components/table/data/TableTypes";
import {FilterTableBase} from "src/app/shared/services/utils/FilterManager";

export enum RequestSortDefinition {
    id = "id",
    creationDate = "creationDate",
}
export const REQUEST_FILTER_IDENTIFIER = "RequestFilter";
export interface RequestFilter extends FilterTableBase {
    state?: string;
}

export function isValidRequest(
    f: RequestFilter | undefined,
    requestIdInFilter: string | undefined,
    request: WMPRequest,
) {
    if (f === undefined) {
        return true;
    }
    if (requestIdInFilter) {
        if (!request.id.toLowerCase().includes(requestIdInFilter.toLowerCase())) {
            return false;
        }
    }
    if (f.state) {
        if (request.status.toString().toLowerCase() !== f.state.toLowerCase()) {
            return false;
        }
    }
    return true;
}

export function generateQueryParams(filter: RequestFilter | undefined) {
    let params = new HttpParams();
    if (filter === undefined) {
        return params;
    }
    if (filter.ascendingOrder !== undefined) {
        params = params.append("ascendingOrder", filter.ascendingOrder);
    }
    if (filter.orderByField) {
        params = params.append("orderByField", filter.orderByField);
    }
    if (filter.pageSize) {
        params = params.append("limit", filter.pageSize);
    }
    if (filter.page && filter.pageSize) {
        const offset = (filter.page - 1) * filter.pageSize;
        //page = 2; pageSize = 10 -> offset = 10
        //page = 1; pageSize = 10 -> offset = 0
        params = params.append("offset", offset);
    }
    return params;
}

export function getQueryParamsFromRequestFilter(filter: RequestFilter | undefined) {
    return {
        orderByField: filter?.orderByField,
        ascendingOrder: filter?.ascendingOrder,
        page: filter?.page,
        pageSize: filter?.pageSize,
    };
}
export function getRequestFilterFromStorage(filter: RequestFilter | undefined) {
    return {
        state: filter?.state,
        orderByField: filter?.orderByField,
        ascendingOrder: filter?.ascendingOrder,
        page: filter?.page,
        pageSize: filter?.pageSize,
        logLevel: filter?.logLevel,
        offset: filter?.offset,
    };
}

export const REQUEST_COLUMNS_DEFAULT: ColumnDefSortAndFilterable[] = [
    {field: "id", header: "Id", isFilterable: true},
    {field: "type", header: "Type"},
    {field: "status", header: "Status"},
    {field: "creationDate", header: "Creation Date"},
];
