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

import {TestBed} from '@angular/core/testing';
import {WorkflowFilterService} from 'src/app/components/workflow-page/service/workflow-filter.service';
import {getCommonComponentTestProviders} from 'src/app/test-utils/test-setup';

describe('WorkflowFilterService', () => {
    let service: WorkflowFilterService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [...getCommonComponentTestProviders()],
        });
        service = TestBed.inject(WorkflowFilterService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should merge filter correctly', () => {
        const filter = {
            dummyId: 1,
            processDefinition: {id: 'procdefid1', key: 'procde1key'},
        };
        service.mergeFilter(filter);
        const otherFilter = {
            dummyId: 2,
            processInstanceId: 'otherFilter',
            processDefinition: {id: 'procdefid2', key: 'procde1key'},
        };
        service.mergeFilter(otherFilter);
        service.filter$.subscribe((f) => {
            if ((f as any).dummyId === 2) {
                expect(f?.processDefinition?.id).toEqual(otherFilter.processDefinition.id);
                expect(f?.processDefinition?.key).toEqual(otherFilter.processDefinition.key);
                expect(f?.processInstanceId).toEqual(otherFilter.processInstanceId);
            }
            return;
        });
    });
});
