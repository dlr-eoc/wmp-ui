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

import {FilterTableBase} from 'src/app/shared/services/utils/FilterManager';

export const EMPTY_LOG_MESSAGE_DATA = {
    maxResults: 0,
    messages: [],
} satisfies LogMessageData;
export interface LogMessageData {
    maxResults: number;
    messages: LogMessage[];
}
export interface LogMessage {
    timestamp: number;
    logLevel: string;
    thread: string;
    name: string;
    requestId: string;
    processDefinitionId: string;
    processInstanceId: string;
    topicGroup: string;
    topic: string;
    execution: string;
    processBridge: string;
    message: string;
}
export const LOG_FILTER_IDENTIFIER = 'LogFilter';
export interface LogFilter extends FilterTableBase {
    //FIXME remove processInstanceId from LogFilter use WorkflowFilter
    processInstanceId?: string;
    activityInstanceId?: string;
    requestId?: string;
    logLevel?: string;
    offset?: number;
}
export const EMPTY_LOG_FILTER: LogFilter = {
    page: 0,
    pageSize: 10,
    filterIdentifier: LOG_FILTER_IDENTIFIER,
};
