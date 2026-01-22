import { inject, Injectable, Type } from '@angular/core';
import { CUI_DIALOG_WIDTH } from '@pgr-cla/core-ui-components';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AddNewVehicleComponent } from '../../customer-service/enrollment-details/customer-details/components/add-new-vehicle/add-new-vehicle.component';
import { VehicleEditComponent } from '../../customer-service/enrollment-details/participant-details/components/edit-vehicle/vehicle-edit.component';
import { VehicleEditData, VehicleEditResult } from '../../customer-service/enrollment-details/participant-details/components/edit-vehicle/vehicle-edit.models';
import { VehicleDetails } from '../../shared/data/vehicle/resources';
import { HelpText } from '../../shared/help/metadata';
import { DialogService } from '../../shared/services/dialogs/primary/dialog.service';

@Injectable({
    providedIn: 'root',
})
export class VehicleDetailsService {
    dialogService = inject(DialogService);

    /**
     * Opens a dialog to update an existing vehicle's details
     * @param vehicle - The vehicle to be updated
     * @returns Observable that emits the updated vehicle details or null if cancelled
     */
    updateVehicle(vehicle: VehicleDetails): Observable<VehicleDetails | null> {
        return this.dialogService
            .openFormDialog<Type<VehicleEditComponent>, VehicleEditResult>({
                title: 'Edit Vehicle',
                component: VehicleEditComponent,
                formModel: {
                    vehicle: vehicle,
                } as VehicleEditResult,
                componentData: { displayScoringAlgorithm: true } as VehicleEditData,
                width: CUI_DIALOG_WIDTH.SMALL,
                helpKey: HelpText.EditVehicle,
                confirmText: 'UPDATE',
            })
            .afterClosed()
            .pipe(
                switchMap((enteredData: VehicleEditResult | undefined) => {
                    if (!enteredData) {
                        return of(null); // User cancelled
                    }
                    return of(enteredData.vehicle);
                }),
            );
    }

    /**
     * Opens a dialog to add a new vehicle
     * @returns Observable that emits the new vehicle details or null if cancelled
     */
    addVehicle(): Observable<VehicleDetails | null> {
        return this.dialogService
            .openFormDialog<Type<AddNewVehicleComponent>, VehicleDetails>({
                title: 'Add Vehicle',
                helpKey: HelpText.AddNewVehicle,
                component: AddNewVehicleComponent,
                confirmText: 'ADD',
                formModel: {} as VehicleDetails,
            })
            .afterClosed()
            .pipe(
                switchMap((enteredData) => {
                    if (!enteredData) {
                        return of(null); // User cancelled
                    }
                    return of(enteredData);
                }),
            );
    }
}
