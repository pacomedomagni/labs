import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { PingDeviceService } from './ping-device.service';
import { DeviceService } from 'src/app/shared/services/api/device/device.service';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { ParticipantDetailsFormattingService } from '../participant-details-formatting/participant-details-formatting.service';
import { AccountVehicleSummary } from 'src/app/shared/data/participant/resources';
import { MessageCode } from 'src/app/shared/data/application/enums';
import { Resource } from 'src/app/shared/data/application/resources';
import { ResourceMessageService } from 'src/app/shared/services/resources/resource-message.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/dialogs/confirmation-dialog/confirmation-dialog.component';

describe('PingDeviceService', () => {
  let service: PingDeviceService;
  let mockDeviceService: jasmine.SpyObj<DeviceService>;
  let mockDialogService: jasmine.SpyObj<DialogService>;
  let mockNotificationService: jasmine.SpyObj<NotificationBannerService>;
  let participantDetailsFormattingService: jasmine.SpyObj<ParticipantDetailsFormattingService>;
  let mockResourceMessageService: jasmine.SpyObj<ResourceMessageService>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ConfirmationDialogComponent, boolean>>;

  const mockVehicle: AccountVehicleSummary = {
    vehicleId: '12345',
    year: 2023,
    make: 'Toyota',
    model: 'Camry',
    vin: 'TEST123456789VIN',
    licensePlate: 'ABC123',
    state: 'CA'
  } as AccountVehicleSummary;

  const mockDeviceSerialNumber = 'DEV123456789';
  const mockNickName = 'My Car';
  const mockParticipantDisplay = '2023 Toyota Camry - My Car';

  beforeEach(() => {
    const deviceServiceSpy = jasmine.createSpyObj('DeviceService', ['pingDevice']);
    const dialogServiceSpy = jasmine.createSpyObj('DialogService', ['openConfirmationDialog']);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationBannerService', ['success', 'error']);
    const participantDetailsFormattingServiceSpy = jasmine.createSpyObj('ParticipantDetailsFormattingService', ['formatVehicleNickname']);
    const resourceMessageServiceSpy = jasmine.createSpyObj('ResourceMessageService', ['getString']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);

    TestBed.configureTestingModule({
      providers: [
        PingDeviceService,
        { provide: DeviceService, useValue: deviceServiceSpy },
        { provide: DialogService, useValue: dialogServiceSpy },
        { provide: NotificationBannerService, useValue: notificationServiceSpy },
        { provide: ParticipantDetailsFormattingService, useValue: participantDetailsFormattingServiceSpy },
        { provide: ResourceMessageService, useValue: resourceMessageServiceSpy }
      ]
    });

    service = TestBed.inject(PingDeviceService);
    mockDeviceService = TestBed.inject(DeviceService) as jasmine.SpyObj<DeviceService>;
    mockDialogService = TestBed.inject(DialogService) as jasmine.SpyObj<DialogService>;
    mockNotificationService = TestBed.inject(NotificationBannerService) as jasmine.SpyObj<NotificationBannerService>;
    participantDetailsFormattingService = TestBed.inject(ParticipantDetailsFormattingService) as jasmine.SpyObj<ParticipantDetailsFormattingService>;
    mockResourceMessageService = TestBed.inject(ResourceMessageService) as jasmine.SpyObj<ResourceMessageService>;
    mockDialogRef = dialogRefSpy;

    // Default setup for vehicle formatting
    participantDetailsFormattingService.formatVehicleNickname.and.returnValue(mockParticipantDisplay);
    mockDialogService.openConfirmationDialog.and.returnValue(mockDialogRef);
    
    // Default setup for ResourceMessageService
    mockResourceMessageService.getString.and.returnValue(undefined);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('openPingDeviceDialog', () => {
    it('should format vehicle nickname and open confirmation dialog with correct parameters', () => {
      mockDialogRef.afterClosed.and.returnValue(of(false));

      service.openPingDeviceDialog(mockDeviceSerialNumber, mockVehicle, mockNickName).subscribe();

      expect(participantDetailsFormattingService.formatVehicleNickname).toHaveBeenCalledWith(mockVehicle, mockNickName);
      expect(mockDialogService.openConfirmationDialog).toHaveBeenCalledWith({
        title: 'Ping Device',
        subtitle: `<div class="flex flex-col uppercase"><div>${mockParticipantDisplay}</div><div>${mockDeviceSerialNumber}</div></div>`,
        message: 'Are you sure you want to ping this device?',
        confirmText: 'YES'
      });
    });

    it('should return false when user cancels the dialog', (done) => {
      mockDialogRef.afterClosed.and.returnValue(of(false));

      service.openPingDeviceDialog(mockDeviceSerialNumber, mockVehicle, mockNickName).subscribe(result => {
        expect(result).toBeFalse();
        expect(mockDeviceService.pingDevice).not.toHaveBeenCalled();
        done();
      });
    });

    it('should ping device when user confirms the dialog', (done) => {
      const mockApiResponse: Resource = {
        extenders: [],
        messages: [
          { key: MessageCode.StatusDescription, value: 'Device pinged successfully' }
        ]
      };

      mockDialogRef.afterClosed.and.returnValue(of(true));
      mockDeviceService.pingDevice.and.returnValue(of(mockApiResponse));
      mockResourceMessageService.getString.and.callFake((messages, code) => {
        if (code === MessageCode.StatusDescription) return 'Device pinged successfully';
        return undefined;
      });

      service.openPingDeviceDialog(mockDeviceSerialNumber, mockVehicle, mockNickName).subscribe(result => {
        expect(result).toBeTrue();
        expect(mockDeviceService.pingDevice).toHaveBeenCalledWith(mockDeviceSerialNumber);
        expect(mockNotificationService.success).toHaveBeenCalledWith('Device pinged successfully');
        done();
      });
    });

    it('should propagate ping device failure after confirmation', (done) => {
      const networkError = new Error('Network error');
      mockDialogRef.afterClosed.and.returnValue(of(true));
      mockDeviceService.pingDevice.and.returnValue(throwError(() => networkError));

      service.openPingDeviceDialog(mockDeviceSerialNumber, mockVehicle, mockNickName).subscribe({
        next: () => fail('expected ping device to error'),
        error: (error) => {
          expect(error).toBe(networkError);
          expect(mockNotificationService.error).not.toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('pingDevice (private method testing through openPingDeviceDialog)', () => {
    beforeEach(() => {
      mockDialogRef.afterClosed.and.returnValue(of(true)); // Always confirm to test ping logic
    });

    it('should show success notification when ping succeeds with StatusDescription message', (done) => {
      const mockApiResponse: Resource = {
        extenders: [],
        messages: [
          { key: MessageCode.StatusDescription, value: 'Device ping successful' }
        ]
      };

      mockDeviceService.pingDevice.and.returnValue(of(mockApiResponse));
      mockResourceMessageService.getString.and.callFake((messages, code) => {
        if (code === MessageCode.StatusDescription) return 'Device ping successful';
        return undefined;
      });

      service.openPingDeviceDialog(mockDeviceSerialNumber, mockVehicle, mockNickName).subscribe(result => {
        expect(result).toBeTrue();
        expect(mockNotificationService.success).toHaveBeenCalledWith('Device ping successful');
        expect(mockNotificationService.error).not.toHaveBeenCalled();
        done();
      });
    });

    it('should show error notification when ping succeeds but has Error message', (done) => {
      const mockApiResponse: Resource = {
        extenders: [],
        messages: [
          { key: MessageCode.Error, value: 'Device not found' }
        ]
      };

      mockDeviceService.pingDevice.and.returnValue(of(mockApiResponse));
      mockResourceMessageService.getString.and.callFake((messages, code) => {
        if (code === MessageCode.Error) return 'Device not found';
        return undefined;
      });

      service.openPingDeviceDialog(mockDeviceSerialNumber, mockVehicle, mockNickName).subscribe(result => {
        expect(result).toBeTrue();
        expect(mockNotificationService.error).toHaveBeenCalledWith('Device not found');
        expect(mockNotificationService.success).not.toHaveBeenCalled();
        done();
      });
    });

    it('should show both success and error notifications when both messages are present', (done) => {
      const mockApiResponse: Resource = {
        extenders: [],
        messages: [
          { key: MessageCode.StatusDescription, value: 'Ping sent' },
          { key: MessageCode.Error, value: 'Device offline' }
        ]
      };

      mockDeviceService.pingDevice.and.returnValue(of(mockApiResponse));
      mockResourceMessageService.getString.and.callFake((messages, code) => {
        if (code === MessageCode.StatusDescription) return 'Ping sent';
        if (code === MessageCode.Error) return 'Device offline';
        return undefined;
      });

      service.openPingDeviceDialog(mockDeviceSerialNumber, mockVehicle, mockNickName).subscribe(result => {
        expect(result).toBeTrue();
        expect(mockNotificationService.success).toHaveBeenCalledWith('Ping sent');
        expect(mockNotificationService.error).toHaveBeenCalledWith('Device offline');
        done();
      });
    });

    it('should surface ping device API errors to subscribers', (done) => {
      const networkError = new Error('Network timeout');

      mockDeviceService.pingDevice.and.returnValue(throwError(() => networkError));

      service.openPingDeviceDialog(mockDeviceSerialNumber, mockVehicle, mockNickName).subscribe({
        next: () => fail('expected ping device to error'),
        error: (error) => {
          expect(error).toBe(networkError);
          expect(mockNotificationService.error).not.toHaveBeenCalled();
          done();
        }
      });
    });

    it('should handle API response with null messages', (done) => {
      const mockApiResponse: Resource = {
        extenders: [],
        messages: null
      };

      mockDeviceService.pingDevice.and.returnValue(of(mockApiResponse));

      service.openPingDeviceDialog(mockDeviceSerialNumber, mockVehicle, mockNickName).subscribe(result => {
        expect(result).toBeTrue();
        expect(mockNotificationService.success).not.toHaveBeenCalled();
        expect(mockNotificationService.error).not.toHaveBeenCalled();
        done();
      });
    });

    it('should handle API response with undefined messages', (done) => {
      const mockApiResponse: Resource = {
        extenders: [],
        messages: undefined
      };

      mockDeviceService.pingDevice.and.returnValue(of(mockApiResponse));

      service.openPingDeviceDialog(mockDeviceSerialNumber, mockVehicle, mockNickName).subscribe(result => {
        expect(result).toBeTrue();
        expect(mockNotificationService.success).not.toHaveBeenCalled();
        expect(mockNotificationService.error).not.toHaveBeenCalled();
        done();
      });
    });

    it('should handle API response with empty messages object', (done) => {
      const mockApiResponse: Resource = {
        extenders: [],
        messages: []
      };

      mockDeviceService.pingDevice.and.returnValue(of(mockApiResponse));

      service.openPingDeviceDialog(mockDeviceSerialNumber, mockVehicle, mockNickName).subscribe(result => {
        expect(result).toBeTrue();
        expect(mockNotificationService.success).not.toHaveBeenCalled();
        expect(mockNotificationService.error).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should complete full ping flow with success', (done) => {
      const mockApiResponse: Resource = {
        extenders: [],
        messages: [
          { key: MessageCode.StatusDescription, value: 'Device successfully pinged' }
        ]
      };

      mockDialogRef.afterClosed.and.returnValue(of(true));
      mockDeviceService.pingDevice.and.returnValue(of(mockApiResponse));
      mockResourceMessageService.getString.and.callFake((messages, code) => {
        if (code === MessageCode.StatusDescription) return 'Device successfully pinged';
        return undefined;
      });

      service.openPingDeviceDialog(mockDeviceSerialNumber, mockVehicle, mockNickName).subscribe(result => {
        // Verify formatting was called
        expect(participantDetailsFormattingService.formatVehicleNickname).toHaveBeenCalledWith(mockVehicle, mockNickName);
        
        // Verify dialog was opened
        expect(mockDialogService.openConfirmationDialog).toHaveBeenCalled();
        
        // Verify ping was executed
        expect(mockDeviceService.pingDevice).toHaveBeenCalledWith(mockDeviceSerialNumber);
        
        // Verify success notification
        expect(mockNotificationService.success).toHaveBeenCalledWith('Device successfully pinged');
        
        // Verify result
        expect(result).toBeTrue();
        done();
      });
    });

    it('should propagate failure during integration flow', (done) => {
      const apiError = new Error('Service unavailable');

      mockDialogRef.afterClosed.and.returnValue(of(true));
      mockDeviceService.pingDevice.and.returnValue(throwError(() => apiError));

      service.openPingDeviceDialog(mockDeviceSerialNumber, mockVehicle, mockNickName).subscribe({
        next: () => fail('expected ping device to error'),
        error: (error) => {
          // Verify formatting was called
          expect(participantDetailsFormattingService.formatVehicleNickname).toHaveBeenCalledWith(mockVehicle, mockNickName);

          // Verify dialog was opened
          expect(mockDialogService.openConfirmationDialog).toHaveBeenCalled();

          // Verify ping was attempted
          expect(mockDeviceService.pingDevice).toHaveBeenCalledWith(mockDeviceSerialNumber);

          // Verify notifications are untouched
          expect(mockNotificationService.error).not.toHaveBeenCalled();

          expect(error).toBe(apiError);
          done();
        }
      });
    });
  });
});