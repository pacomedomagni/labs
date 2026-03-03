import { Component, Inject, Input, OnInit, Optional, ViewChild } from "@angular/core";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { CommercialParticipantJunction, EventPairs } from "@modules/shared/data/resources";
import { DialogService, EnumService } from "@modules/shared/services/_index";
import { fromMatPaginator, fromMatSort, paginateRows, sortRows } from "@modules/shared/utils/datasource-utils";
import { BehaviorSubject, Observable, map } from "rxjs";
import { MatDialogRef } from "@angular/material/dialog";
import { UIFormats } from "@modules/shared/data/ui-format";
import { CommercialParticipantService } from "../../services/participant.service";
import { CommercialPolicyService } from "../../services/comm-policy.service";

@Component({
    selector: "tmx-commercial-connection-timeline",
    templateUrl: "./commercial-connection-timeline.component.html",
    styleUrls: ["./commercial-connection-timeline.component.scss"],
    standalone: false
})
export class ClConnectionTimelineComponent implements OnInit {

	@Input() participant: CommercialParticipantJunction;
	@Input() policyNumber: string;
	data$: BehaviorSubject<EventPairs[]> = new BehaviorSubject<EventPairs[]>(null);

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;

	totalRows$: Observable<number>;
	displayedRows$: Observable<EventPairs[]>;
	formats = UIFormats;

	constructor(
		@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: any,
		public dialog: MatDialogRef<ClConnectionTimelineComponent>,
		public enums: EnumService,
		private dialogService: DialogService,
		private commercialParticipantService: CommercialParticipantService,
		private commercialPolicyService: CommercialPolicyService
	) {
		this.participant = this.participant || this.injectedData.participant;
		this.policyNumber = this.policyNumber || this.injectedData.policyNumber;
		this.dialog = dialog;

	}

	ngOnInit(): void {
		this.commercialPolicyService.connectionTimeline(this.policyNumber, this.participant).subscribe(
			d => {
				this.data$.next(d.eventPairs);
				const pageEvents$: Observable<PageEvent> = fromMatPaginator(this.paginator);
				const sortEvents$: Observable<Sort> = fromMatSort(this.sort);
				this.totalRows$ = this.data$.asObservable().pipe(map(x => x.length));
				this.displayedRows$ = this.data$.pipe(sortRows(sortEvents$), paginateRows(pageEvents$));
			}
		);
	}

	async openDeviceDetails(junctionData: CommercialParticipantJunction): Promise<void> {

		(await this.commercialParticipantService.getHistory(junctionData.participantSeqId)).subscribe(x => {

		});

	}
}
