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

import {ComponentFixture, TestBed} from "@angular/core/testing";

import {ProcessBridgeDetailComponent} from "src/app/app-pages/bridge/components/process-bridge/process-bridge-detail/process-bridge-detail.component";
import {getCommonComponentTestProviders} from 'src/app/test-utils/test-setup';

describe("ProcessBridgeDetailComponent", () => {
    let component: ProcessBridgeDetailComponent;
    let fixture: ComponentFixture<ProcessBridgeDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProcessBridgeDetailComponent],
         providers: [getCommonComponentTestProviders()]}).compileComponents();

        fixture = TestBed.createComponent(ProcessBridgeDetailComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
