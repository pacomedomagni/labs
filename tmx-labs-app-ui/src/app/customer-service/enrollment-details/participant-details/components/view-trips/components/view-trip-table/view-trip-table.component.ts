import { Component, effect, EventEmitter, inject, input, Output } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, DatePipe } from '@angular/common';
import { TripDaySummary, Trip } from 'src/app/shared/data/participant/resources';
import { MatPaginator } from '@angular/material/paginator';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { TripClickedEvent } from './models';

@Component({
    selector: 'tmx-view-trip-table',
    imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, DatePipe],
    templateUrl: './view-trip-table.component.html',
    styleUrl: './view-trip-table.component.scss',
})
export class ViewTripTableComponent {
    dialogService = inject(DialogService);
    data = input<TripDaySummary[]>([]);
    speedDistanceUnit = input<string>('Miles');
    dataSource = new MatTableDataSource<TripDaySummary>([]);
    @Output()
    dateRangeClicked = new EventEmitter<TripClickedEvent>();

    @Output()
    mapClicked = new EventEmitter<TripClickedEvent>();
    columnsToDisplay = [
        'date',
        'trips',
        'duration',
        'mileage',
        'hardBrakes',
        'hardAccels',
        'highRiskSeconds',
        'dummyCol',
    ];
    columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
    expandedElement: TripDaySummary | null = null;

    paginator = input<MatPaginator>();

    constructor() {
        effect(() => {
            this.dataSource.data = this.data();
            const paginator = this.paginator();
            if (paginator) {
                this.dataSource.paginator = paginator;
            }
        });
    }

    /** Checks whether an element is expanded. */
    isExpanded(element: TripDaySummary): boolean {
        return this.expandedElement === element;
    }

    /** Toggles the expanded state of an element. */
    toggle(element: TripDaySummary): void {
        this.expandedElement = this.isExpanded(element) ? null : element;
    }

    dateRangeClick(trip: Trip): void {
        this.dateRangeClicked.emit({tripSeqID: trip.tripSeqID, dateStart: trip.tripStartDateTime, dateEnd: trip.tripEndDateTime, speedDistanceUnit: this.speedDistanceUnit() });
    }

    mapClick(trip: Trip): void {
        this.mapClicked.emit({tripSeqID: trip.tripSeqID, dateStart: trip.tripStartDateTime, dateEnd: trip.tripEndDateTime, speedDistanceUnit: this.speedDistanceUnit() });
    }
    
    /** Formats the trip time range from start to end */
    formatTripTimeRange(trip: Trip): string {
        if (!trip.tripStartDateTime || !trip.tripEndDateTime) {
            return 'N/A';
        }

        const startTime = new Date(trip.tripStartDateTime);
        const endTime = new Date(trip.tripEndDateTime);

        const formatTime = (date: Date) => {
            return date
                .toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                })
                .toLowerCase();
        };

        return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    }
}
