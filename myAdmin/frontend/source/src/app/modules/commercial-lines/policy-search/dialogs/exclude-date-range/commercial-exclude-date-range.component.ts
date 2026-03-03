import { Component, Inject, Input, OnInit, Optional, ViewChild } from "@angular/core";
import { ExcludedDateRange, ExcludedDateRangeReasonCode } from "@modules/shared/data/resources";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { DialogService } from "@modules/shared/services/_index";
import { CommercialParticipantService } from "../../services/participant.service";
import { CommercialPolicyQuery } from "../../stores/comm-policy-query";
import { ClExcludeDateRangeEditComponent } from "../exclude-date-range-edit/commercial-exclude-date-range-edit.component";

@Component({
    selector: "tmx-commercial-exclude-date-range",
    templateUrl: "./commercial-exclude-date-range.component.html",
    styleUrls: ["./commercial-exclude-date-range.component.scss"],
    standalone: false
})
export class ClExcludeDateRangeComponent implements OnInit {

	@Input() excludedDates: ExcludedDateRange[];
	@Input() participantSeqId: number;
	@ViewChild(MatTable) table: MatTable<ExcludedDateRange[]>;

	dataSource: MatTableDataSource<ExcludedDateRange>;
	columns: string[] = ["start", "end", "reason", "actions"];
	reasonCodes: ExcludedDateRangeReasonCode[];

	private EXCLUDED_DATE_RANGE_TITLE = "Excluded Date Range";

	constructor(
		@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: any,
		private dialogService: DialogService,
		private participantService: CommercialParticipantService,
		private query: CommercialPolicyQuery) { }

	ngOnInit(): void {
		this.reasonCodes = this.query.excludedDateRangeReasonCodes;
		this.participantSeqId = this.participantSeqId || this.injectedData.participantSeqId;
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
			component: ClExcludeDateRangeEditComponent,
			formModel: {},
			componentData: {
				reasonCodes: this.reasonCodes,
				participantSeqId: this.participantSeqId
			}
		});

		this.dialogService.confirmed<ExcludedDateRange>().subscribe(x => {
			if (x !== undefined) {
				x.description = this.reasonCodes.find(r => r.code === x.excludedDateRangeReasonCode).description;
				this.participantService.addExcludedDate(this.participantSeqId, x).subscribe(y => {
					this.excludedDates.push(y);
					this.table.renderRows();
				});
			}
		});
	}

	editItem(item: ExcludedDateRange, index: number): void {
		this.dialogService.openFormDialog({
			title: `Edit ${this.EXCLUDED_DATE_RANGE_TITLE}`,
			component: ClExcludeDateRangeEditComponent,
			formModel: item,
			componentData: {
				reasonCodes: this.reasonCodes,
				participantSeqId: this.participantSeqId
			}
		});

		this.dialogService.confirmed<ExcludedDateRange>().subscribe(x => {
			if (x !== undefined) {
				x.description = this.reasonCodes.find(r => r.code === x.excludedDateRangeReasonCode).description;
				this.participantService.updateExcludedDate(this.participantSeqId, x).subscribe(_ => {
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
				this.participantService.deleteExcludedDate(this.participantSeqId, obj.rangeStart).subscribe(_ => {
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
