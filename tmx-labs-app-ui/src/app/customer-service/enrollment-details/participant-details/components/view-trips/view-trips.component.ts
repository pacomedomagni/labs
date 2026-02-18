import { Component, OnInit, computed, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewTripTableComponent } from './components/view-trip-table/view-trip-table.component';
import { TripDaySummary } from 'src/app/shared/data/participant/resources';
import { EmptyStateComponent } from '@pgr-cla/core-ui-components';
import { MatPaginator } from '@angular/material/paginator';
import {
    TABLE_DIALOG_CONTENT,
    TABLE_DIALOG_PAGINATOR,
    TABLE_DIALOG_SHOW_PAGINATOR,
} from 'src/app/shared/components/dialogs/table-dialog/table-dialog.component';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { formatLinesAsStackedHtml } from 'src/app/shared/utils/string-utils';
import { TripInsightsComponent } from './components/trip-insights/trip-insights.component';
import { TripMapComponent } from './components/trip-map/trip-map.component';
import { TripClickedEvent } from './components/view-trip-table/models';
import { HelpText } from 'src/app/shared/help/metadata';

interface ViewTripsDialogData {
    trips: TripDaySummary[];
    vehicleDisplay: string;
    weekdayTripSummaryVisible: WritableSignal<boolean>;
    scoringAlgorithmCode: number;
}

@Component({
    selector: 'tmx-view-trips',
    standalone: true,
    imports: [CommonModule, ViewTripTableComponent, EmptyStateComponent],
    templateUrl: './view-trips.component.html',
    styleUrls: ['./view-trips.component.scss'],
})
export class ViewTripsComponent implements OnInit {
    private readonly dialogService = inject(DialogService);
    private readonly injectedContent = inject<ViewTripsDialogData>(TABLE_DIALOG_CONTENT, {
        optional: false,
    });
    // Make this optional to prevent error on initial load. Paginator token is required in dialog but may not be immediately available.
    private readonly injectedPaginator = inject<MatPaginator>(TABLE_DIALOG_PAGINATOR, {
        optional: true,
    });
    private readonly parentShowPaginator = inject(TABLE_DIALOG_SHOW_PAGINATOR, { optional: true });
    private readonly vehicleDisplay = this.injectedContent.vehicleDisplay;

    trips = signal<TripDaySummary[]>([]);

    hasData = computed(() => {
        return this.trips()?.length > 0;
    });

    paginator = computed(() => {
        return this.injectedPaginator;
    });

    ngOnInit(): void {
        if (!this.injectedContent) {
            throw new Error('ViewTripsComponent: No injected content found');
        }
        this.trips.set(this.injectedContent.trips);
        this.parentShowPaginator?.set(this.trips().length > 0);
    }

    openTripMap($event: TripClickedEvent) {
        const formattedDate = new Date($event.dateStart).toLocaleDateString('en-US');
        const startTime = new Date($event.dateStart).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
        const endTime = new Date($event.dateEnd).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
        this.dialogService.openInformationDialog({
            title: 'Trip Route Map',
            subtitle: formatLinesAsStackedHtml(
                [
                    this.vehicleDisplay.toUpperCase(),
                    `Trip taken on ${formattedDate} from ${startTime} to ${endTime}`,
                ],
                'flex flex-col [&>*:nth-child(2)]:text-xl', // Applies smaller text and no caps to 2nd line
            ),
            helpKey: HelpText.TripMap,
            component: TripMapComponent,
            componentData: {
                tripSeqID: $event.tripSeqID,
                scoringAlgorithmCode: this.injectedContent.scoringAlgorithmCode,
            },
            width: '800px',
            height: '800px',
            hideCancelButton: true
        });
    }

    openTripInsights($event: TripClickedEvent) {
        const formattedDate = new Date($event.dateStart).toLocaleDateString('en-US');
        const startTime = new Date($event.dateStart).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
        const endTime = new Date($event.dateEnd).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
        this.dialogService.openTableDialog({
            title: 'Trip Insights',
            subtitle: formatLinesAsStackedHtml(
                [
                    this.vehicleDisplay.toUpperCase(),
                    `Trip taken on ${formattedDate} from ${startTime} to ${endTime}`,
                ],
                'flex flex-col [&>*:nth-child(2)]:text-xl', // Applies smaller text and no caps to 2nd line
            ),
            helpKey: HelpText.TripInsights,
            component: TripInsightsComponent,
            componentData: {
                tripSeqId: $event.tripSeqID,
                speedDistanceUnit: $event.speedDistanceUnit || 'Miles',
                tripStartDateTime: $event.dateStart,
                tripEndDateTime: $event.dateEnd,
            },
            confirmText: 'OK',
            hideCancelButton: true,
            width: '1200px',
            height: '900px',
        });
    }
}
