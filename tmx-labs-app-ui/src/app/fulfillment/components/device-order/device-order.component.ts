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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { VerticalStepperComponent, StepComponent } from '@pgr-cla/core-ui-components';
import { AssignDevicesComponent } from './components/assign-devices/assign-devices.component';
import { filter, take, tap } from 'rxjs/operators';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { FulfillmentService } from 'src/app/shared/services/api/fulfillment/fulfillment.services';
import { OrderVehicleDetails } from 'src/app/shared/data/vehicle/resources';
import { FORM_DIALOG_CONTENT } from 'src/app/shared/components/dialogs/form-dialog/form-dialog.component';
import { DeviceOrder } from 'src/app/shared/data/fulfillment/resources';
import { DeviceOrderReloadService } from '../../services/device-order-reload.service';

export interface DeviceOrderDialogData {
    model: unknown;
    data: { order: DeviceOrder, isCompleted?: boolean };
    form: unknown;
    submit: () => void;
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

    readonly PENDING_ASSIGNMENT = 'Pending Assignment';
    readonly COMPLETED = 'Complete';
    readonly READY_TO_PRINT = 'Ready to Print';
    readonly DEVICES_ASSIGNED = 'DevicesAssigned';

    protected data = inject<DeviceOrderDialogData>(FORM_DIALOG_CONTENT);
    private fulfillmentService = inject(FulfillmentService);
    private reloadService = inject(DeviceOrderReloadService);
    private destroyRef = inject(DestroyRef);

    vehicles = signal<OrderVehicleDetails[]>([]);
    devicesSaved = signal(false);

    vehicleYMMSN = computed(() => this.vehicles().map((v) => `${v.year} ${v.make} ${v.model}${v.deviceSerialNumber ? ' (' + v.deviceSerialNumber + ')' : ''}`));


    get order(): DeviceOrder {
        return this.data.data.order;
    }

    lastDeviceAssigned() {
        // prevent duplicate saves depending on where it gets called in the flow
        this.devicesSaved.set(false);

        // Wait for the form to be valid before advancing
        this.deviceAssignmentForm.stepControl.statusChanges.pipe(
            filter(status => status === 'VALID'),
            take(1)
        ).subscribe(() => {
            this.saveDeviceAssignments();
            if (this.stepper) {
                this.stepper.selectedIndex = 1;
            }
        });
        
        // Trigger status check immediately in case it's already valid
        if (this.deviceAssignmentForm.valid()) {
            this.saveDeviceAssignments();
            if (this.stepper) {
                this.stepper.selectedIndex = 1;
            }
        }
    }

    saveDeviceAssignments(){
        if(this.devicesSaved()){
            return;
        }
        this.fulfillmentService
            .saveDeviceAssignments(this.order.deviceOrderSeqID, this.vehicles())
            .pipe(
                tap(() => {
                    this.reloadService.triggerReload();
                    this.devicesSaved.set(true);
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe();
    }

    ngOnInit(): void {
        this.fulfillmentService
            .getDeviceOrderVehicles(this.order.deviceOrderSeqID)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((orderVehicles) => {
                this.vehicles.set(orderVehicles);
            });
    }

    ngAfterViewInit(): void {
        this.openActiveStep();
    }

    openActiveStep() {
        if (
            this.data.data.order.deviceOrderStatusDescription === this.COMPLETED ||
            this.data.data.order.deviceOrderStatusDescription === this.READY_TO_PRINT || 
            this.data.data.order.deviceOrderStatusDescription === this.DEVICES_ASSIGNED || 
            this.data.data.isCompleted
        ) {
            if (this.stepper) {
                this.stepper.selectedIndex = 1;
            }
        }
        // 0 is default, do nothing
    }
}
