import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ManageAudioService, ManageAudioDialogContext } from './manage-audio.service';
import { DeviceService } from 'src/app/shared/services/api/device/device.service';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { EnrollmentDetailService } from '../enrollment-details/enrollment-details.service';
import { ParticipantDetailsFormattingService } from '../participant-details-formatting/participant-details-formatting.service';
import { ResourceMessageService } from 'src/app/shared/services/resources/resource-message.service';
import { AccountVehicleSummary } from 'src/app/shared/data/participant/resources';
import { HelpText } from 'src/app/shared/help/metadata';
import { DeviceResourceExtenders } from 'src/app/shared/data/device/device-resource-extenders';
import { MessageCode } from 'src/app/shared/data/application/enums';
import { Resource } from 'src/app/shared/data/application/resources';

describe('ManageAudioService', () => {
  let service: ManageAudioService;
  let dialogService: jasmine.SpyObj<DialogService>;
  let deviceService: jasmine.SpyObj<DeviceService>;
  let notificationService: jasmine.SpyObj<NotificationBannerService>;
  let enrollmentDetailService: jasmine.SpyObj<EnrollmentDetailService>;
  let formattingService: jasmine.SpyObj<ParticipantDetailsFormattingService>;
  let resourceMessageService: jasmine.SpyObj<ResourceMessageService>;

  const vehicle: AccountVehicleSummary = {} as AccountVehicleSummary;
  const baseContext: ManageAudioDialogContext = {
    deviceSerialNumber: 'abc123',
    isIoT: true,
    vehicle,
    nickname: 'nickname'
  };

  const createDialogRef = () => jasmine.createSpyObj('MatDialogRef', ['afterClosed']);

  beforeEach(() => {
    const dialogServiceSpy = jasmine.createSpyObj('DialogService', ['openConfirmationDialog']);
    const deviceServiceSpy = jasmine.createSpyObj('DeviceService', ['getAudioStatusAWS', 'setAudioStatusAWS', 'updateAudio']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationBannerService', ['success', 'error']);
    const enrollmentDetailServiceSpy = jasmine.createSpyObj('EnrollmentDetailService', ['refreshEnrollmentDetails']);
    const formattingServiceSpy = jasmine.createSpyObj('ParticipantDetailsFormattingService', ['formatVehicleNickname', 'formatVehicleYMM']);
    const resourceMessageServiceSpy = jasmine.createSpyObj('ResourceMessageService', ['getFirstString', 'getString']);

    TestBed.configureTestingModule({
      providers: [
        ManageAudioService,
        { provide: DialogService, useValue: dialogServiceSpy },
        { provide: DeviceService, useValue: deviceServiceSpy },
        { provide: NotificationBannerService, useValue: notificationServiceSpy },
        { provide: EnrollmentDetailService, useValue: enrollmentDetailServiceSpy },
        { provide: ParticipantDetailsFormattingService, useValue: formattingServiceSpy },
        { provide: ResourceMessageService, useValue: resourceMessageServiceSpy }
      ]
    });

    service = TestBed.inject(ManageAudioService);
    dialogService = TestBed.inject(DialogService) as jasmine.SpyObj<DialogService>;
    deviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
    notificationService = TestBed.inject(NotificationBannerService) as jasmine.SpyObj<NotificationBannerService>;
    enrollmentDetailService = TestBed.inject(EnrollmentDetailService) as jasmine.SpyObj<EnrollmentDetailService>;
    formattingService = TestBed.inject(ParticipantDetailsFormattingService) as jasmine.SpyObj<ParticipantDetailsFormattingService>;
    resourceMessageService = TestBed.inject(ResourceMessageService) as jasmine.SpyObj<ResourceMessageService>;

    formattingService.formatVehicleNickname.and.returnValue('MY VEHICLE');
    formattingService.formatVehicleYMM.and.returnValue('FALLBACK VEHICLE');
    resourceMessageService.getFirstString.and.returnValue(undefined);
    resourceMessageService.getString.and.returnValue(undefined);
  });

  it('should show IoT get status dialog with required copy and stop when cancelled', (done) => {
    const firstDialogRef = createDialogRef();
    firstDialogRef.afterClosed.and.returnValue(of(false));
    dialogService.openConfirmationDialog.and.returnValue(firstDialogRef);

    service.openManageAudioDialog({ ...baseContext }).subscribe(result => {
      expect(result).toBeFalse();
      expect(deviceService.getAudioStatusAWS).not.toHaveBeenCalled();
      done();
    });

    const firstCallArgs = dialogService.openConfirmationDialog.calls.first().args[0];
    expect(firstCallArgs).toEqual(jasmine.objectContaining({
      title: 'Manage Audio',
      message: 'Please click "OK" to get current audio status.',
      confirmText: 'OK',
      cancelText: 'CANCEL',
      helpKey: HelpText.AudioManage
    }));
    expect(firstCallArgs.subtitle).toBe('<div class="flex flex-col uppercase"><div>MY VEHICLE</div><div>ABC123</div></div>');
  });

  it('should complete IoT flow with legacy copy and success toast', (done) => {
    const firstDialogRef = createDialogRef();
    const secondDialogRef = createDialogRef();
    firstDialogRef.afterClosed.and.returnValue(of(true));
    secondDialogRef.afterClosed.and.returnValue(of(true));
    dialogService.openConfirmationDialog.and.returnValues(firstDialogRef, secondDialogRef);

    const audioStatusResponse = {
      messages: [],
      extenders: [{ key: DeviceResourceExtenders.AudioStatus, value: true }]
    } as unknown as Resource;

    const updateResponse = {
      messages: [{ key: MessageCode.StatusDescription, value: 'ignored' }],
      extenders: []
    } as unknown as Resource;

    deviceService.getAudioStatusAWS.and.returnValue(of(audioStatusResponse));
    deviceService.setAudioStatusAWS.and.returnValue(of(updateResponse));

    service.openManageAudioDialog({ ...baseContext }).subscribe(result => {
      expect(result).toBeTrue();
      expect(deviceService.getAudioStatusAWS).toHaveBeenCalledWith('abc123');
      expect(deviceService.setAudioStatusAWS).toHaveBeenCalledWith('abc123', false);
      expect(notificationService.success).toHaveBeenCalledWith('Audio Change Successful');
      expect(enrollmentDetailService.refreshEnrollmentDetails).toHaveBeenCalled();

      const secondCallArgs = dialogService.openConfirmationDialog.calls.all()[1].args[0];
      expect(secondCallArgs).toEqual(jasmine.objectContaining({
        title: 'Manage Audio',
        message: "Device audio is currently 'On'.  Would you like to set audio for this device to 'Off'?",
        confirmText: 'YES',
        cancelText: 'CANCEL',
        helpKey: HelpText.AudioManage
      }));

      done();
    });
  });

  it('should show Manage Audio dialog for non-IoT devices and toggle with correct copy', (done) => {
    const dialogRef = createDialogRef();
    dialogRef.afterClosed.and.returnValue(of(true));
    dialogService.openConfirmationDialog.and.returnValue(dialogRef);

    const updateResponse: Resource = {
      messages: [],
      extenders: []
    } as Resource;

    deviceService.updateAudio.and.returnValue(of(updateResponse));

    service.openManageAudioDialog({ ...baseContext, isIoT: false, currentAudioStatus: false }).subscribe(result => {
      expect(result).toBeTrue();
      expect(deviceService.updateAudio).toHaveBeenCalledWith('abc123', true);
      expect(notificationService.success).toHaveBeenCalledWith('Audio Change Successful');
      expect(enrollmentDetailService.refreshEnrollmentDetails).toHaveBeenCalled();

      const dialogArgs = dialogService.openConfirmationDialog.calls.first().args[0];
      expect(dialogArgs).toEqual(jasmine.objectContaining({
        title: 'Manage Audio',
        message: "Device audio is currently 'Off'.  Would you like to set audio for this device to 'On'?",
        confirmText: 'YES',
        cancelText: 'CANCEL',
        helpKey: HelpText.AudioManage
      }));
      done();
    });
  });
});
