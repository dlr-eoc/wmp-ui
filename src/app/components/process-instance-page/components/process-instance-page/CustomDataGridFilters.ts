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

import { ClrDatagridStringFilterInterface } from '@clr/angular';
import { HistoricVariableInstanceDto } from 'src/app/shared/services/camunda-api';

export class VariableNameFilter
  implements ClrDatagridStringFilterInterface<HistoricVariableInstanceDto>
{
  accepts(variable: HistoricVariableInstanceDto, search: string): boolean {
    if (variable.name) {
      return variable?.name?.toLowerCase().indexOf(search) >= 0;
    } else {
      return true;
    }
  }
}

export class IncidentActivityIdFilter
  implements ClrDatagridStringFilterInterface<any>
{
  accepts(variable: any, search: string): boolean {
    if (variable.activityId) {
      return variable?.activityId?.toLowerCase().indexOf(search) >= 0;
    } else {
      return true;
    }
  }
}

export class IncidentMessageFilter
  implements ClrDatagridStringFilterInterface<any>
{
  accepts(variable: any, search: string): boolean {
    if (variable.incidentMessage) {
      return variable?.incidentMessage?.toLowerCase().indexOf(search) >= 0;
    } else {
      return true;
    }
  }
}
