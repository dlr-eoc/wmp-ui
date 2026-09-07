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

import {
    EditTopicGroupModalComponent,
    TopicGroupEditModalData,
} from 'src/app/app-pages/admin/components/topic-groups/edit-topic-group-modal/edit-topic-group-modal.component';
import {getCommonComponentTestProviders} from 'src/app/test-utils/test-setup';

describe('EditTopicGroupModalComponent', () => {
    let component: EditTopicGroupModalComponent;
    let fixture: ComponentFixture<EditTopicGroupModalComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [EditTopicGroupModalComponent],
            providers: [getCommonComponentTestProviders()],
        });
        fixture = TestBed.createComponent(EditTopicGroupModalComponent);
        fixture.componentRef.setInput('editModalOpen', false);
        fixture.componentRef.setInput('editModalData', {
            executions: [],
            topicGroup: {},
        } as TopicGroupEditModalData);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
