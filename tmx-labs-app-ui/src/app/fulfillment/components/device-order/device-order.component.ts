import {
    Component,
    computed,
    DestroyRef,
    inject,
    OnInit,
    signal,
    ViewChild,
    AfterViewInit,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { VerticalStepperComponent, StepComponent } from '@pgr-cla/core-ui-components';
import { AssignDevicesComponent } from './components/assign-devices/assign-devices.component';
import { tap } from 'rxjs/operators';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDialogRef } from '@angular/material/dialog';
import { FulfillmentService } from 'src/app/shared/services/api/fulfillment/fulfillment.services';
import { OrderVehicleDetails } from 'src/app/shared/data/vehicle/resources';
import { FORM_DIALOG_CONTENT } from 'src/app/shared/components/dialogs/form-dialog/form-dialog.component';
import { DeviceOrder } from 'src/app/shared/data/fulfillment/resources';
import { DeviceOrderReloadService } from '../../services/device-order-reload.service';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { LabelPrinterService } from 'src/app/shared/services/api/labelprinter/labelprinter.service';
import { SetPrinterFormComponent, PrinterFormModel } from '../printer-info/set-printer-dialog/set-printer-form.component';
import { PrinterSelectionService } from '../../services/printer-selection.service';
import { OrderSubtitleService } from 'src/app/shared/services/order-subtitle.service';
import { Observable } from 'rxjs/internal/Observable';
import { UserInfoService } from 'src/app/shared/services/user-info/user-info.service';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';

export interface DeviceOrderDialogData {
    model: unknown;
    data: { order: DeviceOrder; isCompleted?: boolean; ordersInView?: DeviceOrder[] };
    form: unknown;
    submit: () => void;
}

interface OrderStatusConstants {
    PENDING_ASSIGNMENT: string;
    COMPLETED: string;
    READY_TO_PRINT: string;
    DEVICES_ASSIGNED: string;
}

interface PrinterConstants {
    DOWNLOAD_PRINTER: string;
}

interface StepperIndices {
    DEVICE_ASSIGNMENT: number;
    LABEL_PROCESSING: number;
}

@Component({
    selector: 'tmx-device-order',
    standalone: true,
    imports: [
        CommonModule,
        VerticalStepperComponent,
        StepComponent,
        AssignDevicesComponent,
        MatIcon,
        MatButtonModule,
        MatStepperModule,
    ],
    templateUrl: './device-order.component.html',
    styleUrl: './device-order.component.scss',
})
export class DeviceOrderComponent implements OnInit, AfterViewInit {
    @ViewChild(VerticalStepperComponent) stepper: VerticalStepperComponent;
    @ViewChild('deviceAssignmentForm') deviceAssignmentForm: AssignDevicesComponent;

    // Constants
    private readonly ORDER_STATUSES: OrderStatusConstants = {
        PENDING_ASSIGNMENT: 'Pending Assignment',
        COMPLETED: 'Complete',
        READY_TO_PRINT: 'Ready to Print',
        DEVICES_ASSIGNED: 'DevicesAssigned',
    };

    private readonly PRINTER_CONFIG: PrinterConstants = {
        DOWNLOAD_PRINTER: 'ToFile-TEST',
    };

    private readonly STEPPER_INDICES: StepperIndices = {
        DEVICE_ASSIGNMENT: 0,
        LABEL_PROCESSING: 1,
    };

    // Dependencies
    protected data = inject<DeviceOrderDialogData>(FORM_DIALOG_CONTENT);
    private fulfillmentService = inject(FulfillmentService);
    private reloadService = inject(DeviceOrderReloadService);
    private destroyRef = inject(DestroyRef);
    private dialogRef = inject(MatDialogRef, { optional: true });
    private dialogService = inject(DialogService);
    private labelPrinterService = inject(LabelPrinterService);
    private printerSelectionService = inject(PrinterSelectionService);
    private orderSubtitleService = inject(OrderSubtitleService);
    private notificationBannerService = inject(NotificationBannerService);
    private userInfoService = inject(UserInfoService);

    // State - Printers
    availablePrinters = signal<string[]>([]);

    // State - Order Data
    userInfo = toSignal(this.userInfoService.userInfo$);
    vehicles = signal<OrderVehicleDetails[]>([]);
    currentOrder = signal<DeviceOrder | null>(null);

    // State - Flags
    devicesSaved = signal(false);
    labelProcessed = signal(false);

    // State - Loading States
    isProcessingLabel = signal(false);
    isLoadingNextOrder = signal(false);

    // Computed Properties
    hasNextOrder = computed(() => {
        const ordersInView = this.data.data.ordersInView;
        if (!ordersInView) return true;
        const isCompleted = this.data.data.isCompleted || false;
        const effective = isCompleted
            ? ordersInView
            : ordersInView.filter(o => o.deviceOrderStatusDescription === this.ORDER_STATUSES.READY_TO_PRINT);
        return effective.length > 1;
    });
    vehicleYMMSN = computed(() => 
        this.vehicles().map((v) => 
            `${v.year} ${v.make} ${v.model}${v.deviceSerialNumber ? ' (' + v.deviceSerialNumber + ')' : ''}`
        )
    );

    customerName = computed(() => 
        `${this.order.firstName} ${this.order.lastName}`
    );
    
    customerEmail = computed(() => 
        this.order.email || ''
    );

    streetAddress = computed(() => {
        if (!this.isAddressValid()) {
            return 'Address not available';
        }
        
        const addressLine2 = this.order.addressLine2 ? ` ${this.order.addressLine2}` : '';
        return `${this.order.addressLine1}${addressLine2}`;
    });

    cityStateZip = computed(() => {
        if (!this.isAddressValid()) {
            return '';
        }
        
        return `${this.order.city}, ${this.order.state} ${this.order.zipCode}`;
    });

    isAddressValid = computed(() => {
        const order = this.order;
        return !!(
            order.addressLine1 &&
            order.addressLine1.trim() &&
            order.city &&
            order.city.trim() &&
            order.state &&
            order.state.trim() &&
            order.zipCode &&
            order.zipCode.trim()
        );
    });
    
    customerAddress = computed(() => {
        if (!this.isAddressValid()) {
            return 'Address not available';
        }
        
        const addressLine2 = this.order.addressLine2 ? ` ${this.order.addressLine2}` : '';
        return `${this.order.addressLine1}${addressLine2}, ${this.order.city}, ${this.order.state} ${this.order.zipCode}`;
    });


    get order(): DeviceOrder {
        return this.currentOrder() || this.data.data.order;
    }

    /**
     * Handles the event when the last device is assigned.
     * @param scanned If the device was scanned in (not manually entered)
     */
    lastDeviceAssigned(scanned: boolean): void {
        // If manually entered, do nothing. User will click next button.
        if (!scanned) {
            return;
        }
        this.saveDeviceAssignments()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                // After saving, automatically move to next step
                if (this.stepper) {
                    this.stepper.next();
                }
            });
    }

    private proceedToLabelProcessing(): void {
        this.saveDeviceAssignments();
        this.setStepperIndex(this.STEPPER_INDICES.LABEL_PROCESSING);
    }

    private setStepperIndex(index: number): void {
        if (this.stepper) {
            this.stepper.selectedIndex = index;
        }
    }
    saveDeviceAssignments(): Observable<void> {
        return this.fulfillmentService
            .saveDeviceAssignments(this.order.deviceOrderSeqID, this.vehicles(), this.userInfo().lanId)
            .pipe(
                tap(() => {
                    this.reloadService.triggerReload();
                }),
                takeUntilDestroyed(this.destroyRef),
            );
    }

    ngOnInit(): void {
        this.loadVehicles(this.order.deviceOrderSeqID);
        this.loadAvailablePrinters();
    }

    ngAfterViewInit(): void {
        this.openActiveStep();
    }

    private loadVehicles(orderSeqId: number): void {
        this.fulfillmentService
            .getDeviceOrderVehicles(orderSeqId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((orderVehicles) => {
                this.vehicles.set(orderVehicles);
            });
    }

    private loadAvailablePrinters(): void {
        this.labelPrinterService
            .getLabelPrinters()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (printers) => this.availablePrinters.set(printers.map(p => p.PrinterName))
            });
    }

    openActiveStep(): void {
        const status = this.data.data.order.deviceOrderStatusDescription;
        const shouldOpenLabelProcessing = [
            this.ORDER_STATUSES.COMPLETED,
            this.ORDER_STATUSES.READY_TO_PRINT,
            this.ORDER_STATUSES.DEVICES_ASSIGNED,
        ].includes(status) || this.data.data.isCompleted;

        if (shouldOpenLabelProcessing) {
            this.setStepperIndex(this.STEPPER_INDICES.LABEL_PROCESSING);
        }
    }

    getPrinterName(): string | null {
        return this.printerSelectionService.getPrinter();
    }

    finish(): void {
        this.dialogRef?.close();
    }

    loadNextOrder(): void {
        this.isLoadingNextOrder.set(true);
        const isCompleted = this.data.data.isCompleted || false;
        const ordersInView = this.data.data.ordersInView;

        if (ordersInView) {
            this.processNextOrder(ordersInView, isCompleted);
            return;
        }

        if (isCompleted) {
            this.fulfillmentService
                .getCompletedOrderList(false)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                    next: (result) => this.processNextOrder(result.orders, true),
                    error: () => {
                        this.isLoadingNextOrder.set(false);
                        this.notificationBannerService.error('Failed to load completed orders. Please try again.');
                    }
                });
        } else {
            this.fulfillmentService
                .getPendingOrderList(false)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                    next: (result) => this.processNextOrder(result.deviceOrders, false),
                    error: () => {
                        this.isLoadingNextOrder.set(false);
                        this.notificationBannerService.error('Failed to load pending orders. Please try again.');
                    }
                });
        }
    }

    private processNextOrder(orders: DeviceOrder[], isCompleted: boolean): void {
        const filteredOrders = isCompleted 
            ? orders 
            : orders.filter(ord => ord.deviceOrderStatusDescription === this.ORDER_STATUSES.READY_TO_PRINT);

        if (filteredOrders.length === 0) {
            this.isLoadingNextOrder.set(false);
            this.notificationBannerService.warning('No orders available to print.');
            return;
        }

        const nextOrder = this.getNextOrderInCycle(filteredOrders);
        this.currentOrder.set(nextOrder);
        this.orderSubtitleService.setOrderNumber(nextOrder.orderNumber);
        this.resetForNewOrder();
        this.isLoadingNextOrder.set(false);
        this.setStepperIndex(this.STEPPER_INDICES.DEVICE_ASSIGNMENT);
    }

    private getNextOrderInCycle(orders: DeviceOrder[]): DeviceOrder {
        const currentOrderId = this.order.deviceOrderSeqID;
        const currentIndex = orders.findIndex(
            ord => ord.deviceOrderSeqID === currentOrderId
        );

        const nextIndex = (currentIndex + 1) % orders.length;
        return orders[nextIndex];
    }

    private resetForNewOrder(): void {
        this.vehicles.set([]);
        this.devicesSaved.set(false);
        this.labelProcessed.set(false);
        this.isProcessingLabel.set(false);
        
        this.loadVehicles(this.order.deviceOrderSeqID);
    }

    printOrDownloadLabel(): void {
        const printerName = this.getPrinterName();

        if (!printerName) {
            this.openPrinterSelectionDialog();
            return;
        }

        this.isProcessingLabel.set(true);
        const orderWithVehicles = this.createOrderWithVehicles();

        if (printerName === this.PRINTER_CONFIG.DOWNLOAD_PRINTER) {
            this.downloadLabel(orderWithVehicles);
        } else {
            this.printLabel(printerName, orderWithVehicles);
        }
    }

    private openPrinterSelectionDialog(): void {
        const dialogRef = this.dialogService.openFormDialog<typeof SetPrinterFormComponent, PrinterFormModel>({
            title: 'Set Default Printer',
            component: SetPrinterFormComponent,
            confirmText: 'SAVE',
            formModel: { selectedPrinter: '' } as PrinterFormModel,
            componentData: {
                selectedPrinter: '',
                availablePrinters: this.availablePrinters()
            },
        });

        dialogRef.afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((result: PrinterFormModel | undefined) => {
                if (result?.selectedPrinter) {
                    this.printerSelectionService.setPrinter(result.selectedPrinter);
                    this.printOrDownloadLabel();
                }
            });
    }

    private createOrderWithVehicles(): DeviceOrder & { vehicles: OrderVehicleDetails[] } {
        return { ...this.order, vehicles: this.vehicles() };
    }

    private downloadLabel(orderWithVehicles: DeviceOrder & { vehicles: OrderVehicleDetails[] }): void {
        this.fulfillmentService
            .downloadLabel(orderWithVehicles)
            .pipe(
                tap((blob) => {
                    this.triggerLabelDownload(blob, orderWithVehicles.orderNumber);
                    this.labelProcessed.set(true);
                    this.isProcessingLabel.set(false);
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                error: (error) => {
                    console.error('Error downloading label:', error);
                    this.handleLabelError(error, 'Failed to download label. Please try again.');
                    this.isProcessingLabel.set(false);
                }
            });
    }

    private printLabel(printerName: string, orderWithVehicles: DeviceOrder & { vehicles: OrderVehicleDetails[] }): void {
        this.fulfillmentService
            .printLabel(printerName, orderWithVehicles)
            .pipe(
                tap((success) => {
                    if (success) {
                        this.labelProcessed.set(true);
                    } else {
                        this.notificationBannerService.error('Label printing failed. Please try again.');
                    }
                    this.isProcessingLabel.set(false);
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                error: (error) => {
                    console.error('Error printing label:', error);
                    this.handleLabelError(error, 'Failed to print label. Please try again.');
                    this.isProcessingLabel.set(false);
                }
            });
    }

    nextButtonClick() {
        this.saveDeviceAssignments().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }

    private triggerLabelDownload(blob: Blob, orderNumber: string): void {
        const dateTime = this.generateDateTimeString();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        try {
            link.href = url;
            link.download = `Label-${orderNumber}-${dateTime}.txt`;
            link.click();
        } finally {
            window.URL.revokeObjectURL(url);
        }
    }

    private generateDateTimeString(): string {
        const now = new Date();
        const date = now
            .toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
            .replace(/\//g, '');
        const time = now
            .toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
            .replace(/:/g, '');
        
        return `${date}-${time}`;
    }

    private handleLabelError(error: any, fallback: string): void {
        if (error.error instanceof Blob) {
            error.error.text().then((message: string) => {
                this.notificationBannerService.error(message || fallback);
            }).catch(() => {
                this.notificationBannerService.error(fallback);
            });
            return;
        }

        const message =
            (typeof error.error === 'string' && error.error) ||
            error.error?.message ||
            error.error?.messages?.Error ||
            error.message ||
            fallback;

        this.notificationBannerService.error(message);
    }
}
