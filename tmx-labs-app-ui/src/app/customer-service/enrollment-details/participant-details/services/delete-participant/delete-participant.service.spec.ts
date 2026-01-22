import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DeleteParticipantService } from './delete-participant.service';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { ParticipantService } from 'src/app/shared/services/api/participant/participant.service';
import { EnrollmentDetailService } from '../enrollment-details/enrollment-details.service';
import { ParticipantDetailsFormattingService } from '../participant-details-formatting/participant-details-formatting.service';
import { ResourceMessageService } from 'src/app/shared/services/resources/resource-message.service';
import { AccountVehicleSummary } from 'src/app/shared/data/participant/resources';
import { MessageCode } from 'src/app/shared/data/application/enums';
import { Resource } from 'src/app/shared/data/application/resources';
import { MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/components/dialogs/confirmation-dialog/confirmation-dialog.component';

function createMockResource(overrides?: Partial<Resource>): Resource {
    return {
        extenders: [],
        messages: [],
        ...overrides,
    };
}

describe('DeleteParticipantService', () => {
    let service: DeleteParticipantService;
    let dialogService: jasmine.SpyObj<DialogService>;
    let participantService: jasmine.SpyObj<ParticipantService>;
    let notificationService: jasmine.SpyObj<NotificationBannerService>;
    let participantDetailsFormattingService: jasmine.SpyObj<ParticipantDetailsFormattingService>;
    let resourceMessageService: jasmine.SpyObj<ResourceMessageService>;
    let dialogRef: jasmine.SpyObj<MatDialogRef<ConfirmationDialogComponent, boolean>>;

    const mockVehicle: AccountVehicleSummary = {
        vehicleSeqID: 1,
        year: 2023,
        make: 'Toyota',
        model: 'Camry',
        vin: 'TEST123456789',
    } as AccountVehicleSummary;

    beforeEach(() => {
        const dialogServiceSpy = jasmine.createSpyObj('DialogService', ['openConfirmationDialog']);
        const participantServiceSpy = jasmine.createSpyObj('ParticipantService', ['deleteVehicle']);
        const notificationServiceSpy = jasmine.createSpyObj('NotificationBannerService', ['success', 'error']);
        const enrollmentDetailServiceSpy = jasmine.createSpyObj('EnrollmentDetailService', ['updateParticipant', 'updateParticipantDevice', 'refreshEnrollmentDetails']);
        const participantDetailsFormattingServiceSpy = jasmine.createSpyObj('ParticipantDetailsFormattingService', ['formatVehicleNickname']);
        const resourceMessageServiceSpy = jasmine.createSpyObj('ResourceMessageService', ['getString']);
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);

        TestBed.configureTestingModule({
            providers: [
                DeleteParticipantService,
                { provide: DialogService, useValue: dialogServiceSpy },
                { provide: ParticipantService, useValue: participantServiceSpy },
                { provide: NotificationBannerService, useValue: notificationServiceSpy },
                { provide: EnrollmentDetailService, useValue: enrollmentDetailServiceSpy },
                { provide: ParticipantDetailsFormattingService, useValue: participantDetailsFormattingServiceSpy },
                { provide: ResourceMessageService, useValue: resourceMessageServiceSpy },
            ],
        });

        service = TestBed.inject(DeleteParticipantService);
        dialogService = TestBed.inject(DialogService) as jasmine.SpyObj<DialogService>;
        participantService = TestBed.inject(ParticipantService) as jasmine.SpyObj<ParticipantService>;
        notificationService = TestBed.inject(NotificationBannerService) as jasmine.SpyObj<NotificationBannerService>;
        participantDetailsFormattingService = TestBed.inject(ParticipantDetailsFormattingService) as jasmine.SpyObj<ParticipantDetailsFormattingService>;
        resourceMessageService = TestBed.inject(ResourceMessageService) as jasmine.SpyObj<ResourceMessageService>;
        dialogRef = dialogRefSpy;

        // Setup default spy return values
        participantDetailsFormattingService.formatVehicleNickname.and.returnValue('2023 Toyota Camry - John\'s Car');
        dialogService.openConfirmationDialog.and.returnValue(dialogRef);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('openDeleteParticipantDialog', () => {
        it('should show confirmation dialog with correct title and message', () => {
            dialogRef.afterClosed.and.returnValue(of(false));

            service.openDeleteParticipantDialog(123, 'DEVICE123', mockVehicle, 'John\'s Car').subscribe();

            expect(dialogService.openConfirmationDialog).toHaveBeenCalledWith({
                title: 'Delete Vehicle',
                subtitle: jasmine.any(String),
                message: 'Are you sure you want to delete this vehicle from your customer profile?',
                confirmText: 'YES',
                cancelText: 'CANCEL',
                helpKey: 'Delete Vehicle',
            });
        });

        it('should return false when user cancels', (done) => {
            dialogRef.afterClosed.and.returnValue(of(false));

            service.openDeleteParticipantDialog(123, 'DEVICE123', mockVehicle, 'John\'s Car').subscribe(result => {
                expect(result).toBe(false);
                expect(participantService.deleteVehicle).not.toHaveBeenCalled();
                done();
            });
        });

        it('should call deleteVehicle when user confirms', () => {
            dialogRef.afterClosed.and.returnValue(of(true));
            participantService.deleteVehicle.and.returnValue(of(createMockResource()));
            resourceMessageService.getString.and.returnValue(null);

            service.openDeleteParticipantDialog(123, 'DEVICE123', mockVehicle, 'John\'s Car').subscribe();

            expect(participantService.deleteVehicle).toHaveBeenCalledWith({
                participantSeqId: 123,
                isActive: false,
            });
        });
    });

    describe('deleteParticipant', () => {
        beforeEach(() => {
            dialogRef.afterClosed.and.returnValue(of(true));
        });

        it('should handle successful deletion', (done) => {
            const mockResponse = createMockResource();
            participantService.deleteVehicle.and.returnValue(of(mockResponse));
            resourceMessageService.getString.and.callFake((messages, code) => {
                if (code === MessageCode.ErrorCode) return null;
                if (code === MessageCode.ErrorDetails) return null;
                return null;
            });

            service.openDeleteParticipantDialog(123, 'DEVICE123', mockVehicle, 'John\'s Car').subscribe(result => {
                expect(result).toBe(true);
                expect(notificationService.success).toHaveBeenCalledWith('Vehicle deleted successfully');
                done();
            });
        });

        it('should handle deletion error from response', (done) => {
            const mockResponse = createMockResource();
            participantService.deleteVehicle.and.returnValue(of(mockResponse));
            resourceMessageService.getString.and.callFake((messages, code) => {
                if (code === MessageCode.ErrorCode) return 'ERROR';
                if (code === MessageCode.ErrorDetails) return 'Deletion failed';
                return null;
            });

            service.openDeleteParticipantDialog(123, 'DEVICE123', mockVehicle, 'John\'s Car').subscribe(result => {
                expect(result).toBe(false);
                expect(notificationService.error).toHaveBeenCalledWith('Deletion failed');
                done();
            });
        });

        it('should handle HTTP error', (done) => {
            participantService.deleteVehicle.and.returnValue(throwError(() => new Error('Network error')));

            service.openDeleteParticipantDialog(123, 'DEVICE123', mockVehicle, 'John\'s Car').subscribe(result => {
                expect(result).toBe(false);
                expect(notificationService.error).toHaveBeenCalledWith('Delete Vehicle Failed');
                done();
            });
        });

        it('should handle null device serial number', () => {
            dialogRef.afterClosed.and.returnValue(of(true));
            const mockResponse = createMockResource();
            participantService.deleteVehicle.and.returnValue(of(mockResponse));
            resourceMessageService.getString.and.returnValue(null);

            service.openDeleteParticipantDialog(123, null, mockVehicle, 'John\'s Car').subscribe();

            expect(participantService.deleteVehicle).toHaveBeenCalledWith({
                participantSeqId: 123,
                isActive: false,
            });
        });
    });
});