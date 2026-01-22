import { Injectable, inject } from '@angular/core';
import { CUI_DIALOG_WIDTH} from '@pgr-cla/core-ui-components';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import type {
    EditNicknameDialogData,
    EditNicknameFormModel,
} from '../../components/edit-nickname/edit-nickname.component';
import { UpdateParticipantNicknameRequest, UpdateParticipantNicknameResponse } from 'src/app/shared/data/participant/resources';
import { MessageCode } from 'src/app/shared/data/application/enums';
import { HelpText } from 'src/app/shared/help/metadata';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { ParticipantService } from 'src/app/shared/services/api/participant/participant.service';
import { ResourceMessageService } from 'src/app/shared/services/resources/resource-message.service';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';


export interface ParticipantNicknameDialogContext {
    participantSeqId: number;
    currentNickname: string | null;
    defaultNickname: string | null;
}

interface NicknameOutcome {
    success: boolean;
    nickname: string;
    successMessage?: string;
    errorMessage?: string;
}

@Injectable({ providedIn: 'root' })
export class ParticipantNicknameService {
    private readonly dialogService = inject(DialogService);
    private readonly participantService = inject(ParticipantService);
    private readonly notificationBannerService = inject(NotificationBannerService);
    private readonly resourceMessageService = inject(ResourceMessageService);

    openEditNicknameDialog(context: ParticipantNicknameDialogContext): Observable<string | null> {
        if (!context.participantSeqId) {
            return of(null);
        }

        return from(import('../../components/edit-nickname/edit-nickname.component')).pipe(
            switchMap((module) => {
                const componentData: EditNicknameDialogData = {
                    currentNickname: context.currentNickname,
                    defaultNickname: context.defaultNickname,
                    maxLength: 50,
                };

                const dialogRef = this.dialogService.openFormDialog<typeof module.EditNicknameComponent, EditNicknameFormModel>({
                    title: 'Edit Nickname',
                    component: module.EditNicknameComponent,
                    formModel: { newNickname: '' } satisfies EditNicknameFormModel,
                    componentData,
                    width: CUI_DIALOG_WIDTH.SMALL,
                    helpKey: HelpText.EditNickname,
                    confirmText: 'UPDATE',
                    subtitle: this.buildNicknameSubtitle(componentData),
                });

                return dialogRef.afterClosed().pipe(
                    take(1),
                    switchMap((result: EditNicknameFormModel | undefined) => {
                        const trimmedNickname = result?.newNickname?.trim() ?? '';
                        if (!trimmedNickname) {
                            return of(null);
                        }

                        const request: UpdateParticipantNicknameRequest = {
                            participantSeqID: context.participantSeqId,
                            nickname: trimmedNickname,
                        };

                        return this.participantService.updateParticipantNickname(request).pipe(
                            map((response) => this.evaluateNicknameResponse(response, trimmedNickname)),
                            tap((outcome) => {
                                if (!outcome.success) {
                                    this.notificationBannerService.error(
                                        outcome.errorMessage ?? 'Edit Nickname Failed',
                                    );
                                } else {
                                    this.notificationBannerService.success(
                                        outcome.successMessage ?? 'Edit Nickname Successful',
                                    );
                                }
                            }),
                            map((outcome) => (outcome.success ? outcome.nickname : null)),
                            catchError(() => {
                                this.notificationBannerService.error('Edit Nickname Failed');
                                return of(null);
                            }),
                        );
                    }),
                );
            }),
            catchError(() => {
                this.notificationBannerService.error('Edit Nickname Failed');
                return of(null);
            }),
        );
    }

    private evaluateNicknameResponse(
        response: UpdateParticipantNicknameResponse | null | undefined,
        requestedNickname: string,
    ): NicknameOutcome {
        const errorMessage = this.resourceMessageService.getFirstString(response?.messages, [
            MessageCode.ErrorCode,
            MessageCode.Error,
            MessageCode.ErrorDetails,
        ]);

        if (errorMessage) {
            return {
                success: false,
                nickname: requestedNickname,
                errorMessage,
            };
        }

        const resolvedNickname = response?.participant?.nickname ?? requestedNickname;

        const successMessage = this.resourceMessageService.getString(
            response?.messages,
            MessageCode.StatusDescription,
        );

        return {
            success: true,
            nickname: resolvedNickname,
            successMessage: successMessage ?? undefined,
        };
    }

    private buildNicknameSubtitle(data: EditNicknameDialogData): string {
        const resolved =
            this.normalizeNickname(data.currentNickname) ??
            this.normalizeNickname(data.defaultNickname) ??
            '--';
        const escaped = this.escapeHtml(resolved);
        return `<span aria-live="polite">${escaped.toUpperCase()}</span>`;
    }

    private normalizeNickname(value?: string | null): string | null {
        if (value === undefined || value === null) {
            return null;
        }

        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    private escapeHtml(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
