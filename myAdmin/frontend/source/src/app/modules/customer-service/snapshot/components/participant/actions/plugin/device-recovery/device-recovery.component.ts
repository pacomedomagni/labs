import { DatePipe } from "@angular/common";
import { Component, OnInit, Inject, Input, Optional, QueryList, ViewChildren } from "@angular/core";
import { NgForm } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { DeviceService } from "@modules/customer-service/snapshot/services/device.service";
import { FORM_DIALOG_CONTENT } from "@modules/shared/components/dialogs/form-dialog/form-dialog.component";
import { DeviceRecoveryItem } from "@modules/shared/data/resources";

@Component({
    selector: "tmx-snapshot-device-recovery",
    templateUrl: "./device-recovery.component.html",
    styleUrls: ["./device-recovery.component.scss"],
    standalone: false
})
export class DeviceRecoveryComponent implements OnInit {

	@Input() model: { recoveryItems: DeviceRecoveryItem[]; originalRecoveryItems: DeviceRecoveryItem[] };
	@Input() parentForm: NgForm;

	suspensionHistorydataSource: MatTableDataSource<{}>;
	recoveryInfoDataSource: MatTableDataSource<DeviceRecoveryItem>;
	suspensionHistoryTopColumns: string[] = ["Device", "Begin Date", "End Date", "Days", "User"];
	recoveryInfoTopColumns: string[] = ["Device", "Requested Date", "Suspended", "Abandoned", "Received Date"];

	@ViewChildren("suspendCheckboxes") public suspendCheckboxes: QueryList<any>;

	@ViewChildren("abandonCheckboxes") public abandonCheckboxes: QueryList<any>;

	constructor(
		@Optional() @Inject(FORM_DIALOG_CONTENT) public injectedData: any, public deviceService: DeviceService, public datePipe: DatePipe) { }

	ngOnInit(): void {
		this.model = this.model || this.injectedData.model;
		this.parentForm = this.parentForm || this.injectedData.form;

		this.deviceService.getDeviceHistory(this.injectedData.data.participantSeqId).subscribe(x => {
			const newCombinedItems = [];

			x.suspensionInfo.forEach(y => {
				const endDate = new Date(y.startDate);
				endDate.setDate((new Date(y.startDate).getDate()) + Number(y.daysSuspended));
				newCombinedItems.push(Object.assign(y, { endDate }));
			});

			this.suspensionHistorydataSource = new MatTableDataSource(newCombinedItems);
			this.recoveryInfoDataSource = new MatTableDataSource<DeviceRecoveryItem>(x.recoveryInfo);

			this.model.recoveryItems = x.recoveryInfo.map(z => Object.assign({}, z));
			this.model.originalRecoveryItems = x.recoveryInfo;
		});
	}

	public disableAbandonCheckBox(recoveryItem: DeviceRecoveryItem): boolean {

		return (recoveryItem.deviceReceivedDate !== undefined
			&& ((this.datePipe.transform(recoveryItem.deviceReceivedDate, "MM/dd/yyyy") !== "01/01/0001")))
			|| recoveryItem.isAbandoned;
	}

	public disableSuspensionCheckBox(recoveryItem: DeviceRecoveryItem, modifiedRecoveryItem: DeviceRecoveryItem): boolean {

		return (recoveryItem.deviceReceivedDate !== undefined
			&& ((this.datePipe.transform(recoveryItem.deviceReceivedDate, "MM/dd/yyyy") !== "01/01/0001")))
			|| recoveryItem.isSuspended || recoveryItem.isAbandoned || modifiedRecoveryItem.isAbandoned;
	}

	public suspensionCheckBoxChanged($event, index: number): void {
		const abandonCheckboxes = this.abandonCheckboxes.toArray();

		if ($event.checked) {
			if (!this.model.originalRecoveryItems[index].isAbandoned) {
				abandonCheckboxes[index].checked = false;
			}
			this.model.recoveryItems[index].isSuspended = true;
		} else {
			this.model.recoveryItems[index].isSuspended = false;
		}
	}

	public abandonCheckBoxChanged($event, index: number): void {
		const suspendCheckboxes = this.suspendCheckboxes.toArray();

		if ($event.checked) {
			if (!this.model.originalRecoveryItems[index].isSuspended) {
				suspendCheckboxes[index].checked = false;
				this.model.recoveryItems[index].isSuspended = false;
			}
			this.model.recoveryItems[index].isAbandoned = true;
		} else {
			this.model.recoveryItems[index].isAbandoned = false;
		}
	}
}
