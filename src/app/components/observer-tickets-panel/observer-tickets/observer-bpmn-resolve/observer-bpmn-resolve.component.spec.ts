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

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ObserverBpmnResolveComponent} from 'src/app/components/observer-tickets-panel/observer-tickets/observer-bpmn-resolve/observer-bpmn-resolve.component';
import {getCommonComponentTestProviders} from 'src/app/test-utils/test-setup';
import {MOCK_EMPTY_bpmnManager} from 'src/app/test-utils/test-service-mocks';

describe('ObserverBpmnResolveComponent', () => {
    let component: ObserverBpmnResolveComponent;
    let fixture: ComponentFixture<ObserverBpmnResolveComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ObserverBpmnResolveComponent],
            providers: [getCommonComponentTestProviders()],
        }).compileComponents();

        fixture = TestBed.createComponent(ObserverBpmnResolveComponent);

        fixture.componentRef.setInput(
            '_$bpmnHandlerServiceProcessInstance',
            MOCK_EMPTY_bpmnManager.bpmnHandler,
        );

        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
