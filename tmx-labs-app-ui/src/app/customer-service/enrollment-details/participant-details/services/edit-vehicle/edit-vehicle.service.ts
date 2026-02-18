import { Injectable, inject } from '@angular/core';
import { CUI_DIALOG_WIDTH } from '@pgr-cla/core-ui-components';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import type {
    VehicleEditData,
    VehicleEditResult,
} from '../../components/edit-vehicle/vehicle-edit.models';
import { MessageCode } from 'src/app/shared/data/application/enums';
import {
    UpdateVehicleRequest,
    UpdateVehicleResponse,
    VehicleDetails,
} from 'src/app/shared/data/vehicle/resources';
import { HelpText } from 'src/app/shared/help/metadata';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { ParticipantService } from 'src/app/shared/services/api/participant/participant.service';
import { ResourceMessageService } from 'src/app/shared/services/resources/resource-message.service';
import { DialogService } from '../../../../../shared/services/dialogs/primary/dialog.service';
import { EnrollmentDetailService } from '../enrollment-details/enrollment-details.service';

export interface VehicleEditDialogContext {
    vehicle: VehicleDetails;
    participantSeqID?: number;
}

interface VehicleEditOutcome {
    success: boolean;
    vehicle: VehicleDetails;
    successMessage?: string;
    errorMessage?: string;
}

@Injectable({ providedIn: 'root' })
export class EditVehicleService {
    private readonly dialogService = inject(DialogService);
    private readonly participantService = inject(ParticipantService);
    private readonly notificationBannerService = inject(NotificationBannerService);
    private readonly resourceMessageService = inject(ResourceMessageService);
    private readonly enrollmentDetailService = inject(EnrollmentDetailService);

    openEditVehicleDialog(context: VehicleEditDialogContext): Observable<VehicleDetails | null> {
        if (!context.vehicle) {
            return of(null);
        }

        return from(import('../../components/edit-vehicle/vehicle-edit.component')).pipe(
            switchMap((module) => {
                const componentData: VehicleEditData = {
                    vehicleDetails: {
                        vehicle: context.vehicle
                    },
                    displayScoringAlgorithm: false
                };

                const dialogRef = this.dialogService.openFormDialog<typeof module.VehicleEditComponent, VehicleEditResult>({
                    title: 'Edit Vehicle',
                    component: module.VehicleEditComponent,
                    formModel: { vehicle: context.vehicle } satisfies VehicleEditResult,
                    componentData,
                    width: CUI_DIALOG_WIDTH.SMALL,
                    helpKey: HelpText.EditVehicle, 
                    confirmText: 'UPDATE'
                });

                return dialogRef.afterClosed().pipe(
                    take(1),
                    switchMap((result: VehicleEditResult | undefined) => {
                        if (!result?.vehicle) {
                            return of(null);
                        }

                        const request: UpdateVehicleRequest = {
                            changedVehicle: result.vehicle,
                        };

                        return this.participantService.updateVehicle(request).pipe(
                            map((response) => this.evaluateVehicleResponse(response, result.vehicle)),
                            tap((outcome) => {
                                if (!outcome.success) {
                                    this.notificationBannerService.error(
                                        outcome.errorMessage ?? 'Edit Vehicle Failed',
                                    );
                                } else {
                                    this.notificationBannerService.success(
                                        outcome.successMessage ?? 'Edit Vehicle Successful',
                                    );
                                    
                                    if (context.participantSeqID && outcome.vehicle) {
                                        this.enrollmentDetailService.updateParticipantVehicle(
                                            context.participantSeqID,
                                            {
                                                year: outcome.vehicle.year,
                                                make: outcome.vehicle.make,
                                                model: outcome.vehicle.model,
                                                vehicleSeqID: outcome.vehicle.vehicleSeqID,
                                            }
                                        );
                                    }
                                }
                            }),
                            map((outcome) => (outcome.success ? outcome.vehicle : null)),
                            catchError(() => {
                                this.notificationBannerService.error('Edit Vehicle Failed');
                                return of(null);
                            }),
                        );
                    }),
                );
            }),
            catchError(() => {
                this.notificationBannerService.error('Edit Vehicle Failed');
                return of(null);
            }),
        );
    }

    private evaluateVehicleResponse(
        response: UpdateVehicleResponse | null | undefined,
        requestedVehicle: VehicleDetails,
    ): VehicleEditOutcome {
        const errorMessage = this.resourceMessageService.getFirstString(response?.messages, [
            MessageCode.ErrorCode,
            MessageCode.Error,
            MessageCode.ErrorDetails,
        ]);

        if (errorMessage) {
            return {
                success: false,
                vehicle: requestedVehicle,
                errorMessage,
            };
        }

        const resolvedVehicle = response?.changedVehicle ?? requestedVehicle;
        
        // Ensure VehicleSeqID is preserved if not returned from API
        if (resolvedVehicle && (!resolvedVehicle.vehicleSeqID && requestedVehicle.vehicleSeqID)) {
            resolvedVehicle.vehicleSeqID = requestedVehicle.vehicleSeqID;
        }

        const successMessage = this.resourceMessageService.getString(
            response?.messages,
            MessageCode.StatusDescription,
        );

        return {
            success: true,
            vehicle: resolvedVehicle,
            successMessage: successMessage ?? undefined,
        };
    }
}