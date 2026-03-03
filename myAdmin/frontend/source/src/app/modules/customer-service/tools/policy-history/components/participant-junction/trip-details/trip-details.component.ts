import { AfterViewInit, Component, Inject, Input, OnInit, Optional, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { DeviceExperience } from "@modules/shared/data/enums";
import { ParticipantDeviceTripEvent, ScoringAlgorithmData, TripSummaryDaily } from "@modules/shared/data/resources";
import { UIFormats } from "@modules/shared/data/ui-format";
import { DialogService } from "@modules/shared/services/dialog-service/dialog.service";
import { getTimeSpanFromSeconds } from "@modules/shared/utils/datetime-utils";
import { CUI_DIALOG_WIDTH } from "@pgr-cla/core-ui-components";
import { PolicyHistoryService } from "../../../services/policy-history.service";
import { TripEventDetailsComponent } from "../trip-event-details/trip-event-details.component";

@Component({
    selector: "tmx-policy-history-trip-details",
    templateUrl: "./trip-details.component.html",
    styleUrls: ["./trip-details.component.scss"],
    standalone: false
})
export class TripDetailsComponent implements AfterViewInit, OnInit {

	@Input() experience: DeviceExperience;
	@Input() algorithmData: ScoringAlgorithmData;
	@Input() trips: TripSummaryDaily[];
	@Input() events: ParticipantDeviceTripEvent[];
	@Input() currentJunction: any;
	@Input() id: number;

	@ViewChild("summaryPaginator") summaryPaginator: MatPaginator;
	@ViewChild("eventsPaginator") eventsPaginator: MatPaginator;
	@ViewChild("summarySort") summarySort: MatSort;
	@ViewChild("eventsSort") eventsSort: MatSort;

	summaryDataSource: MatTableDataSource<TripSummaryDaily>;
	eventsDataSource: MatTableDataSource<ParticipantDeviceTripEvent>;

	summaryColumns: string[] = ["seqId", "tripDate", "end", "duration", "mileage", "hb", "ha", "hrs"];
	eventColumns: string[] = ["seqId", "eventTime", "desc", "code", "protoCode", "vin", "odometer", "create"];

	formats = UIFormats;
	isMobile = false;

	constructor(
		@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: any,
		private dialogService: DialogService, private policyHistoryService: PolicyHistoryService) { }

	ngOnInit(): void {
		this.trips = this.trips || this.injectedData.trips;
		this.events = this.events || this.injectedData.events;
		this.experience = this.experience || this.injectedData.experience;
		this.algorithmData = this.algorithmData || this.injectedData.algorithmData.code;
		this.currentJunction = this.currentJunction || this.injectedData.currentJunction;
		this.id = this.id || this.injectedData.id;

		if (this.experience === DeviceExperience.Mobile) {
			this.summaryColumns.push(...["appHandsFree", "appInHand", "phoneHandsFree", "phoneInHand"]);
			this.isMobile = true;
		}

		this.summaryDataSource = new MatTableDataSource<TripSummaryDaily>(this.trips);
		this.eventsDataSource = new MatTableDataSource<ParticipantDeviceTripEvent>(this.events);
	}

	ngAfterViewInit(): void {
		this.summaryDataSource.paginator = this.summaryPaginator;
		this.eventsDataSource.paginator = this.eventsPaginator;
		this.summaryDataSource.sort = this.summarySort;
		this.eventsDataSource.sort = this.eventsSort;
	}

	getHHMMSSDisplay(totalSeconds: number = 0): string {
		if (totalSeconds === 0) {
			return "";
		}
		else {
			const ts = getTimeSpanFromSeconds(totalSeconds);
			return ts.hours.toString().padStart(2, "0") + ":" +
				ts.minutes.toString().padStart(2, "0") + ":" +
				ts.seconds.toString().padStart(2, "0");
		}
	}

	public getTripSummaryCsvFileExport() :void
	{
		this.policyHistoryService.getTripSummaryFile(this.currentJunction).subscribe((response: Blob) => {
			const blob = new Blob([response], { type: "application/octet-stream" });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "TripEventDetails.csv";
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		});
	}

	public getDeviceEventsCsvFileExport() :void
	{
		this.policyHistoryService.getParticipantDeviceEventsFile(this.id).subscribe((response: Blob) => {
			const blob = new Blob([response], { type: "application/octet-stream" });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = this.id.toString() + "_DeviceDetails.csv";
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		});
	}

	openTripDetails(trip: TripSummaryDaily): void {
		this.dialogService.openInformationDialog({
			title: "Trip Events",
			subtitle: `Trip Seq ID: ${trip.seqId}`,
			component: TripEventDetailsComponent,
			componentData: {
				tripSeqId: trip.seqId,
				tripDate: trip.tripDate,
				algorithmData: this.algorithmData,
				experience: this.experience
			},
			width: CUI_DIALOG_WIDTH.LARGE
		});
	}
}
