import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MarkAbandonedService } from './mark-abandoned.service';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { DeviceService } from 'src/app/shared/services/api/device/device.service';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { EnrollmentDetailService } from '../../services/enrollment-details/enrollment-details.service';
import { ParticipantDetailsFormattingService } from '../participant-details-formatting/participant-details-formatting.service';
import { AccountVehicleSummary } from 'src/app/shared/data/participant/resources';
import {
  DeviceLocation,
  DeviceLocationValue,
  DeviceReturnReasonCode,
  DeviceReturnReasonCodeValue,
  DeviceStatus,
  DeviceStatusValue,
} from 'src/app/shared/data/device/enums';

interface DialogOptions {
  title: string;
  subtitle?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
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
  markAbandoned = jasmine
    .createSpy('markAbandoned')
    .and.returnValue(of({ extenders: [], messages: [] }));
}

class NotificationBannerServiceStub {
  success = jasmine.createSpy('success');
  error = jasmine.createSpy('error');
}

class EnrollmentDetailServiceStub {
  updateParticipantDevice = jasmine.createSpy('updateParticipantDevice');
}

describe('MarkAbandonedService', () => {
  let service: MarkAbandonedService;
  let dialogService: DialogServiceStub;
  let deviceService: DeviceServiceStub;
  let enrollmentDetailService: EnrollmentDetailServiceStub;
  let notifications: NotificationBannerServiceStub;

  beforeEach(() => {
    dialogService = new DialogServiceStub();

    TestBed.configureTestingModule({
      providers: [
        MarkAbandonedService,
        ParticipantDetailsFormattingService,
        { provide: DialogService, useValue: dialogService },
        { provide: DeviceService, useClass: DeviceServiceStub },
        { provide: NotificationBannerService, useClass: NotificationBannerServiceStub },
        { provide: EnrollmentDetailService, useClass: EnrollmentDetailServiceStub },
      ],
    });

    service = TestBed.inject(MarkAbandonedService);
    deviceService = TestBed.inject(DeviceService) as unknown as DeviceServiceStub;
    enrollmentDetailService = TestBed.inject(EnrollmentDetailService) as unknown as EnrollmentDetailServiceStub;
    notifications = TestBed.inject(NotificationBannerService) as unknown as NotificationBannerServiceStub;
  });

  it('formats subtitle with uppercase participant details when nickname exists', () => {
    const vehicle: AccountVehicleSummary = { year: 2023, make: 'Toyota', model: 'Camry' };
    service.openMarkAbandonedDialog("k270114k", 1, vehicle, "Laura's Car").subscribe();

    const subtitle: string = dialogService.lastOptions.subtitle;
    expect(subtitle).toContain('LAURA&#39;S CAR');
    expect(subtitle).not.toContain('2023 TOYOTA CAMRY');
    expect(subtitle).toContain('K270114K');
    expect(dialogService.lastOptions.cancelText).toBe('CANCEL');
    expect(dialogService.lastOptions.confirmText).toBe('YES');
  });

  it('uses vehicle details when nickname is unavailable', () => {
    const vehicle: AccountVehicleSummary = { year: 2022, make: 'Honda', model: 'Civic' };
    service.openMarkAbandonedDialog('abc123', 2, vehicle, undefined).subscribe();

    const subtitle: string = dialogService.lastOptions.subtitle;
    expect(subtitle).toContain('2022 HONDA CIVIC');
    expect(subtitle).toContain('ABC123');
  });

  it('marks device abandoned when dialog is confirmed', () => {
    const participantSeqId = 77;
    dialogService.result = true;

    service.openMarkAbandonedDialog('abc123', participantSeqId, {}, undefined).subscribe();

    expect(deviceService.markAbandoned).toHaveBeenCalledWith('abc123', participantSeqId);
    expect(enrollmentDetailService.updateParticipantDevice).toHaveBeenCalledTimes(1);

    const updates = enrollmentDetailService.updateParticipantDevice.calls.mostRecent().args[1];
    expect(updates.deviceStatusCode).toBe(DeviceStatusValue.get(DeviceStatus.Abandoned));
    expect(updates.deviceReturnReasonCode).toBe(
      DeviceReturnReasonCodeValue.get(DeviceReturnReasonCode.Abandoned),
    );
    expect(updates.deviceLocationCode).toBe(DeviceLocationValue.get(DeviceLocation.Unknown));
    expect(typeof updates.deviceAbandonedDateTime).toBe('string');
    expect(notifications.success).toHaveBeenCalledWith('Mark Abandoned Successful');
  });
});
