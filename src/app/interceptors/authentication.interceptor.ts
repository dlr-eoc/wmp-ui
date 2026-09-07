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

import {inject, Injectable} from "@angular/core";
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";
import {AuthenticationService} from "src/app/shared/services/user/authentication.service";

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
    private authService = inject(AuthenticationService);

    /**
     * The intercept function adds Authorization to every Http request. Authorization is given by
     * {@link AuthenticationService}
     * @param request - the request itself to be called
     * @param next - the HttpHandler for the newly created request with Authorization
     */
    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        if (this.authService.getBasicAuthHeader() !== null) {
            return next.handle(
                request.clone({
                    setHeaders: {
                        Authorization: this.authService.getBasicAuthHeader() || "",
                    },
                }),
            );
        }
        return next.handle(request.clone({withCredentials: true}));
    }
}
