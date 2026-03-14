import { Component, Inject, Input, OnInit, Optional } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { DeviceFirmwareDetails, PluginDevice } from "@modules/shared/data/resources";
import { ResourceQuery } from "@modules/shared/stores/resource-query";

@Component({
    selector: "tmx-snapshot-device-information-details",
    templateUrl: "./device-information-details.component.html",
    styleUrls: ["./device-information-details.component.scss"],
    standalone: false
})
export class DeviceInformationDetailsComponent implements OnInit {
	@Input() device: PluginDevice;

	topDataSource: MatTableDataSource<PluginDevice>;
	topColumns: string[] = [
		"reportedVin",
		"isDataCollectionAllowed",
		"lastRemoteResetDate"];

	bottomDataSource: MatTableDataSource<DeviceFirmwareDetails>;
	bottomColumns: string[] = [
		"status",
		"configurationFirmwareValue",
		"configurationFirmwareFileName",
		"obd2FirmwareValue",
		"obd2FirmwareFileName",
		"cellFirmwareValue",
		"cellFirmwareFileName",
		"gpsFirmwareValue",
		"gpsFirmwareFileName",
		"mainFirmwareValue",
		"mainFirmwareFileName"
	];

	constructor(
		@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: any,
		public helper: ResourceQuery
	) { }

	ngOnInit(): void {
		this.device = this.device || this.injectedData;

		const currentDetails = { status: "Current" };
		const targetDetails = { status: "Target" };
		Object.keys(this.device.firmwareDetails).forEach(x => {
			const data = this.device.firmwareDetails[x];
			if (x.indexOf("target") === -1) {
				currentDetails[x] = data;
			} else {
				const modded = x.replace("target", "");
				targetDetails[modded.charAt(0).toLowerCase() + modded.slice(1)] = data;
			}
		});

		this.topDataSource = new MatTableDataSource<PluginDevice>([this.device]);
		this.bottomDataSource = new MatTableDataSource<any>([currentDetails, targetDetails]);
	}

}
