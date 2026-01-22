import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap, tap, catchError } from 'rxjs';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { CUI_DIALOG_WIDTH } from '@pgr-cla/core-ui-components';
import { CustomerInfo } from 'src/app/shared/data/participant/resources';
import { VehicleDetails } from 'src/app/shared/data/vehicle/resources';
import { AddNewVehicleComponent } from '../components/add-new-vehicle/add-new-vehicle.component';
import { CustomerDetailsEditComponent } from '../components/customer-details-edit/customer-details-edit.component';
import { EnrollmentDetailService } from '../../participant-details/services/enrollment-details/enrollment-details.service';
import { HelpText } from 'src/app/shared/help/metadata';
import { CustomerUpdateService } from 'src/app/shared/services/api/customer/customer-update';
import { ParticipantService } from 'src/app/shared/services/api/participant/participant.service';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';

@Injectable({
    providedIn: 'root',
})
export class EnrollmentCustomerDetailsService {
    private readonly dialogService = inject(DialogService);
    private readonly participantService = inject(ParticipantService);
    private readonly participantSelectionService = inject(EnrollmentDetailService);
    private readonly notificationBanner = inject(NotificationBannerService);
    private readonly customerUpdateService = inject(CustomerUpdateService);

    openAddVehicleDialog(participantGroupSeqId: number | undefined): Observable<boolean> {
        if (!participantGroupSeqId) {
            console.warn('Cannot add vehicle: participantGroupSeqId is required');
            return of(false);
        }

        return this.dialogService
            .openFormDialog<typeof AddNewVehicleComponent, VehicleDetails>({
                title: 'Add New Vehicle',
                helpKey: HelpText.AddNewVehicle,
                component: AddNewVehicleComponent,
                confirmText: 'ADD',
                formModel: {} as VehicleDetails,
                componentData: {
                    year: null,
                    make: null,
                    model: null,
                    scoringAlgorithm: null,
                },
            })
            .afterClosed()
            .pipe(
                switchMap(enteredData => {
                    if (!enteredData) {
                        return of(false); // User cancelled
                    }

                    // Open confirmation dialog
                    return this.dialogService
                        .openConfirmationDialog({
                            title: 'Add New Vehicle',
                            message: `Are you sure you want to add a ${enteredData.year} ${enteredData.make} ${enteredData.model}?`,
                            confirmText: 'YES',
                        })
                        .afterClosed()
                        .pipe(
                            switchMap(confirmed => {
                                if (!confirmed) {
                                    return of(false); // User cancelled confirmation
                                }

                                // Add the participant
                                return this.participantService.addParticipant({
                                    participantGroupSeqId,
                                    driverVehicleInformation: {
                                        vehicle: {
                                            year: enteredData.year,
                                            make: enteredData.make,
                                            model: enteredData.model,
                                        },
                                        scoringAlgorithmCode: enteredData.scoringAlgorithm.code,
                                    },
                                }).pipe(
                                    tap(() => {
                                        // Success actions
                                        this.participantSelectionService.refreshEnrollmentDetails();
                                        this.notificationBanner.success('Add New Vehicle Successful');
                                    }),
                                    switchMap(() => of(true)) // Return success
                                );
                            })
                        );
                }),
                catchError(error => {
                    console.error('Add vehicle error:', error);
                    this.notificationBanner.error('Failed to add new vehicle');
                    return of(false);
                })
            );
    }

    openUpdateCustomerDialog(customerInfo: CustomerInfo): Observable<boolean> {
        if (!customerInfo) {
            console.warn('Cannot update customer: customerInfo is required');
            return of(false);
        }

        return this.dialogService
            .openFormDialog<typeof CustomerDetailsEditComponent, CustomerInfo>({
                title: 'Edit Customer Details',
                helpKey: HelpText.EditCustomerDetails,
                component: CustomerDetailsEditComponent,
                confirmText: 'UPDATE',
                formModel: customerInfo,
                componentData: { customerDetails: customerInfo },
                width: CUI_DIALOG_WIDTH.SMALL,
            })
            .afterClosed()
            .pipe(
                switchMap(enteredData => {
                    if (!enteredData) {
                        return of(false); // User cancelled
                    }

                    return this.customerUpdateService.putUpdateCustomer(enteredData).pipe(
                        tap(() => {
                            this.participantSelectionService.updateCustomerDetails(enteredData);
                            this.notificationBanner.success('Update Customer Details Successful');
                        }),
                        switchMap(() => of(true))
                    );
                }),
                catchError(error => {
                    console.error('Update customer error:', error);
                    this.notificationBanner.error('Failed to update customer details');
                    return of(false);
                })
            );
    }
}
