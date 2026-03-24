import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DeviceOrder } from '../../shared/data/fulfillment/resources';
import { DialogService } from '../../shared/services/dialogs/primary/dialog.service';
import { OrderSubtitleService } from '../../shared/services/order-subtitle.service';

@Injectable({
    providedIn: 'root',
})
export class OrderActionsService {
    private dialogService = inject(DialogService);
    private orderSubtitleService = inject(OrderSubtitleService);
    private destroyRef = inject(DestroyRef);

    openPendingDeviceOrder(order: DeviceOrder, ordersInView?: DeviceOrder[]): void {
        this.openDeviceOrderDialog(order, { ordersInView });
    }

    openCompletedDeviceOrder(order: DeviceOrder, ordersInView?: DeviceOrder[]): void {
        this.openDeviceOrderDialog(order, { isCompleted: true, ordersInView });
    }

    private openDeviceOrderDialog(
        order: DeviceOrder,
        extraData: { isCompleted?: boolean; ordersInView?: DeviceOrder[] } = {}
    ): void {
        this.orderSubtitleService.setOrderNumber(order.orderNumber);
        from(import('../components/device-order/device-order.component'))
            .pipe(
                switchMap((module) => {
                    const dialogRef = this.dialogService.openFormDialog({
                        title: 'Device Order',
                        subtitle: `Order #: ${order.orderNumber}`,
                        component: module.DeviceOrderComponent,
                        formModel: {},
                        componentData: { order, ...extraData },
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
