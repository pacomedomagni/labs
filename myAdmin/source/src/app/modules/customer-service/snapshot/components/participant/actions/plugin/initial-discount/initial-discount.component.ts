import { Component, Inject, Input, OnInit, Optional } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { DeviceService } from "@modules/customer-service/snapshot/services/device.service";
import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { ProgramType } from "@modules/shared/data/enums";
import { Participant, ParticipantCalculatedInitialValues, ParticipantCalculatedRenewalValues } from "@modules/shared/data/resources";
import { DialogService, LabelService } from "@modules/shared/services/_index";
import { NotificationService } from "@pgr-cla/core-ui-components";
import { concat } from "rxjs";
import { toArray } from "rxjs/operators";

@Component({
    selector: "tmx-snapshot-initial-discount",
    templateUrl: "./initial-discount.component.html",
    styleUrls: ["./initial-discount.component.scss"],
    standalone: false
})
export class InitialDiscountComponent implements OnInit {

	@Input() data: ParticipantCalculatedInitialValues;
	@Input() participant: Participant;
	@Input() policyNumber: string;

	programType = ProgramType;
	infoDataSource: MatTableDataSource<ParticipantCalculatedInitialValues>;
	scoreDataSource: MatTableDataSource<ParticipantCalculatedRenewalValues>;
	infoColumns: string[] = ["discountZero", "scoreCalculated", "emailSent", "scoreCheckBegin", "lastUpdate", "createDate", "dateApplied"];
	scoreColumns: string[] = ["startDate", "endDate", "daysConnected", "disconnects", "score", "value", "message", "createDate"];

	constructor(
		@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: any,
		private deviceService: DeviceService,
		private dialogService: DialogService,
		private labelService: LabelService,
		private notificationService: NotificationService) { }

	ngOnInit(): void {
		this.data = this.data || this.injectedData.initialDiscountInfo;
		this.infoDataSource = new MatTableDataSource<ParticipantCalculatedInitialValues>([this.data]);
		this.scoreDataSource = new MatTableDataSource<ParticipantCalculatedRenewalValues>([this.data?.scoreInfo]);

		this.participant = this.participant || this.injectedData.participant;
		this.policyNumber = this.policyNumber || this.injectedData.policyNumber;
	}

	insertRecord(): void {
		this.dialogService.openConfirmationDialog({
			title: "Insert Record",
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			message: "Are you sure you want to insert a new Initial Discount In Process record for this participant?"
		});

		this.dialogService.confirmed<boolean>().subscribe(confirmed => {
			if (confirmed) {
				concat(
					this.deviceService.addInitialDiscountRecord(this.policyNumber, this.participant.snapshotDetails.participantSeqId),
					this.deviceService.getInitialDiscountInfo(this.participant.snapshotDetails.participantSeqId)
				).pipe(toArray())
					.subscribe(x => {
						this.data = x[1];
						this.infoDataSource.data = [this.data];
						this.scoreDataSource.data = [this.data?.scoreInfo];

						this.notificationService.success("Insert Initial Discount Score In Process Entry Successful");
					});
			}
		});
	}

}
