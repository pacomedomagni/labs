import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DeviceService } from 'src/app/shared/services/api/device/device.service';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { EnrollmentDetailService } from '../enrollment-details/enrollment-details.service';
import { ParticipantDetailsFormattingService } from '../participant-details-formatting/participant-details-formatting.service';
import { AccountVehicleSummary } from 'src/app/shared/data/participant/resources';
import { formatLinesAsStackedHtml, toUpper } from 'src/app/shared/utils/string-utils';
import { Resource } from 'src/app/shared/data/application/resources';
import { ResourceMessageService } from 'src/app/shared/services/resources/resource-message.service';
import { MessageCode } from 'src/app/shared/data/application/enums';
import { DeviceResourceExtenders } from 'src/app/shared/data/device/device-resource-extenders';
import { HelpText } from 'src/app/shared/help/metadata';

export interface ManageAudioDialogContext {
  deviceSerialNumber: string;
  isIoT: boolean;
  vehicle: AccountVehicleSummary;
  nickname: string | null | undefined;
  currentAudioStatus?: boolean | null;
}

interface AudioStatusResult {
  success: boolean;
  isAudioOn?: boolean;
  statusMessage?: string;
  errorMessage?: string;
}

interface OperationOutcome {
  success: boolean;
  successMessage?: string;
  errorMessage?: string;
}

@Injectable({ providedIn: 'root' })
export class ManageAudioService {
  private readonly dialogService = inject(DialogService);
  private readonly deviceService = inject(DeviceService);
  private readonly notificationService = inject(NotificationBannerService);
  private readonly enrollmentDetailService = inject(EnrollmentDetailService);
  private readonly formattingService = inject(ParticipantDetailsFormattingService);
  private readonly resourceMessageService = inject(ResourceMessageService);

  openManageAudioDialog(context: ManageAudioDialogContext): Observable<boolean> {
    if (!context.deviceSerialNumber) {
      this.handleError('Device serial number is required to manage audio.');
      return of(false);
    }

    return context.isIoT
      ? this.handleIotFlow(context)
      : this.handleLegacyFlow(context);
  }

  private handleIotFlow(context: ManageAudioDialogContext): Observable<boolean> {
    const subtitle = this.buildSubtitle(context);

    return this.dialogService
      .openConfirmationDialog({
        title: 'Manage Audio',
        subtitle,
        message: 'Please click "OK" to get current audio status.',
        confirmText: 'OK',
        cancelText: 'CANCEL',
        helpKey: HelpText.AudioManage,
      })
      .afterClosed()
      .pipe(
        switchMap((confirmed) => {
          if (!confirmed) {
            return of(false);
          }

          return this.deviceService.getAudioStatusAWS(context.deviceSerialNumber).pipe(
            map((response) => this.parseAudioStatus(response)),
            switchMap((status) => {
              if (!status.success || typeof status.isAudioOn !== 'boolean') {
                this.handleError(status.errorMessage ?? 'Unable to retrieve current audio status.');
                return of(false);
              }

              const prompt = this.composeTogglePrompt(status.isAudioOn);

              return this.dialogService
                .openConfirmationDialog({
                  title: 'Manage Audio',
                  subtitle,
                  message: prompt,
                  confirmText: 'YES',
                  cancelText: 'CANCEL',
                  helpKey: HelpText.AudioManage,
                })
                .afterClosed()
                .pipe(
                  switchMap((shouldToggle) => {
                    if (!shouldToggle) {
                      return of(false);
                    }

                    return this.setAudioStatusAWS(context.deviceSerialNumber, !status.isAudioOn);
                  }),
                );
            }),
            catchError((error) => {
              console.error('Get audio status error:', error);
              this.handleError('Failed to retrieve current audio status.');
              return of(false);
            }),
          );
        }),
      );
  }

  private handleLegacyFlow(context: ManageAudioDialogContext): Observable<boolean> {
    const subtitle = this.buildSubtitle(context);

    return this.resolveLegacyStatus(context).pipe(
      switchMap((status) => {
        if (!status.success || typeof status.isAudioOn !== 'boolean') {
          this.handleError(status.errorMessage ?? 'Unable to determine current audio status.');
          return of(false);
        }

        const prompt = this.composeTogglePrompt(status.isAudioOn);

        return this.dialogService
          .openConfirmationDialog({
            title: 'Manage Audio',
            subtitle,
            message: prompt,
            confirmText: 'YES',
            cancelText: 'CANCEL',
            helpKey: HelpText.AudioManage,
          })
          .afterClosed()
          .pipe(
            switchMap((confirmed) => {
              if (!confirmed) {
                return of(false);
              }

              return this.updateAudio(context.deviceSerialNumber, !status.isAudioOn);
            }),
          );
      }),
    );
  }

  private resolveLegacyStatus(context: ManageAudioDialogContext): Observable<AudioStatusResult> {
    if (typeof context.currentAudioStatus === 'boolean') {
      return of({ success: true, isAudioOn: context.currentAudioStatus });
    }

    return this.deviceService.getAudioStatusAWS(context.deviceSerialNumber).pipe(
      map((response) => this.parseAudioStatus(response)),
      catchError((error) => {
        console.error('Get audio status (legacy fallback) error:', error);
        return of({ success: false, errorMessage: 'Failed to retrieve current audio status.' });
      }),
    );
  }

  private setAudioStatusAWS(deviceSerialNumber: string, isAudioOn: boolean): Observable<boolean> {
    return this.deviceService.setAudioStatusAWS(deviceSerialNumber, isAudioOn).pipe(
      map((response) => this.evaluateOperation(response)),
      map((outcome) => this.applyOutcome(outcome)),
      catchError((error) => {
        console.error('Set audio status error:', error);
        this.handleError('Failed to update audio setting.');
        return of(false);
      }),
    );
  }

  private updateAudio(deviceSerialNumber: string, isAudioOn: boolean): Observable<boolean> {
    return this.deviceService.updateAudio(deviceSerialNumber, isAudioOn).pipe(
      map((response) => this.evaluateOperation(response)),
      map((outcome) => this.applyOutcome(outcome)),
      catchError((error) => {
        console.error('Update audio error:', error);
        this.handleError('Failed to update audio setting.');
        return of(false);
      }),
    );
  }

  private evaluateOperation(response: Resource | null | undefined): OperationOutcome {
    const errorMessage = this.resourceMessageService.getFirstString(response?.messages, [
      MessageCode.ErrorDetails,
      MessageCode.Error,
      MessageCode.ErrorCode,
    ]);

    if (errorMessage) {
      return { success: false, errorMessage };
    }

    const statusMessage = this.resourceMessageService.getString(
      response?.messages,
      MessageCode.StatusDescription,
    );

    return {
      success: true,
      successMessage: statusMessage ?? undefined,
    };
  }

  private applyOutcome(outcome: OperationOutcome): boolean {
    if (!outcome.success) {
      this.handleError(outcome.errorMessage ?? 'Failed to update audio setting.');
      return false;
    }

    this.notificationService.success('Audio Change Successful');
    this.enrollmentDetailService.refreshEnrollmentDetails();
    return true;
  }

  private parseAudioStatus(response: Resource | null | undefined): AudioStatusResult {
    if (response == null) {
      return { success: false, errorMessage: 'No response received.' };
    }

    const errorMessage = this.resourceMessageService.getFirstString(response.messages, [
      MessageCode.ErrorDetails,
      MessageCode.Error,
      MessageCode.ErrorCode,
    ]);

    if (errorMessage) {
      return { success: false, errorMessage };
    }

    const audioStatus = this.extractExtenderBoolean(response.extenders, DeviceResourceExtenders.AudioStatus);
    if (typeof audioStatus !== 'boolean') {
      return { success: false, errorMessage: 'Unable to determine current audio status.' };
    }

    const statusMessage = this.resourceMessageService.getString(
      response.messages,
      MessageCode.StatusDescription,
    );

    return {
      success: true,
      isAudioOn: audioStatus,
      statusMessage: statusMessage ?? undefined,
    };
  }

  private extractExtenderBoolean(extenders: unknown, key: string): boolean | undefined {
    if (!extenders) {
      return undefined;
    }

    if (Array.isArray(extenders)) {
      for (const entry of extenders) {
        if (!entry || typeof entry !== 'object') {
          continue;
        }

        const candidateKey = (entry as { key?: string; Key?: string }).key ?? (entry as { Key?: string }).Key;
        if (candidateKey !== key) {
          continue;
        }

        const rawValue = (entry as { value?: unknown; Value?: unknown }).value ?? (entry as { Value?: unknown }).Value;
        if (typeof rawValue === 'boolean') {
          return rawValue;
        }
      }

      return undefined;
    }

    if (typeof extenders === 'object') {
      const record = extenders as Record<string, unknown>;
      const candidate = record[key];
      if (typeof candidate === 'boolean') {
        return candidate;
      }
    }

    return undefined;
  }

  private composeTogglePrompt(currentAudio: boolean): string {
    return currentAudio
      ? "Device audio is currently 'On'.  Would you like to set audio for this device to 'Off'?"
      : "Device audio is currently 'Off'.  Would you like to set audio for this device to 'On'?";
  }

  private buildSubtitle(context: ManageAudioDialogContext): string {
    const nicknameDisplay = this.formattingService.formatVehicleNickname(context.vehicle, context.nickname);
    const vehicleDisplay = nicknameDisplay?.trim()
      ? nicknameDisplay
      : this.formattingService.formatVehicleYMM(context.vehicle);

    const serialDisplay = toUpper(context.deviceSerialNumber ?? '') ?? context.deviceSerialNumber ?? '';

    return formatLinesAsStackedHtml([vehicleDisplay, serialDisplay]);
  }

  private handleError(message: string): void {
    this.notificationService.error(message);
  }
}
