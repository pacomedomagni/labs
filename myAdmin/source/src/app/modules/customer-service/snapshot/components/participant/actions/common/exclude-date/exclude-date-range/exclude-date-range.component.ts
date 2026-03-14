import { Component, Inject, Input, OnInit, Optional, ViewChild } from "@angular/core";
import { ExcludedDateRange, ExcludedDateRangeReasonCode } from "@modules/shared/data/resources";

import { MatTable, MatTableDataSource } from "@angular/material/table";
import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { DialogService } from "@modules/shared/services/_index";
import { ParticipantService } from "@modules/customer-service/snapshot/services/_index";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { ExcludeDateRangeEditComponent } from "../exclude-date-range-edit/exclude-date-range-edit.component";

@Component({
    selector: "tmx-snapshot-exclude-date-range",
    templateUrl: "./exclude-date-range.component.html",
    styleUrls: ["./exclude-date-range.component.scss"],
    standalone: false
})
export class ExcludeDateRangeComponent implements OnInit {

	@Input() excludedDates: ExcludedDateRange[];
	@Input() participantId: string;
	@ViewChild(MatTable) table: MatTable<ExcludedDateRange[]>;

	dataSource: MatTableDataSource<ExcludedDateRange>;
	columns: string[] = ["start", "end", "reason", "actions"];
	reasonCodes: ExcludedDateRangeReasonCode[];

	private EXCLUDED_DATE_RANGE_TITLE = "Excluded Date Range";

	constructor(
		@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: any,
		private dialogService: DialogService,
		private participantService: ParticipantService,
		private query: SnapshotPolicyQuery) { }

	ngOnInit(): void {
		this.reasonCodes = this.query.excludedDateRangeReasonCodes;
		this.participantId = this.participantId || this.injectedData.participantId;
		this.excludedDates = this.excludedDates || this.injectedData.excludedDates;
		this.dataSource = new MatTableDataSource<ExcludedDateRange>(this.excludedDates);
	}

	getReasonDisplay(item: ExcludedDateRange): string {
		const reasonCode = item.excludedDateRangeReasonCode;
		if (reasonCode === 0) {
			return item.description;
		}
		return this.reasonCodes?.find(x => x.code === reasonCode)?.description ?? reasonCode.toString();
	}

	addItem(): void {
		this.dialogService.openFormDialog({
			title: `Add ${this.EXCLUDED_DATE_RANGE_TITLE}`,
			component: ExcludeDateRangeEditComponent,
			formModel: {},
			componentData: {
				reasonCodes: this.reasonCodes
			}
		});

		this.dialogService.confirmed<ExcludedDateRange>().subscribe(x => {
			if (x !== undefined) {
				this.participantService.addExcludedDate(this.participantId, x).subscribe(y => {
					this.excludedDates.push(y);
					this.table.renderRows();
				});
			}
		});
	}

	editItem(item: ExcludedDateRange, index: number): void {
		this.dialogService.openFormDialog({
			title: `Edit ${this.EXCLUDED_DATE_RANGE_TITLE}`,
			component: ExcludeDateRangeEditComponent,
			formModel: item,
			componentData: {
				reasonCodes: this.reasonCodes
			}
		});

		this.dialogService.confirmed<ExcludedDateRange>().subscribe(x => {
			if (x !== undefined) {
				this.participantService.updateExcludedDate(this.participantId, x).subscribe(_ => {
					this.excludedDates[index] = x;
					this.table.renderRows();
				});
			}
		});
	}

	deleteItem(obj: ExcludedDateRange): void {
		this.dialogService.openConfirmationDialog({
			title: `Delete ${this.EXCLUDED_DATE_RANGE_TITLE}`,
			message: "Are you sure you want to delete this date range?"
		});

		this.dialogService.confirmed<boolean>().subscribe(confirmed => {
			if (confirmed) {
				this.participantService.deleteExcludedDate(this.participantId, obj.rangeStart).subscribe(_ => {
					this.excludedDates.forEach((item, index) => {
						if (item === obj) {
							this.excludedDates.splice(index, 1);
						}
					});
					this.table.renderRows();
				});
			}
		});
	}

}
