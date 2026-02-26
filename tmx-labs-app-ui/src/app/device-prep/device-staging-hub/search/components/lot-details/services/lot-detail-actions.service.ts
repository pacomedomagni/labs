import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
    DeviceActivationAction,
    DeviceLotStatus,
} from 'src/app/shared/data/lot-management/resources';
import { LotManagementService } from 'src/app/shared/services/api/lot-management/lot-management.service';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { DeviceDetailsStateService, DeviceLotStateService } from '../../../services';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';

@Injectable({
    providedIn: 'root',
})
export class LotDetailActionsService {
    private readonly dialogService = inject(DialogService);
    private readonly lotService = inject(LotManagementService);
    private readonly deviceState = inject(DeviceDetailsStateService);
    private readonly lotState = inject(DeviceLotStateService);
    private readonly notificationBannerService = inject(NotificationBannerService);

    activateLot(lotSeqId: number, lotName: string): Observable<boolean> {
        return this.openActivationConfirmationDialog(lotName, DeviceActivationAction.Activate).pipe(
            switchMap((confirmed) => {
                if (!confirmed) {
                    return of(false);
                }
                return this.lotService.activateAllDevicesInLot(lotSeqId).pipe(
                    tap(() => {
                        this.deviceState.updateFieldForAllDevices('isSimActive', true);
                    }),
                    map(() => true),
                    catchError(() => {
                        this.notificationBannerService.error('Failed to activate lot');
                        return of(false);
                    }),
                );
            }),
        );
    }

    deactivateLot(lotSeqId: number, lotName: string): Observable<boolean> {
        return this.openActivationConfirmationDialog(
            lotName,
            DeviceActivationAction.Deactivate,
        ).pipe(
            switchMap((confirmed) => {
                if (!confirmed) {
                    return of(false);
                }
                return this.lotService.deactivateAllDevicesInLot(lotSeqId).pipe(
                    tap(() => {
                        this.deviceState.updateFieldForAllDevices('isSimActive', false);
                    }),
                    map(() => true),
                    catchError(() => {
                        this.notificationBannerService.error('Failed to deactivate lot');
                        return of(false);
                    }),
                );
            }),
        );
    }

    updateLotStatus(lotSeqId: number, lotType: number, lotName: string): Observable<boolean> {
        return this.dialogService
            .openConfirmationDialog({
                title: 'Update Lot Status',
                message:
                    "Are you sure you want to update the lot status to 'Received by Distributor'?",
                subtitle: `Lot ID: ${lotName}`,
                confirmText: 'Yes',
                cancelText: 'Cancel',
            })
            .afterClosed()
            .pipe(
                switchMap((confirmed) => {
                    if (!confirmed) {
                        return of(false);
                    }
                    return this.lotService
                        .updateLotStatus(lotSeqId, lotType, DeviceLotStatus.ShipmentReceivedByDistributor)
                        .pipe(
                            tap(() => {
                                this.lotState.updateDeviceLotField('statusCode', DeviceLotStatus.ShipmentReceivedByDistributor);
                                this.notificationBannerService.success('Update Lot Status Successful');
                            }),
                            map(() => true),
                            catchError(() => {
                                this.notificationBannerService.error('Failed to update lot status');
                                return of(false);
                            }),
                        );
                }),
            );
    }

    private openActivationConfirmationDialog(
        lotName: string,
        action: DeviceActivationAction,
    ): Observable<boolean> {
        return this.dialogService
            .openConfirmationDialog({
                title: `${action === DeviceActivationAction.Activate ? 'Activate' : 'Deactivate'} Lot`,
                subtitle: `Lot ID: ${lotName}`,
                message: `Are you sure you want to ${action === DeviceActivationAction.Activate ? 'activate' : 'deactivate'} all ${action === DeviceActivationAction.Activate ? 'inactive' : 'active'} devices in this lot? Changes may take up to one hour to apply.`,
                confirmText: 'Yes',
                cancelText: 'Cancel',
            })
            .afterClosed();
    }
}
