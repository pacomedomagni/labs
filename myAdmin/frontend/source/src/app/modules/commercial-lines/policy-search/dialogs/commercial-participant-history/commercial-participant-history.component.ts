import { Component, Inject, Input, OnInit, Optional, ViewChild } from "@angular/core";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { fromMatPaginator, fromMatSort, paginateRows, sortRows } from "@modules/shared/utils/datasource-utils";
import { DialogService } from "@modules/shared/services/_index";
import { EnumService } from "@modules/shared/services/enum-service/enum.service";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { MatSort, Sort } from "@angular/material/sort";
import { UIFormats } from "@modules/shared/data/ui-format";
import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { MatDialogRef } from "@angular/material/dialog";
import { UntilDestroy } from "@ngneat/until-destroy";
import { CommercialTrips, CommercialParticipantJunction } from "@modules/shared/data/resources";
import { CommercialParticipantService } from "../../services/participant.service";
import { getTripDurationDisplay } from "@modules/shared/utils/datetime-utils";
import { TimeSpan } from "@modules/shared/data/resources";

@UntilDestroy()
@Component({
    selector: "tmx-commercial-participant-history",
    templateUrl: "./commercial-participant-history.component.html",
    styleUrls: ["./commercial-participant-history.component.scss"],
    standalone: false
})
export class ClParticipantHistoryComponent implements OnInit {
	displayedColumns = ["startDate", "endDate", "duration", "distance", "hardBreaks", "excluded"];
	@Input() participantSeqId: number;
	data$: BehaviorSubject<CommercialTrips[]> = new BehaviorSubject<CommercialTrips[]>(null);

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;

	totalRows$: Observable<number>;
	displayedRows$: Observable<CommercialTrips[]>;
	formats = UIFormats;

	constructor(
		@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: any,
		public dialog: MatDialogRef<ClParticipantHistoryComponent>,
		public enums: EnumService,
		private dialogService: DialogService,
		private commercialParticipantService: CommercialParticipantService) {
		this.participantSeqId = this.participantSeqId || this.injectedData;
		this.dialog = dialog;

	}

	ngOnInit(): void {
		this.commercialParticipantService.getHistory(this.participantSeqId).subscribe(
			d => {
				console.log(d);
				this.data$.next(d);
				const pageEvents$: Observable<PageEvent> = fromMatPaginator(this.paginator);
				const sortEvents$: Observable<Sort> = fromMatSort(this.sort);
				this.totalRows$ = this.data$.asObservable().pipe(map(x => x.length));
				this.displayedRows$ = this.data$.pipe(sortRows(sortEvents$), paginateRows(pageEvents$));
			}
		);
	}

	getTripDurationDisplay(tripDuration: TimeSpan): string {
		return getTripDurationDisplay(tripDuration);
	}

	async openDeviceDetails(junctionData: CommercialParticipantJunction): Promise<void> {

		(await this.commercialParticipantService.getHistory(junctionData.participantSeqId)).subscribe(x => {

		});

	}
}
