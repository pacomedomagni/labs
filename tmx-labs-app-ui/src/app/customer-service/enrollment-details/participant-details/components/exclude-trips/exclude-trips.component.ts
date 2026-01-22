import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationBannerService } from 'src/app/shared/notifications/notification-banner/notification-banner.service';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { HelpText } from 'src/app/shared/help/metadata';
import { ExcludedDateRange } from 'src/app/shared/data/participant/resources';
import { ExcludedDateRangeService, ExcludedDateRangeUpdateCommand } from 'src/app/shared/services/api/excluded-date-range.service';
import type { ExcludeTripsFormModel } from './components/exclude-trips-form/exclude-trips-form.component';
import {
    TABLE_DIALOG_CONTENT,
    TABLE_DIALOG_SHOW_PAGINATOR,
    TABLE_DIALOG_CONFIRM_DISABLED,
} from 'src/app/shared/components/dialogs/table-dialog/table-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SpinnerComponent } from 'src/app/shared/components/spinner/spinner.component';

interface ExcludeTripsDialogData {
    participantSeqId: number;
    vehicleDisplay: string;
}

interface ExcludeTripsRow {
    status: 'Active' | 'Upcoming' | 'Expired';
    rangeStart: Date;
    rangeEnd: Date;
    createDate: Date;
    original: ExcludedDateRange;
}

@Component({
    selector: 'tmx-exclude-trips',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        DatePipe,
        SpinnerComponent,
    ],
    templateUrl: './exclude-trips.component.html',
    styleUrls: ['./exclude-trips.component.scss'],
})
export class ExcludeTripsComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly dialogService = inject(DialogService);
    private readonly excludedDateRangeService = inject(ExcludedDateRangeService);
    private readonly notificationService = inject(NotificationBannerService);
    private readonly injectedContent = inject<ExcludeTripsDialogData>(TABLE_DIALOG_CONTENT, {
        optional: false,
    });
    private readonly parentShowPaginator = inject(TABLE_DIALOG_SHOW_PAGINATOR, {
        optional: true,
    });
    private readonly confirmDisabled = inject(TABLE_DIALOG_CONFIRM_DISABLED, {
        optional: true,
    });

    dataSource = new MatTableDataSource<ExcludeTripsRow>([]);
    displayedColumns = ['rangeStart', 'rangeEnd', 'actions'];

    readonly rows = signal<ExcludeTripsRow[]>([]);
    readonly isLoading = signal<boolean>(false);

    readonly hasData = computed(() => this.rows().length > 0);

    ngOnInit(): void {
        if (!this.injectedContent) {
            throw new Error('ExcludeTripsComponent: dialog content not provided.');
        }

        this.parentShowPaginator?.set(false);
        this.updateConfirmState(false);

        this.loadRanges();
    }

    onAddRange(): void {
        this.openRangeDialog('create');
    }

    onEditRange(row: ExcludeTripsRow): void {
        this.openRangeDialog('edit', row);
    }

    onDeleteRange(row: ExcludeTripsRow): void {
        this.dialogService
            .openConfirmationDialog({
                title: 'Delete Excluded Date Range',
                subtitle: this.injectedContent.vehicleDisplay,
                message: 'Are you sure you want to delete this date range?',
                confirmText: 'YES',
                cancelText: 'CANCEL',
            })
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((confirmed) => {
                if (!confirmed) {
                    return;
                }

                this.deleteRange(row);
            });
    }

    private loadRanges(): void {
        const participantSeqId = this.injectedContent.participantSeqId;
        this.isLoading.set(true);

        this.excludedDateRangeService
            .getExcludedDateRanges(participantSeqId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (ranges) => {
                    const mapped = (ranges ?? []).map((range) => this.mapToRow(range));
                    this.rows.set(mapped);
                    this.dataSource.data = mapped;
                    this.updateConfirmState(mapped.length > 0);
                    this.isLoading.set(false);
                },
                error: (error) => {
                    console.error('Failed to load excluded date ranges', error);
                    this.notificationService.error('Unable to load excluded date ranges.');
                    this.rows.set([]);
                    this.dataSource.data = [];
                    this.updateConfirmState(false);
                    this.isLoading.set(false);
                },
            });
    }

    private mapToRow(range: ExcludedDateRange): ExcludeTripsRow {
        const rangeStart = new Date(range.rangeStart);
        const rangeEnd = new Date(range.rangeEnd);
        const createDate = new Date(range.createDate);

        return {
            status: this.resolveStatus(rangeStart, rangeEnd),
            rangeStart,
            rangeEnd,
            createDate,
            original: range,
        };
    }

    private resolveStatus(rangeStart: Date, rangeEnd: Date): 'Active' | 'Upcoming' | 'Expired' {
        const today = this.startOfDay(new Date());
        const start = this.startOfDay(rangeStart);
        const end = this.startOfDay(rangeEnd);

        if (start <= today && today <= end) {
            return 'Active';
        }

        if (today < start) {
            return 'Upcoming';
        }

        return 'Expired';
    }

    private startOfDay(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    private async openRangeDialog(mode: 'create' | 'edit', row?: ExcludeTripsRow): Promise<void> {
        const formModule = await import('./components/exclude-trips-form/exclude-trips-form.component');

        const initialModel: ExcludeTripsFormModel = {
            rangeStart: row ? row.original.rangeStart : '',
            rangeEnd: row ? row.original.rangeEnd : '',
        };

        const dialogRef = this.dialogService.openFormDialog<typeof formModule.ExcludeTripsFormComponent, ExcludeTripsFormModel>({
            title: mode === 'edit' ? 'Edit Excluded Date Range' : 'Add Excluded Date Range',
            subtitle: this.injectedContent.vehicleDisplay,
            component: formModule.ExcludeTripsFormComponent,
            componentData: {
                mode,
                existingRanges: this.rows().map((item) => ({
                    rangeStart: item.original.rangeStart,
                    rangeEnd: item.original.rangeEnd,
                })),
                originalRangeStart: row?.original.rangeStart,
            },
            formModel: initialModel,
            confirmText: 'OK',
            cancelText: 'CANCEL',
            helpKey: HelpText.ExcludeTrips,
            width: '520px',
        });

        dialogRef
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((result) => {
                if (!result) {
                    return;
                }

                if (mode === 'edit' && row) {
                    this.updateRange(result, row);
                } else {
                    this.createRange(result);
                }
            });
    }

    private createRange(form: ExcludeTripsFormModel): void {
        const participantSeqId = this.injectedContent.participantSeqId;
        if (this.hasOverlap(form.rangeStart, form.rangeEnd)) {
            this.notificationService.error('Selected date range overlaps with an existing exclusion.');
            return;
        }

        this.excludedDateRangeService
            .createExcludedDateRange(participantSeqId, form.rangeStart, form.rangeEnd, undefined)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.notificationService.success('Excluded date range added.');
                    this.loadRanges();
                },
                error: (error) => {
                    console.error('Failed to create excluded date range', error);
                    const message = this.extractErrorMessage(error) ?? 'Unable to add excluded date range.';
                    this.notificationService.error(message);
                },
            });
    }

    private updateRange(
        form: ExcludeTripsFormModel,
        row: ExcludeTripsRow,
    ): void {
        const participantSeqId = this.injectedContent.participantSeqId;
        const description = this.normalizeDescription(row.original.description);

        if (this.hasOverlap(form.rangeStart, form.rangeEnd, row.original.rangeStart)) {
            this.notificationService.error('Selected date range overlaps with an existing exclusion.');
            return;
        }

        const payload: ExcludedDateRangeUpdateCommand = {
            participantSeqId,
            rangeStart: form.rangeStart,
            rangeEnd: form.rangeEnd,
            description,
            originalRangeStart: row.original.rangeStart,
        };

        this.excludedDateRangeService
            .updateExcludedDateRange(payload)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.notificationService.success('Excluded date range updated.');
                    this.loadRanges();
                },
                error: (error) => {
                    console.error('Failed to update excluded date range', error);
                    const message = this.extractErrorMessage(error) ?? 'Unable to update excluded date range.';
                    this.notificationService.error(message);
                },
            });
    }

    private deleteRange(row: ExcludeTripsRow): void {
        const participantSeqId = this.injectedContent.participantSeqId;
        const rangeStart = row.original.rangeStart;

        this.excludedDateRangeService
            .deleteExcludedDateRange(participantSeqId, rangeStart)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.notificationService.success('Excluded date range removed.');
                    this.loadRanges();
                },
                error: (error) => {
                    console.error('Failed to delete excluded date range', error);
                    const message = this.extractErrorMessage(error) ?? 'Unable to remove excluded date range.';
                    this.notificationService.error(message);
                },
            });
    }

    private normalizeDescription(description: string | undefined | null): string | undefined {
        if (!description) {
            return undefined;
        }

        const trimmed = description.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }

    private hasOverlap(rangeStart: string, rangeEnd: string, skipOriginal?: string): boolean {
        if (!rangeStart || !rangeEnd) {
            return false;
        }

        const newStart = new Date(rangeStart).getTime();
        const newEnd = new Date(rangeEnd).getTime();

        return this.rows().some((existing) => {
            if (skipOriginal && existing.original.rangeStart === skipOriginal) {
                return false;
            }

            const existingStart = new Date(existing.original.rangeStart).getTime();
            const existingEnd = new Date(existing.original.rangeEnd).getTime();

            return newStart <= existingEnd && newEnd >= existingStart;
        });
    }

    private updateConfirmState(hasRows: boolean): void {
        this.confirmDisabled?.set(!hasRows);
    }

    private extractErrorMessage(error: unknown): string | null {
        if (!error || typeof error !== 'object') {
            return null;
        }

        const message = (error as { error?: { message?: string; title?: string } }).error;
        if (typeof message?.message === 'string') {
            return message.message;
        }

        if (typeof message?.title === 'string') {
            return message.title;
        }

        return null;
    }
}
