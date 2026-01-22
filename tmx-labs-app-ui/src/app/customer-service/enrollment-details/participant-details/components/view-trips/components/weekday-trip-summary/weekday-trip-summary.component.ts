import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
    TABLE_DIALOG_CONTENT,
    TABLE_DIALOG_SHOW_PAGINATOR,
} from 'src/app/shared/components/dialogs/table-dialog/table-dialog.component';
import { TripsService } from 'src/app/shared/services/api/trips/trips.service';
import { DayOfWeekTripSummary } from 'src/app/shared/data/participant/resources';
import { EmptyStateComponent } from '@pgr-cla/core-ui-components';
import { catchError, of } from 'rxjs';

interface WeekdayTripSummaryData {
    vehicleDisplay: string;
    participantSeqId: number;
}

@Component({
    selector: 'tmx-weekday-trip-summary',
    standalone: true,
    imports: [CommonModule, MatTableModule, EmptyStateComponent, DecimalPipe],
    templateUrl: './weekday-trip-summary.component.html',
    styleUrls: ['./weekday-trip-summary.component.scss'],
})
export class WeekdayTripSummaryComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly tripsService = inject(TripsService);
    private readonly injectedData = inject<WeekdayTripSummaryData>(TABLE_DIALOG_CONTENT, {
        optional: true,
    });
    private readonly paginatorVisibility = inject(TABLE_DIALOG_SHOW_PAGINATOR, { optional: true });

    weekdaySummary = signal<DayOfWeekTripSummary[]>([]);
    dataSource = computed(() => new MatTableDataSource(this.weekdaySummary()));

    columnsToDisplay = [
        'dayOfWeek',
        'trips',
        'duration',
        'mileage',
        'hardBrakes',
        'hardAccels',
        'highRiskSeconds',
    ];

    hasData = computed(() => {
        return this.weekdaySummary()?.length > 0;
    });

    totals = computed(() => {
        const data = this.weekdaySummary();
        return {
            trips: data.reduce((sum, item) => sum + (item.trips || 0), 0),
            durationSeconds: data.reduce(
                (sum, item) => sum + (item.duration?.totalSeconds || 0),
                0,
            ),
            mileage: data.reduce((sum, item) => sum + (item.mileage || 0), 0),
            hardBrakes: data.reduce((sum, item) => sum + (item.hardBrakes || 0), 0),
            hardAccels: data.reduce((sum, item) => sum + (item.hardAccels || 0), 0),
            highRiskSeconds: data.reduce((sum, item) => sum + (item.highRiskSeconds || 0), 0),
        };
    });

    formattedDuration = (duration: DayOfWeekTripSummary['duration'] | null | undefined): string => {
        if (!duration) return '00:00:00';
        const totalSeconds = duration.totalSeconds || 0;
        return this.formatDurationFromSeconds(totalSeconds);
    };

    formattedTotalDuration = computed(() => {
        const totalSeconds = this.totals().durationSeconds;
        return this.formatDurationFromSeconds(totalSeconds);
    });

    get vehicleDisplay(): string {
        return this.injectedData?.vehicleDisplay || '';
    }

    ngOnInit(): void {
        if (!this.injectedData?.participantSeqId) {
            console.error('WeekdayTripSummaryComponent: No participantSeqId found');
            this.weekdaySummary.set([]);
            return;
        }
        if (this.paginatorVisibility) {
            this.paginatorVisibility.set(false);
        }
        this.loadWeekdaySummary(this.injectedData.participantSeqId);
    }

    private loadWeekdaySummary(participantSeqId: number): void {
        this.tripsService
            .getWeekdayTripSummary(participantSeqId)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                catchError(() => {
                    return of([]);
                }),
            )
            .subscribe((response) => {
                this.weekdaySummary.set(response);
            });
    }

    private formatDurationFromSeconds(totalSeconds: number): string {
        const hours = Math.floor(totalSeconds / WeekdayTripSummaryComponent.SECONDS_PER_HOUR);
        const minutes = Math.floor(
            (totalSeconds % WeekdayTripSummaryComponent.SECONDS_PER_HOUR) /
                WeekdayTripSummaryComponent.SECONDS_PER_MINUTE,
        );
        const seconds = Math.round(totalSeconds % WeekdayTripSummaryComponent.SECONDS_PER_MINUTE);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    private static readonly SECONDS_PER_HOUR = 3600;
    private static readonly SECONDS_PER_MINUTE = 60;
}
