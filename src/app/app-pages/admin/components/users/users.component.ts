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

import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {
    ClrDatagridModule,
    ClrDatagridSortOrder,
    ClrDatagridStateInterface,
    ClrIconModule,
} from '@clr/angular';
import {GroupDto, GroupService, UserProfileDto, UserService} from 'src/app/shared/services/camunda-api';
import {lastValueFrom} from 'rxjs';
import {NavigationService} from 'src/app/shared/services/client/router/navigation/navigation.service';

import {AddUserModalComponent} from './add-user-modal/add-user-modal.component';
import {EditUserModalComponent} from './edit-user-modal/edit-user-modal.component';
import {ManageGroupsModalComponent} from './manage-groups-modal/manage-groups-modal.component';
import {ConfirmCancelDialogComponent} from 'src/app/shared/components/dialog/confirm-cancel-dialog/confirm-cancel-dialog.component';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    imports: [
        ClrDatagridModule,
        ClrIconModule,
        AddUserModalComponent,
        EditUserModalComponent,
        ManageGroupsModalComponent,
        ConfirmCancelDialogComponent,
    ],
})
export class UsersComponent implements OnInit {
    private userService = inject(UserService);
    private groupService = inject(GroupService);
    private activeRoute = inject(ActivatedRoute);
    private navigationService = inject(NavigationService);

    // tableData
    tableEntries: UserProfileDto[] = [];
    selectedEntries: UserProfileDto[] = [];
    loading: boolean = false;
    initializeFinished: boolean = false;

    currentPage: number = 1;
    currentPageSize: number = 10;
    currentSort: string = '';
    currentSortOrder: ClrDatagridSortOrder = ClrDatagridSortOrder.UNSORTED;
    totalEntries: number = 0;

    // Confirmation dialog
    usersDeletionConfirmationModalOpen = signal<boolean>(false);
    usersDeletionConfirmationEntries = signal<UserProfileDto[] | undefined>(undefined);
    clearSelectedAfterDeletionConfirmation: boolean = false;

    // Add user dialog
    addUserModalOpen: boolean = false;

    // Edit user dialog
    editUserModalOpen: boolean = false;
    editUserData: UserProfileDto = {};

    // Add user to group dialog
    manageGroupsModalOpen: boolean = false;
    manageGroupsModalData?: any = {};

    async ngOnInit() {
        // Retrieve query params
        const firstName = this.activeRoute.snapshot.queryParamMap.get('firstName');
        const lastName = this.activeRoute.snapshot.queryParamMap.get('lastName');
        const email = this.activeRoute.snapshot.queryParamMap.get('email');
        const page = this.activeRoute.snapshot.queryParamMap.get('page');
        const pageSize = this.activeRoute.snapshot.queryParamMap.get('pageSize');
        const sortBy = this.activeRoute.snapshot.queryParamMap.get('sortBy');
        const sortOrder = this.activeRoute.snapshot.queryParamMap.get('sortOrder');

        this.currentPageSize = pageSize === null ? this.currentPageSize : Number(pageSize);
        this.currentPage = page === null ? this.currentPage : Number(page);
        this.currentSort = sortBy === null ? this.currentSort : sortBy;
        this.currentSortOrder = sortOrder === null ? this.currentSortOrder : Number(sortOrder);

        await this.updateTableData(
            this.currentPage,
            this.currentPageSize,
            firstName || '',
            lastName || '',
            email || '',
            this.currentSort,
            this.currentSortOrder,
        );
        this.initializeFinished = true;
    }

    async updateTableData(
        page: number,
        size: number,
        firstName: string,
        lastName: string,
        email: string,
        sortBy: string,
        sortOrder: number,
    ) {
        this.loading = true;
        let params = {} as any;
        if (firstName !== '') params.firstNameLike = '%' + firstName + '%';
        if (lastName !== '') params.lastNameLike = '%' + lastName + '%';
        if (email !== '') params.emailLike = '%' + email + '%';
        if (sortBy !== '') {
            params.sortBy = sortBy;
            if (sortOrder === 1) params.sortOrder = 'asc';
            if (sortOrder === -1) params.sortOrder = 'desc';
        }

        const countResult = await lastValueFrom(this.userService.getUserCount());
        if (countResult.count) {
            this.totalEntries = countResult.count;
        }
        params = {...params, firstResult: (page - 1) * size, maxResults: size};
        this.tableEntries = await lastValueFrom(this.userService.getUsers(params));
        this.loading = false;
    }

    // Server side refreshing of table data
    async refresh(state: ClrDatagridStateInterface) {
        if (this.initializeFinished) {
            let firstName = '';
            let lastName = '';
            let email = '';

            if (state && state.filters) {
                state.filters.forEach((filter) => {
                    if (filter.property === 'firstName') firstName = filter.value;
                    if (filter.property === 'lastName') lastName = filter.value;
                    if (filter.property === 'email') email = filter.value;
                });
            }

            if (state && state.sort && state.sort.by && state.sort.reverse !== undefined) {
                this.currentSort = state.sort.by.toString();
                this.currentSortOrder = state.sort.reverse
                    ? ClrDatagridSortOrder.DESC
                    : ClrDatagridSortOrder.ASC;
            }

            if (state && state.page && state.page.current && state.page.size) {
                this.currentPage = state.page.current;
                this.currentPageSize = state.page.size;
            }

            return this.updateTableData(
                this.currentPage,
                this.currentPageSize,
                firstName,
                lastName,
                email,
                this.currentSort,
                this.currentSortOrder,
            ).then(() => {
                this.navigationService.updateQueryParams({
                    firstName: firstName === '' ? undefined : firstName,
                    lastName: lastName === '' ? undefined : lastName,
                    email: email === '' ? undefined : email,
                    page: this.currentPage,
                    pageSize: this.currentPageSize,
                    sortBy: this.currentSort === '' ? undefined : this.currentSort,
                    sortOrder: this.currentSort === '' ? undefined : this.currentSortOrder,
                });
            });
        }
    }

    async waitAndUpdateUserList() {
        await new Promise((f) => setTimeout(f, 200));
        this.updateUserList();
    }

    // Refresh table data
    updateUserList() {
        const firstName = this.activeRoute.snapshot.queryParamMap.get('firstName');
        const lastName = this.activeRoute.snapshot.queryParamMap.get('lastName');
        const email = this.activeRoute.snapshot.queryParamMap.get('email');
        this.updateTableData(
            this.currentPage,
            this.currentPageSize,
            firstName || '',
            lastName || '',
            email || '',
            this.currentSort,
            this.currentSortOrder,
        );
    }

    // Create new user
    addNewUser() {
        this.addUserModalOpen = true;
    }

    // Edit user
    editUser(user: UserProfileDto) {
        this.editUserData = user;
        this.editUserModalOpen = true;
    }

    // Manage groups for user
    async manageGroups(user: UserProfileDto) {
        const groups = await lastValueFrom(this.groupService.getQueryGroups());
        const userGroups = await lastValueFrom(
            this.groupService.getQueryGroups({member: user.id} as any),
        ).catch((_e) => {
            return [] as GroupDto[];
        });

        const groupData = groups.map((group) => {
            return {
                value: userGroups.reduce((found, current) => {
                    return found || current.id === group.id;
                }, false),
                ...group,
            };
        });

        this.manageGroupsModalData = {userId: user.id, groups: groupData};
        this.manageGroupsModalOpen = true;
    }

    // Delete selected user(s)
    async deleteSelectedUsers() {
        this.usersDeletionConfirmationModalOpen.set(true);
        this.usersDeletionConfirmationEntries.set([...this.selectedEntries]);
        this.clearSelectedAfterDeletionConfirmation = true;
    }

    async deleteSingleUser(user: UserProfileDto) {
        this.usersDeletionConfirmationModalOpen.set(true);
        this.usersDeletionConfirmationEntries.set([user]);
        this.clearSelectedAfterDeletionConfirmation = false;
    }

    async onConfirmUserDeletion(users: UserProfileDto[] | undefined) {
        if (!users) return;

        for (let entry of users) {
            if (entry.id) {
                await lastValueFrom(this.userService.deleteUser(entry.id));
            }
        }

        await new Promise((f) => setTimeout(f, 200));
        this.updateUserList();

        this.usersDeletionConfirmationModalOpen.set(false);

        if (this.clearSelectedAfterDeletionConfirmation) {
            this.selectedEntries = [];
        }
    }
}
