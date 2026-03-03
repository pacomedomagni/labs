import { Component, Input, OnChanges, OnInit } from "@angular/core";

import { BillingTransaction, Participant } from "@modules/shared/data/resources";
import { MatTableDataSource } from "@angular/material/table";
import { DeviceService } from "@modules/customer-service/snapshot/services/device.service";
import { first } from "rxjs/operators";
import { DialogService, LabelService, UserInfoService } from "@modules/shared/services/_index";
import { NotificationService } from "@pgr-cla/core-ui-components";
import { formatCurrency } from "@angular/common";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";

@Component({
    selector: "tmx-snapshot-billing-details",
    templateUrl: "./billing-details.component.html",
    styleUrls: ["./billing-details.component.scss"],
    standalone: false
})
export class BillingDetailsComponent implements OnInit, OnChanges {

	@Input() participant: Participant;

	dataSource: MatTableDataSource<BillingTransaction>;
	columns: string[] = ["create", "serialNumber", "type", "amount", "actions"];

	billingData: BillingTransaction[];
	participantSeqId: number;
	expirationYear: number;
	policyNumber: string;
	policySuffix: number;

	constructor(
		private deviceService: DeviceService,
		private dialogService: DialogService,
		private labelService: LabelService,
		private notificationService: NotificationService,
		private query: SnapshotPolicyQuery,
		private userInfoService: UserInfoService
	) { }

	ngOnInit(): void {
		this.query.policy$.pipe(first()).subscribe(x => {
			this.participantSeqId = this.participant.snapshotDetails.participantSeqId;
			this.policyNumber = x.policyNumber;
			const currentPolicyPeriod = x.policyPeriodDetails[x.policyPeriodDetails.length - 1];
			this.policySuffix = currentPolicyPeriod.policySuffix;
			this.expirationYear = currentPolicyPeriod.expirationDate.getFullYear();
		});
	}

	ngOnChanges(): void {
		this.billingData = this.participant.snapshotDetails.billingTransactions;
		this.dataSource = new MatTableDataSource<BillingTransaction>(this.billingData);
	}

	reverseFee(transaction: BillingTransaction): void {
		const title = "Reverse Fee";
		this.dialogService.openConfirmationDialog({
			title,
			subtitle: this.labelService.getDialogSubtitleForParticipant(this.participant),
			message: `Amount ${formatCurrency(+transaction.amount, "en-US", "$")} <br /> Are you sure you want to reverse the device fee? <br /> <br />

			<b>Note: If the device will continue to be used, after reversing the fee you must 'Activate' the device.</b>`
		});

		this.dialogService.confirmed<boolean>().subscribe(confirmed => {
			if (confirmed) {
				this.deviceService.feeReversal(
					transaction.deviceSerialNumber,
					this.expirationYear,
					this.participantSeqId,
					this.policyNumber,
					this.policySuffix
				).subscribe(x => {
					if (!!x.responseErrors) {
						this.notificationService.error(`${x.responseErrors[0].message}`);
					}
					else {
						this.notificationService.success(`${title} Successful`);
					}
				});
			}
		});
	}

	shouldDisplayFeeReversal(item: any): boolean {
		return item.description === "Fee" && (this.userInfoService.data.isInFeeReversalRole ||
			this.userInfoService.data.isInFeeReversalOnlyRole);
	}
}
