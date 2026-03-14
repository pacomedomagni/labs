import { Component, Inject, Input, OnInit, Optional, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material/sort";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { ParticipantService } from "@modules/customer-service/snapshot/services/_index";
import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { OptOutSuspension, Participant } from "@modules/shared/data/resources";
import { DialogService, EnumService, LabelService } from "@modules/shared/services/_index";
import { getToday } from "@modules/shared/utils/datetime-utils";
import { OptOutSuspensionEditComponent } from "../opt-out-suspension-edit/opt-out-suspension-edit.component";

@Component({
    selector: "tmx-snapshot-opt-out-suspension",
    templateUrl: "./opt-out-suspension.component.html",
    styleUrls: ["./opt-out-suspension.component.scss"],
    standalone: false
})
export class OptOutSuspensionComponent implements OnInit {

	@Input() suspensions: OptOutSuspension[];
	@Input() participant: Participant;
	@ViewChild(MatTable) table: MatTable<OptOutSuspension[]>;
	@ViewChild(MatSort) sort: MatSort;

	dataSource: MatTableDataSource<OptOutSuspension>;
	columns: string[] = ["start", "end", "device", "canceled", "returned", "user"];

	private today: Date = getToday();

	constructor(
		@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: any,
		private dialogService: DialogService,
		public enums: EnumService,
		private participantService: ParticipantService, private labelService: LabelService) { }

	ngOnInit(): void {
		this.participant = this.participant || this.injectedData.participant;
		this.suspensions = this.suspensions || this.injectedData.suspensions;
		this.dataSource = new MatTableDataSource<OptOutSuspension>(this.suspensions);
	}

	addItem(): void {
		this.dialogService.openFormDialog({
			title: "Add Suspension",
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			component: OptOutSuspensionEditComponent,
			formModel: {}
		});

		this.dialogService.confirmed<OptOutSuspension>().subscribe(x => {
			if (x !== undefined) {
				x.deviceSeqId = this.participant.mobileDeviceDetails?.deviceSeqId ?? this.participant.pluginDeviceDetails?.deviceSeqId;
				x.deviceSerialNumber = this.participant.mobileDeviceDetails?.deviceIdentifier ?? this.participant.pluginDeviceDetails?.deviceSerialNumber;

				this.participantService.addOptOutSuspension({ participantSeqId: this.participant.snapshotDetails.participantSeqId, ...x }).subscribe(y => {
					x.seqId = y;
					this.suspensions.push(x);
					this.suspensions = this.sortByDate(this.suspensions);
					// programatically trigger sort after each item is added
					this.dataSource = new MatTableDataSource<OptOutSuspension>(this.suspensions);

					this.table.renderRows();
				});
			}
		});
	}

	public shouldDisableCancelButton(): boolean {

		let shouldDisableCancelButton = true;

		this.suspensions.forEach(x => {
			if (!x.isCancelled && x.endDate > this.today) {
				shouldDisableCancelButton = false;
			}
		});

		return shouldDisableCancelButton;
	}

	private getTime(date?: Date): number {
		return date != null ? date.getTime() : 0;
	}

	public sortByDate(array: OptOutSuspension[]): OptOutSuspension[] {
		return array.sort((a: OptOutSuspension, b: OptOutSuspension) => this.getTime(b.endDate) - this.getTime(a.endDate));
	}

	deleteItem(): void {
		this.dialogService.openConfirmationDialog({
			title: "Cancel Suspension(s)",
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			message: "Are you sure you want to cancel all active and pending suspension(s)?"
		});

		this.dialogService.confirmed<boolean>().subscribe(confirmed => {
			if (confirmed) {

				this.participantService.cancelOptOutSuspension(this.suspensions.filter(x => x.endDate > this.today && !x.isCancelled)).subscribe(() => {
					this.suspensions.filter(x => x.endDate > this.today && !x.isCancelled).forEach(x => x.isCancelled = true);
					this.table.renderRows();
				});
			}
		});
	}

}
