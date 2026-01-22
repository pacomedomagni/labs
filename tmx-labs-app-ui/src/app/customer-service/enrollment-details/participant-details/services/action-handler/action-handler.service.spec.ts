import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ActionHandlerService } from './action-handler.service';
import { MarkAbandonedService } from '../mark-abandoned/mark-abandoned.service';
import { MarkDefectiveService } from '../mark-defective/mark-defective.service';
import { ParticipantDetailsFormattingService } from '../participant-details-formatting/participant-details-formatting.service';
import { ParticipantNicknameService } from '../participant-nickname/participant-nickname.service';
import { EditVehicleService } from '../edit-vehicle/edit-vehicle.service';
import { ReplaceDeviceService } from '../replace-device/replace-device.service';
import { SwapDevicesService } from '../swap-devices/swap-devices.service';
import { PingDeviceService } from '../ping-device/ping-device.service';
import { ResetDeviceService } from '../reset-device/reset-device.service';
import { OptOutService } from '../opt-out/opt-out.service';
import { DeleteParticipantService } from '../delete-participant/delete-participant.service';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { Router } from '@angular/router';
import { ManageAudioService } from '../manage-audio/manage-audio.service';
import { ViewTripsService } from '../view-trips/view-trips.service';

describe('ActionHandlerService', () => {
  let service: ActionHandlerService;

  beforeEach(() => {
    const markAbandonedService = jasmine.createSpyObj('MarkAbandonedService', ['openMarkAbandonedDialog']);
    markAbandonedService.openMarkAbandonedDialog.and.returnValue(of(true));

    const markDefectiveService = jasmine.createSpyObj('MarkDefectiveService', ['openMarkDefectiveDialog']);
    markDefectiveService.openMarkDefectiveDialog.and.returnValue(of(true));

    const participantDetailsFormattingService = jasmine.createSpyObj('ParticipantDetailsFormattingService', ['formatVehicleNickname']);
    participantDetailsFormattingService.formatVehicleNickname.and.returnValue('formatted nickname');

    const participantNicknameService = jasmine.createSpyObj('ParticipantNicknameService', ['openEditNicknameDialog']);
    participantNicknameService.openEditNicknameDialog.and.returnValue(of(null));

    const editVehicleService = jasmine.createSpyObj('EditVehicleService', ['openEditVehicleDialog']);
    editVehicleService.openEditVehicleDialog.and.returnValue(of(null));

    const replaceDeviceService = jasmine.createSpyObj('ReplaceDeviceService', ['openReplaceDeviceDialog']);
    replaceDeviceService.openReplaceDeviceDialog.and.returnValue(of(true));

    const swapDevicesService = jasmine.createSpyObj('SwapDevicesService', ['openSwapDevicesDialog']);
    swapDevicesService.openSwapDevicesDialog.and.returnValue(of(true));

    const pingDeviceService = jasmine.createSpyObj('PingDeviceService', ['openPingDeviceDialog']);
    pingDeviceService.openPingDeviceDialog.and.returnValue(of(true));

    const resetDeviceService = jasmine.createSpyObj('ResetDeviceService', ['openResetDeviceDialog']);
    resetDeviceService.openResetDeviceDialog.and.returnValue(of(true));

    const optOutService = jasmine.createSpyObj('OptOutService', ['openOptOutDialog']);
    optOutService.openOptOutDialog.and.returnValue(of(true));

    const deleteParticipantService = jasmine.createSpyObj('DeleteParticipantService', ['openDeleteParticipantDialog']);
    deleteParticipantService.openDeleteParticipantDialog.and.returnValue(of(true));

    const notificationService = jasmine.createSpyObj('NotificationBannerService', ['success', 'error']);
    const manageAudioService = jasmine.createSpyObj('ManageAudioService', ['openManageAudioDialog']);
    manageAudioService.openManageAudioDialog.and.returnValue(of(true));

    const viewTripsService = jasmine.createSpyObj('ViewTripsService', ['openViewTripsDialog']);
    viewTripsService.openViewTripsDialog.and.returnValue({ afterClosed: () => of(undefined) });

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        ActionHandlerService,
        { provide: MarkAbandonedService, useValue: markAbandonedService },
        { provide: MarkDefectiveService, useValue: markDefectiveService },
        { provide: ParticipantDetailsFormattingService, useValue: participantDetailsFormattingService },
        { provide: ParticipantNicknameService, useValue: participantNicknameService },
        { provide: EditVehicleService, useValue: editVehicleService },
        { provide: ReplaceDeviceService, useValue: replaceDeviceService },
        { provide: SwapDevicesService, useValue: swapDevicesService },
        { provide: PingDeviceService, useValue: pingDeviceService },
        { provide: ResetDeviceService, useValue: resetDeviceService },
        { provide: OptOutService, useValue: optOutService },
        { provide: DeleteParticipantService, useValue: deleteParticipantService },
        { provide: NotificationBannerService, useValue: notificationService },
        { provide: ManageAudioService, useValue: manageAudioService },
        { provide: ViewTripsService, useValue: viewTripsService },
        { provide: Router, useValue: routerSpy },
      ],
    });
    service = TestBed.inject(ActionHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
