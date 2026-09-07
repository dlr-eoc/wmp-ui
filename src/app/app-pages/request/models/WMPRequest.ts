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

export enum RequestStatus {
    ACTIVE = "ACTIVE",
    FAILED = "FAILED",
    FINISHED = "FINISHED",
}

export interface RequestData {
    requestAttributes: Map<string, string>;
    parameters: Map<string, string>;
}

export interface WMPRequest {
    id: string;
    type: string;
    creationDate: Date;
    priority: number;
    status: RequestStatus;
    requestAttributes: WMPRequestAttributes;
    parameters: Map<string, string>;
}
export interface WMPRequestAttributes {
    [key: string]: string;
}
