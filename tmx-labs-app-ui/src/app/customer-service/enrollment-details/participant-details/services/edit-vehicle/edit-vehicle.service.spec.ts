import { TestBed } from '@angular/core/testing';
import { Type } from '@angular/core';
import { EditVehicleService, VehicleEditDialogContext } from './edit-vehicle.service';
import { MessageCode } from 'src/app/shared/data/application/enums';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { VehicleDetails, UpdateVehicleResponse } from 'src/app/shared/data/vehicle/resources';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { ParticipantService } from 'src/app/shared/services/api/participant/participant.service';
import { ResourceMessageService } from 'src/app/shared/services/resources/resource-message.service';

describe('EditVehicleService', () => {
    let service: EditVehicleService;
    let dialogService: jasmine.SpyObj<DialogService>;
    let participantService: jasmine.SpyObj<ParticipantService>;
    let notificationBannerService: jasmine.SpyObj<NotificationBannerService>;
    let resourceMessageService: jasmine.SpyObj<ResourceMessageService>;

    const mockVehicle: VehicleDetails = {
        year: 2023,
        make: 'Toyota',
        model: 'Camry',
        scoringAlgorithm: {
            description: 'Standard',
            code: 1,
        },
        vehicleSeqID: 12345,
    };

    beforeEach(() => {
        const dialogServiceSpy = jasmine.createSpyObj('DialogService', ['openFormDialog']);
        const participantServiceSpy = jasmine.createSpyObj('ParticipantService', ['updateVehicle']);
        const notificationBannerServiceSpy = jasmine.createSpyObj('NotificationBannerService', [
            'success',
            'error',
        ]);
        const resourceMessageServiceSpy = jasmine.createSpyObj('ResourceMessageService', [
            'getFirstString',
            'getString',
        ]);

        TestBed.configureTestingModule({
            providers: [
                EditVehicleService,
                { provide: DialogService, useValue: dialogServiceSpy },
                { provide: ParticipantService, useValue: participantServiceSpy },
                { provide: NotificationBannerService, useValue: notificationBannerServiceSpy },
                { provide: ResourceMessageService, useValue: resourceMessageServiceSpy },
            ],
        });

        service = TestBed.inject(EditVehicleService);
        dialogService = TestBed.inject(DialogService) as jasmine.SpyObj<DialogService>;
        participantService = TestBed.inject(
            ParticipantService,
        ) as jasmine.SpyObj<ParticipantService>;
        notificationBannerService = TestBed.inject(
            NotificationBannerService,
        ) as jasmine.SpyObj<NotificationBannerService>;
        resourceMessageService = TestBed.inject(
            ResourceMessageService,
        ) as jasmine.SpyObj<ResourceMessageService>;
    });

    describe('service initialization', () => {
        it('should be created', () => {
            expect(service).toBeTruthy();
        });

        it('should have correct service dependencies injected', () => {
            expect(service).toBeDefined();
            expect(dialogService).toBeDefined();
            expect(participantService).toBeDefined();
            expect(notificationBannerService).toBeDefined();
            expect(resourceMessageService).toBeDefined();
        });
    });

    describe('openEditVehicleDialog - input validation', () => {
        it('should return null when context.vehicle is null', (done) => {
            const context: VehicleEditDialogContext = { vehicle: null! };

            service.openEditVehicleDialog(context).subscribe((result) => {
                expect(result).toBeNull();
                done();
            });
        });

        it('should return null when context.vehicle is undefined', (done) => {
            const context: VehicleEditDialogContext = { vehicle: undefined! };

            service.openEditVehicleDialog(context).subscribe((result) => {
                expect(result).toBeNull();
                done();
            });
        });
    });

    describe('evaluateVehicleResponse behavior', () => {
        // Test the private method behavior through public method testing
        interface VehicleEditOutcome {
            success: boolean;
            vehicle: VehicleDetails;
            successMessage?: string;
            errorMessage?: string;
        }
        interface TestableEditVehicleService {
            evaluateVehicleResponse(response: UpdateVehicleResponse | null | undefined, requestedVehicle: VehicleDetails): VehicleEditOutcome;
        }
        let testService: TestableEditVehicleService; // Access private methods

        beforeEach(() => {
            testService = service as unknown as TestableEditVehicleService;
        });

        it('should return success outcome with vehicle when no error messages', () => {
            const response: UpdateVehicleResponse = {
                changedVehicle: mockVehicle,
                messages: [],
                extenders: [],
            };

            const result = testService.evaluateVehicleResponse(response, mockVehicle);

            expect(result.success).toBe(true);
            expect(result.vehicle).toEqual(mockVehicle);
        });

        it('should return error outcome when error messages exist', () => {
            const response: UpdateVehicleResponse = {
                changedVehicle: null,
                messages: [{ key: MessageCode.ErrorCode, value: 'Test error' }],
                extenders: [],
            };
            resourceMessageService.getFirstString.and.returnValue('Test error');

            const result = testService.evaluateVehicleResponse(response, mockVehicle);

            expect(result.success).toBe(false);
            expect(result.errorMessage).toBe('Test error');
            expect(result.vehicle).toEqual(mockVehicle);
        });

        it('should preserve vehicleSeqID from requestedVehicle when response lacks it', () => {
            const responseVehicle = { ...mockVehicle, vehicleSeqID: null };
            const response: UpdateVehicleResponse = {
                changedVehicle: responseVehicle,
                messages: [],
                extenders: [],
            };

            const result = testService.evaluateVehicleResponse(response, mockVehicle);

            expect(result.success).toBe(true);
            expect(result.vehicle?.vehicleSeqID).toBe(mockVehicle.vehicleSeqID);
        });

        it('should use requestedVehicle when response.changedVehicle is null', () => {
            const response: UpdateVehicleResponse = {
                changedVehicle: null,
                messages: [],
                extenders: [],
            };
            resourceMessageService.getFirstString.and.returnValue(null);

            const result = testService.evaluateVehicleResponse(response, mockVehicle);

            expect(result.success).toBe(true);
            expect(result.vehicle).toEqual(mockVehicle);
        });

        it('should handle undefined response', () => {
            resourceMessageService.getFirstString.and.returnValue(null);

            const result = testService.evaluateVehicleResponse(undefined, mockVehicle);

            expect(result.success).toBe(true);
            expect(result.vehicle).toEqual(mockVehicle);
        });

        it('should handle null response', () => {
            resourceMessageService.getFirstString.and.returnValue(null);

            const result = testService.evaluateVehicleResponse(null, mockVehicle);

            expect(result.success).toBe(true);
            expect(result.vehicle).toEqual(mockVehicle);
        });

        it('should extract success message when available', () => {
            const response: UpdateVehicleResponse = {
                changedVehicle: mockVehicle,
                messages: [{ key: MessageCode.StatusDescription, value: 'Success!' }],
                extenders: [],
            };
            resourceMessageService.getFirstString.and.returnValue(null);
            resourceMessageService.getString.and.returnValue('Success!');

            const result = testService.evaluateVehicleResponse(response, mockVehicle);

            expect(result.success).toBe(true);
            expect(result.successMessage).toBe('Success!');
        });

        it('should check multiple error message types', () => {
            const response: UpdateVehicleResponse = {
                changedVehicle: null,
                messages: [
                    { key: MessageCode.ErrorCode, value: 'Error 1' },
                    { key: MessageCode.Error, value: 'Error 2' },
                ],
                extenders: [],
            };
            resourceMessageService.getFirstString.and.returnValue('Error 1');

            const result = testService.evaluateVehicleResponse(response, mockVehicle);

            expect(resourceMessageService.getFirstString).toHaveBeenCalledWith(response.messages, [
                MessageCode.ErrorCode,
                MessageCode.Error,
                MessageCode.ErrorDetails,
            ]);
            expect(result.success).toBe(false);
            expect(result.errorMessage).toBe('Error 1');
        });
    });

    describe('service configuration', () => {
        it('should be provided in root', () => {
            const serviceMetadata = (EditVehicleService as Type<EditVehicleService> & { ɵprov: { providedIn: string } }).ɵprov;
            expect(serviceMetadata.providedIn).toBe('root');
        });

        it('should have correct dependency injections', () => {
            interface TestableServiceProperties {
                dialogService: DialogService;
                participantService: ParticipantService;
                notificationBannerService: NotificationBannerService;
                resourceMessageService: ResourceMessageService;
            }
            const serviceWithProperties = service as unknown as TestableServiceProperties;
            expect(serviceWithProperties.dialogService).toBeDefined();
            expect(serviceWithProperties.participantService).toBeDefined();
            expect(serviceWithProperties.notificationBannerService).toBeDefined();
            expect(serviceWithProperties.resourceMessageService).toBeDefined();
        });
    });
});
