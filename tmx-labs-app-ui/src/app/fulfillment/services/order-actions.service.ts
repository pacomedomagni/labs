import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CompletedDeviceOrder, DeviceOrder } from '../../shared/data/fulfillment/resources';
import { DialogService } from '../../shared/services/dialogs/primary/dialog.service';

@Injectable({
    providedIn: 'root',
})
export class OrderActionsService {
    private dialogService = inject(DialogService);
    private destroyRef = inject(DestroyRef);

    openPendingDeviceOrder(order: DeviceOrder): void {
        from(import('../components/device-order/device-order.component'))
            .pipe(
                switchMap((module) => {
                    const dialogRef = this.dialogService.openFormDialog({
                        title: 'Device Order',
                        subtitle: `Order #: ${order.orderNumber}`,
                        component: module.DeviceOrderComponent,
                        formModel: {},
                        componentData: { order },
                        width: '750px',
                        height: '500px',
                        hideCancelButton: true,
                        hideSubmitButton: true,
                    });

                    return dialogRef.afterClosed();
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }

    openCompletedDeviceOrder(order: CompletedDeviceOrder): void {
        from(import('../components/device-order/device-order.component'))
            .pipe(
                switchMap((module) => {
                    const dialogRef = this.dialogService.openFormDialog({
                        title: 'Device Order',
                        subtitle: `Order #: ${order.orderNumber}`,
                        component: module.DeviceOrderComponent,
                        formModel: {},
                        componentData: { order, isCompleted: true },
                        width: '750px',
                        height: '500px',
                        hideCancelButton: true,
                        hideSubmitButton: true,
                    });

                    return dialogRef.afterClosed();
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe();
    }
}
