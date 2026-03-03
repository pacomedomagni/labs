import { AfterViewInit, Component, ElementRef, Inject, Input, OnInit, Optional, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { DeviceExperience } from "@modules/shared/data/enums";
import { ScoringAlgorithmData } from "@modules/shared/data/resources";
import { UIFormats } from "@modules/shared/data/ui-format";
import { isKeyAlphaNumeric, isKeyBackspaceOrDelete } from "@modules/shared/utils/keyboard-utils";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { fromEvent, merge } from "rxjs";
import { debounceTime, distinctUntilChanged, filter, tap } from "rxjs/operators";
import { PolicyHistoryService } from "../../../services/policy-history.service";
import { TripEventDataSource } from "../../../services/trip-event-data-source";

@UntilDestroy()
@Component({
    selector: "tmx-policy-history-trip-event-details",
    templateUrl: "./trip-event-details.component.html",
    styleUrls: ["./trip-event-details.component.scss"],
    standalone: false
})
export class TripEventDetailsComponent implements AfterViewInit, OnInit {

	@Input() searchCriteria: { tripSeqId: number; tripDate: Date; algorithmData: number; experience: DeviceExperience };
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild("input") input: ElementRef;

	formats = UIFormats;
	dataSource: TripEventDataSource;
	columns: string[] = [
		"date",
		"speed",
		"description"
	];

	constructor(
		@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: any,
		private policyHistoryService: PolicyHistoryService
	) { }

	ngOnInit(): void {
		this.searchCriteria = this.searchCriteria || this.injectedData;
		this.dataSource = new TripEventDataSource(this.policyHistoryService);

		this.dataSource.loadData(this.searchCriteria.tripSeqId,
			this.searchCriteria.tripDate,
			this.searchCriteria.algorithmData,
			this.searchCriteria.experience);
	}

	ngAfterViewInit(): void {
		this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
		merge(this.sort.sortChange, this.paginator.page).pipe(tap(() => this.loadData())).subscribe();
		fromEvent(this.input.nativeElement, "keyup")
			.pipe(
				untilDestroyed(this),
				debounceTime(500),
				filter((e: KeyboardEvent) => isKeyAlphaNumeric(e) || isKeyBackspaceOrDelete(e)),
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;
					this.loadData();
				})
			).subscribe();
	}

	private loadData(): void {
		this.dataSource.loadData(
			this.searchCriteria.tripSeqId,
			this.searchCriteria.tripDate,
			this.searchCriteria.algorithmData,
			this.searchCriteria.experience,
			this.paginator.pageIndex,
			this.paginator.pageSize,
			this.sort.direction,
			this.input.nativeElement.value);
	}

	public getCsvFileExport() :void
	{
		this.policyHistoryService.getTripDetailsCsv(this.searchCriteria.tripSeqId,
			this.searchCriteria.tripDate, this.searchCriteria.algorithmData,
			this.searchCriteria.experience, this.paginator.pageIndex, this.paginator.pageSize,"asc",
			this.input.nativeElement.value).subscribe((response: Blob) => {
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
}
