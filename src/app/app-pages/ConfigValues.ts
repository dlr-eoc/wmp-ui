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

/**
 * All names have to be equal with given backend identifiers.
 * Take a look at RequestVisualizationNaming.java and PAGE_CONFIG_IDENTIFIER.java
 */
export enum PAGE_CONFIG_IDENTIFIER {
    REQUEST = "REQUEST",
    PROCESS_BRIDGE = "PROCESS_BRIDGE",
    ADMIN = "ADMIN",
}

export enum REQUEST_CONFIG_TABLES {
    REQUEST_TABLE_LIST = "request_list_table",
    REQUEST_DETAIL_INFO = "request_detail_info",
}
export enum LOG_CONFIG_TABLES {
    LOG_TABLE_LIST = "log_list_table",
}
