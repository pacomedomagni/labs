import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ReplaceDeviceService, ReplaceDeviceDialogContext } from './replace-device.service';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { DeviceService } from 'src/app/shared/services/api/device/device.service';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { EnrollmentDetailService } from '../enrollment-details/enrollment-details.service';
import { ParticipantDetailsFormattingService } from '../participant-details-formatting/participant-details-formatting.service';
import { AccountVehicleSummary } from 'src/app/shared/data/participant/resources';
import { Resource, ResourceMessage } from 'src/app/shared/data/application/resources';
import { ResourceMessageService } from 'src/app/shared/services/resources/resource-message.service';

interface DialogOptions {
    title: string;
    subtitle?: string;
    message: string;
    confirmText?: string;
}

class DialogServiceStub {
    lastOptions: DialogOptions | null = null;
    result = false;

    openConfirmationDialog(options: DialogOptions) {
        this.lastOptions = options;
        return {
            afterClosed: () => of(this.result),
        };
    }
}

class DeviceServiceStub {
    replaceDevice = jasmine.createSpy('replaceDevice');
    markAbandoned = jasmine.createSpy('markAbandoned');
    markDefective = jasmine.createSpy('markDefective');
}

class NotificationBannerServiceStub {
    success = jasmine.createSpy('success');
    error = jasmine.createSpy('error');
}

class EnrollmentDetailServiceStub {
    refreshEnrollmentDetails = jasmine.createSpy('refreshEnrollmentDetails');
}

class ResourceMessageServiceStub {
    getFirstString = jasmine.createSpy('getFirstString');
    getString = jasmine.createSpy('getString');
}

describe('ReplaceDeviceService', () => {
    let service: ReplaceDeviceService;
    let dialogService: DialogServiceStub;
    let deviceService: DeviceServiceStub;
    let notifications: NotificationBannerServiceStub;
    let enrollmentDetailService: EnrollmentDetailServiceStub;
    let resourceMessageService: ResourceMessageServiceStub;

    const vehicle: AccountVehicleSummary = {
        year: 2024,
        make: 'Toyota',
        model: 'Camry',
    };

    const createContext = (): ReplaceDeviceDialogContext => ({
        participantSeqId: 1234,
        deviceSerialNumber: 'ABC1234',
        vehicle,
        nickname: 'Daily Driver',
    });

    beforeEach(() => {
        dialogService = new DialogServiceStub();

        TestBed.configureTestingModule({
            providers: [
                ReplaceDeviceService,
                ParticipantDetailsFormattingService,
                { provide: DialogService, useValue: dialogService },
                { provide: DeviceService, useClass: DeviceServiceStub },
                { provide: NotificationBannerService, useClass: NotificationBannerServiceStub },
                { provide: EnrollmentDetailService, useClass: EnrollmentDetailServiceStub },
                { provide: ResourceMessageService, useClass: ResourceMessageServiceStub },
            ],
        });

        service = TestBed.inject(ReplaceDeviceService);
        deviceService = TestBed.inject(DeviceService) as unknown as DeviceServiceStub;
        notifications = TestBed.inject(NotificationBannerService) as unknown as NotificationBannerServiceStub;
        enrollmentDetailService = TestBed.inject(EnrollmentDetailService) as unknown as EnrollmentDetailServiceStub;
        resourceMessageService = TestBed.inject(ResourceMessageService) as unknown as ResourceMessageServiceStub;
    });

    it('does not call replace when dialog is cancelled', () => {
        dialogService.result = false;

        const results: boolean[] = [];
        service.openReplaceDeviceDialog(createContext()).subscribe((value) => results.push(value));

        expect(deviceService.replaceDevice).not.toHaveBeenCalled();
        expect(results).toEqual([false]);
        expect(notifications.success).not.toHaveBeenCalled();
        expect(notifications.error).not.toHaveBeenCalled();
    });

    it('surfaces error message when API response contains errors', () => {
        dialogService.result = true;
        const errorResource: Resource = {
            extenders: [],
            messages: {
                errorDetails: 'SIM deactivation did not succeed',
            } as ResourceMessage,
        };

        deviceService.replaceDevice.and.returnValue(of(errorResource));
        resourceMessageService.getFirstString.and.returnValue('SIM deactivation did not succeed');

        const results: boolean[] = [];
        service.openReplaceDeviceDialog(createContext()).subscribe((value) => results.push(value));

        expect(deviceService.replaceDevice).toHaveBeenCalledWith(1234);
        expect(results).toEqual([false]);
        expect(notifications.error).toHaveBeenCalledWith('SIM deactivation did not succeed');
        expect(notifications.success).not.toHaveBeenCalled();
        expect(enrollmentDetailService.refreshEnrollmentDetails).not.toHaveBeenCalled();
    });

    it('shows success message and refreshes details on success', () => {
        dialogService.result = true;
        const successResource: Resource = {
            extenders: [],
            messages: {statusDescription: 'Device replacement initiated'} as ResourceMessage,
        };

        deviceService.replaceDevice.and.returnValue(of(successResource));
        resourceMessageService.getFirstString.and.returnValue(null);
        resourceMessageService.getString.and.returnValue('Device replacement initiated');

        const results: boolean[] = [];
        service.openReplaceDeviceDialog(createContext()).subscribe((value) => results.push(value));

        expect(results).toEqual([true]);
        expect(notifications.success).toHaveBeenCalledWith('Device replacement initiated');
        expect(notifications.error).not.toHaveBeenCalled();
        expect(enrollmentDetailService.refreshEnrollmentDetails).toHaveBeenCalledTimes(1);
    });
});