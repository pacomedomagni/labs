import { Component, inject, OnInit, signal } from '@angular/core';
import { TABLE_DIALOG_CONTENT } from 'src/app/shared/components/dialogs/table-dialog/table-dialog.component';
import { DialogSubtitleComponent } from 'src/app/shared/components/layout/dialog-subtitle/dialog-subtitle.component';
import { DialogService } from 'src/app/shared/services/dialogs/primary/dialog.service';
import { HelpText } from 'src/app/shared/help/metadata';
import { WeekdayTripSummaryComponent } from '../weekday-trip-summary/weekday-trip-summary.component';

interface ViewTripsDialogData {
    vehicleDisplay: string;
    participantSeqId: number;
    weekdayTripSummaryVisible: boolean;
}

@Component({
    selector: 'tmx-view-trips-subtitle',
    imports: [DialogSubtitleComponent],
    templateUrl: './view-trips-subtitle.component.html',
    styleUrl: './view-trips-subtitle.component.scss',
})
export class ViewTripsSubtitleComponent implements OnInit {
    private readonly dialogService = inject(DialogService);
    private readonly injectedContent = inject<ViewTripsDialogData>(TABLE_DIALOG_CONTENT, { optional: true });

    vehicleDisplay = signal<string>(null);
    participantSeqId = signal<number>(null);

    weekdayTripSummaryVisible = false;
    ngOnInit(): void {
        if (!this.injectedContent) {
            throw new Error('ViewTripsSubtitleComponent: No injected content found');
        }
        this.vehicleDisplay.set(this.injectedContent.vehicleDisplay);
        this.participantSeqId.set(this.injectedContent.participantSeqId);
        this.weekdayTripSummaryVisible = this.injectedContent.weekdayTripSummaryVisible;
    }
    
    openWeekDayTripSummary(): void {
        this.dialogService.openTableDialog({
            title: 'Weekday Trip Summary',
            subtitle: this.vehicleDisplay(),
            helpKey: HelpText.WeekdayTripSummary,
            component: WeekdayTripSummaryComponent,
            componentData: {
                vehicleDisplay: this.vehicleDisplay(),
                participantSeqId: this.participantSeqId(),
            },
            confirmText: 'Close',
            hideCancelButton: true,
            width: '1000px',
            height: '750px',
        });
    }
}
