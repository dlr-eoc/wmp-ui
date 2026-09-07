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

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditExecutionModalComponent } from 'src/app/app-pages/admin/components/executions/edit-execution-modal/edit-execution-modal.component';
import {getCommonComponentTestProviders} from 'src/app/test-utils/test-setup';

describe('EditExecutionModalComponent', () => {
  let component: EditExecutionModalComponent;
  let fixture: ComponentFixture<EditExecutionModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [EditExecutionModalComponent]
, providers: [getCommonComponentTestProviders()]});
    fixture = TestBed.createComponent(EditExecutionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
