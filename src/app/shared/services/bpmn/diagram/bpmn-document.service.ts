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

import {lastValueFrom, Observable, Subject} from 'rxjs';
import {Configuration, ProcessDefinitionService} from 'src/app/shared/services/camunda-api';
import {HttpClient} from '@angular/common/http';
import {ConfigService} from 'src/app/shared/services/config.service';
import {BpmnDiagramService} from 'src/app/shared/services/bpmn/diagram/bpmn-diagram.service';
import {AsyncDestroyable} from 'src/app/utils/AsyncDestroyable';

export interface ActivityNames {
    [activityId: string]: string;
}

export class BpmnDocumentService extends AsyncDestroyable {
    private readonly httpClient: HttpClient;
    private readonly configService: ConfigService;
    private readonly bpmnDiagramService: BpmnDiagramService;

    private processDefinitionService: ProcessDefinitionService;
    private readonly _bpmnDocument$ = new Subject<Document>();
    private readonly _activityNames$ = new Subject<ActivityNames>();

    private bpmnDocument: Document | undefined = undefined;

    constructor(
        httpClient: HttpClient,
        configService: ConfigService,
        bpmnDiagramService: BpmnDiagramService,
    ) {
        super();
        this.httpClient = httpClient;
        this.configService = configService;
        this.bpmnDiagramService = bpmnDiagramService;
        const apiUrl = this.configService.settings.jakartaURL;
        const baseUrl = apiUrl + '/engine/default';
        const config = new Configuration({
            // password: 'demo',
            // username: 'demo',
        });
        this.processDefinitionService = new ProcessDefinitionService(this.httpClient, baseUrl, config);
        this.subscribeWithDestroyHandler(this._bpmnDocument$.asObservable(), (bpmnDocument: Document) => {
            this.bpmnDocument = bpmnDocument;
        });
    }

    /**
     * Updating BPMN Document, automatically loading into diagram services.
     * This function should be called if the BPMN should be changed or reloaded.
     * @param processDefinitionId
     */
    async updateBPMNDocumentFromPDId(processDefinitionId: string): Promise<Document> {
        return this.getProcessDefinitionFileAsDocument(processDefinitionId)
            .then(async (document) => {
                const bpmnDocumentAsString = new XMLSerializer().serializeToString(document);
                await this.bpmnDiagramService.loadFromNewBPMN(bpmnDocumentAsString);
                this._bpmnDocument$.next(document);
                return document;
            })
            .then((document) => {
                //update ActivityNames after documentLoaded
                this.updateActivityNames(document);
                return document;
            });
    }

    async retrieveDocumentFromPDId(processDefinitionId: string): Promise<Document> {
        return this.getProcessDefinitionFileAsDocument(processDefinitionId);
    }

    /**
     *
     * @param processDefinitionId
     */
    async getProcessDefinitionFileAsDocument(processDefinitionId: string): Promise<Document> {
        const xmlDefinition =
            (
                await lastValueFrom(
                    this.processDefinitionService.getProcessDefinitionBpmn20Xml(processDefinitionId),
                )
            ).bpmn20Xml || '';

        const pd = await lastValueFrom(
            this.processDefinitionService.getProcessDefinition(processDefinitionId),
        );

        const parser = new DOMParser();

        // Some BPMN-XML files contain multiple process definitions. We only want to access the selected one
        const bpmnDocument = parser.parseFromString(xmlDefinition, 'text/xml');

        // Multiple process definitions appear in the collaboration as participants as well as own process nodes
        const participants = bpmnDocument.getElementsByTagName('bpmn:participant');
        const processes = bpmnDocument.getElementsByTagName('bpmn:process');

        for (let i = 0; i < participants.length; i++) {
            const p = participants.item(i);
            if (p && p?.getAttribute('processRef') !== pd.key) {
                let element = bpmnDocument.getElementById(p.id);
                if (element) {
                    // Setting the outerHTML to an empty string will effectively removing the node from the bpmnDocument
                    element.outerHTML = '';
                    // The index has to be updated, as the participants array is dynamically updated and the removed node can no longer be found
                    i -= 1;
                }
            }
        }

        for (let i = 0; i < processes.length; i++) {
            const p = processes.item(i);
            if (p && p?.getAttribute('id') !== pd.key) {
                let element = bpmnDocument.getElementById(p.id);
                if (element) {
                    element.outerHTML = '';
                    i -= 1;
                }
            }
        }

        return bpmnDocument;
    }

    getActivityFromCurrentBPMN(activityId: string) {
        const node = this.bpmnDocument?.querySelector(`#${activityId}`);
        const activityName = node?.getAttribute('name');
        return activityName ?? undefined;
    }

    /**
     * This function updates the ActivityNames of the given document.
     * @param document the document
     */
    private updateActivityNames(document: Document) {
        const activityNames: {[activityId: string]: string} = {};
        if (document !== undefined) {
            const nodes = document.querySelectorAll(
                'task, serviceTask, receiveTask, sendTask, manualTask, businessRuleTask, userTask, scriptTask, startEvent, endEvent',
            );

            nodes.forEach((node) => {
                const activityName = node?.getAttribute('name');
                const activityId = node?.getAttribute('id');
                if (activityId) {
                    activityNames[activityId] = activityName || activityId;
                }
            });
        }
        this._activityNames$.next(activityNames);
        return activityNames;
    }

    /**
     * Careful using this document, it should only be used to read data.
     * All changes and diagram reloads should happen inside the document services.
     */
    get bpmnDocument$(): Observable<Document> {
        return this._bpmnDocument$.asObservable();
    }

    get activityNames$(): Observable<ActivityNames> {
        return this._activityNames$.asObservable();
    }
}
