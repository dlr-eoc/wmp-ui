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

import {InjectionToken} from '@angular/core';
import {IAppConfig} from './shared/services/IAppConfig';
import {
    checkIcon,
    ClarityIcons,
    cogIcon,
    fileGroupIcon,
    fileIcon,
    historyIcon,
    homeIcon,
    loginIcon,
    logoutIcon,
    minusIcon,
    networkGlobeIcon,
    pauseIcon,
    playIcon,
    plusIcon,
    refreshIcon,
    repeatIcon,
    stopIcon,
    terminalIcon,
    trashIcon,
    userIcon,
    usersIcon,
} from '@cds/core/icon';

export const APP_CONFIG: InjectionToken<IAppConfig> = new InjectionToken<IAppConfig>(
    'Application Configuration',
);
// export const APP_URL_WORKFLOWS = "workflows"; //deprecated old workflows

export const APP_URL_DASHBOARD = 'dashboard';
export const APP_URL_WORKFLOWS = 'workflows';
export const APP_URL_BRIDGE = 'bridge';
export const APP_URL_LOG = 'log';
export const APP_URL_TIMERS = 'timers';
export const APP_URL_ADMIN = 'admin';
export const APP_URL_LOGIN = 'login';
export const APP_URL_REQUESTS = 'requests';

export const APP_URL_HOME = APP_URL_DASHBOARD; //simple selection of default home element

export const TOAST_POSITION_BOTTOM_LEFT_KEY = 'bl';
export const TOAST_POSITION_BOTTOM_RIGHT_KEY = 'br';

//adding clarity icons globally
ClarityIcons.addIcons(
    cogIcon,
    trashIcon,
    pauseIcon,
    refreshIcon,
    playIcon,
    stopIcon,
    networkGlobeIcon,
    homeIcon,
    plusIcon,
    minusIcon,
    checkIcon,
    repeatIcon,
    historyIcon,
    userIcon,
    usersIcon,
    loginIcon,
    logoutIcon,
    fileGroupIcon,
    fileIcon,
    terminalIcon,
);
