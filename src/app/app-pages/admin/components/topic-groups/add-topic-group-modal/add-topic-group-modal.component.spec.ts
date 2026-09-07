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

import {AddTopicGroupModalComponent} from 'src/app/app-pages/admin/components/topic-groups/add-topic-group-modal/add-topic-group-modal.component';
import {getCommonComponentTestProviders} from 'src/app/test-utils/test-setup';

describe('AddTopicGroupModalComponent', () => {
    let component: AddTopicGroupModalComponent;
    let fixture: ComponentFixture<AddTopicGroupModalComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AddTopicGroupModalComponent],
            providers: [getCommonComponentTestProviders()],
        });
        fixture = TestBed.createComponent(AddTopicGroupModalComponent);
        fixture.componentRef.setInput('addModalOpen', false);
        fixture.componentRef.setInput('addModalData', {});

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
