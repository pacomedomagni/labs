import { Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { ApplicationGroupIds } from './shared/data/application/application-groups.model';
import { SsoLoginComponent } from './shared/components/auth/sso-login.component';
import {
    ForbiddenComponent,
    NotFoundComponent,
    TechnicalDifficultyComponent,
    UnauthenticatedComponent,
} from '@pgr-cla/core-ui-components';
import { OAuthSsoCallbackComponent } from './shared/components/auth/oauth-sso-callback.component';
import { GrayCardTemplateComponent } from './shared/components/layout/page-templates/gray-outline.component/gray-card-template.component';
import { RolesAuthGuard } from './shared/guards/roles-auth.guard';
import { UserRoles } from './shared/data/application/constants';

export const routes: Routes = [
    {
        path: '',
        component: GrayCardTemplateComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: ApplicationGroupIds.Portal,
                pathMatch: 'full',
            },
            {
                path: ApplicationGroupIds.Portal,
                canActivate: [AuthGuard],
                loadComponent: () =>
                    import('./portal/portal.component').then((m) => m.PortalContainerComponent),
            },
            {
                path: ApplicationGroupIds.DevicePreparation,
                canActivate: [AuthGuard],
                data: {
                    breadcrumb: {
                        label: 'Device Preparation',
                        disable: true,
                    },
                },
                loadComponent: () =>
                    import('./device-prep/device-prep.component').then(
                        (m) => m.DevicePrepComponent,
                    ),
                children: [
                    {
                        path: ApplicationGroupIds.BenchTestHub,
                        loadComponent: () =>
                            import(
                                './device-prep/bench-test-hub/device-bench-test-hub.component'
                            ).then((m) => m.TmxDeviceBenchTestHubComponent),
                    },
                    {
                        path: ApplicationGroupIds.DeviceStagingHub,
                        loadComponent: () =>
                            import(
                                './device-prep/device-staging-hub/device-staging-hub.component'
                            ).then((m) => m.DeviceStagingHubComponent),
                        children: [
                            {
                                path: 'ActivateDeactivateDevices',
                                loadComponent: () =>
                                    import(
                                        './device-prep/device-staging-hub/activate-de-activate/tmx-activate-de-activate.component'
                                    ).then((m) => m.TmxActivateDeActivateComponent),
                            },
                            {
                                path: 'ReceiveDevices',
                                loadComponent: () =>
                                    import(
                                        './device-prep/device-staging-hub/receive-devices/tmx-receive-devices.component'
                                    ).then((m) => m.TmxReceiveDevicesComponent),
                            },
                            {
                                path: 'ImportDeviceLot',
                                loadComponent: () =>
                                    import(
                                        './device-prep/device-staging-hub/import-device-lot/tmx-import-device-lot.component'
                                    ).then((m) => m.TmxImportDeviceLotComponent),
                            },
                        ]
                    },
                ],
            },
            {
                path: ApplicationGroupIds.DeviceReturn,
                data: {
                    breadcrumb: 'Device Return',
                },
                canActivate: [AuthGuard],
                loadComponent: () =>
                    import('./device-return/device-return.component').then(
                        (m) => m.DeviceReturnComponent,
                    ),
            },
            {
                path: ApplicationGroupIds.CustomerService,
                data: {
                    breadcrumb: {
                        label: 'Customer Service',
                        disable: true,
                    },
                },
                canActivate: [AuthGuard],
                loadComponent: () =>
                    import('./customer-service/customer-service.component').then(
                        (m) => m.CustomerServiceContainerComponent,
                    ),
                children: [
                    { path: '', redirectTo: 'Apps', pathMatch: 'full' },
                    {
                        path: 'Apps',
                        data: {
                            breadcrumb: {
                                disable: true,
                            },
                        },
                        children: [
                            { path: '', redirectTo: 'Search', pathMatch: 'full' },
                            {
                                path: 'Search',
                                loadComponent: () =>
                                    import('./customer-service/search/search.component').then(
                                        (m) => m.CustomerServiceSearchComponent,
                                    ),
                            },
                            {
                                path: 'Fulfillment',
                                loadComponent: () =>
                                    import('./fulfillment/fulfillment.component').then(
                                        (m) => m.CustomerServiceFulfillmentComponent,
                                    ),
                            },
                            {
                                path: 'DeviceRecovery',
                                loadComponent: () =>
                                    import('./device-recovery/device-recovery.component').then(
                                        (m) => m.CustomerServiceDeviceRecoveryComponent,
                                    ),
                            },
                            {
                                path: 'SnapshotJourney',
                                loadComponent: () =>
                                    import('./snapshot-journey/snapshot-journey.component').then(
                                        (m) => m.CustomerServiceSnapshotJourneyComponent,
                                    ),
                            },
                        ],
                    },
                ],
            },
            {
                path: ApplicationGroupIds.UserManagement,
                data: {
                    breadcrumb: {
                        label: 'User Management',
                        disable: true,
                    },
                },
                children: [
                    { path: '', redirectTo: 'Apps', pathMatch: 'full' },
                    {
                        path: 'Apps',
                        data: {
                            breadcrumb: {
                                label: 'Apps',
                                disable: true,
                            },
                        },
                        children: [
                            { path: '', redirectTo: 'EnrollNewUser', pathMatch: 'full' },
                            {
                                path: 'EnrollNewUser',
                                data: {
                                    breadcrumb: {
                                        label: 'Enroll New User',
                                        disable: true,
                                    },
                                    roles: [UserRoles.LabsAdmin],
                                },
                                canActivate: [RolesAuthGuard],
                                loadComponent: () =>
                                    import(
                                        './user-management/enroll-new-user/enroll-new-user.component'
                                    ).then((m) => m.EnrollNewUserComponent),
                            },
                        ],
                    },
                ],
            },
        ],
    },
    { path: 'forbidden', component: ForbiddenComponent, data: { title: 'Forbidden' } },
    { path: 'login', component: SsoLoginComponent },
    { path: 'oauth_sso', component: OAuthSsoCallbackComponent },
    { path: 'unauthorized', component: UnauthenticatedComponent, data: { title: 'Unauthorized' } },
    {
        path: 'techdiff',
        component: TechnicalDifficultyComponent,
        data: {
            title: 'Technical Difficulty',
            message: 'Uh oh... It looks like something went wrong.',
        },
    },
    { path: '**', component: NotFoundComponent, data: { title: 'Page Not Found' } },
];
