import { Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { DeviceService } from "@modules/customer-service/snapshot/services/_index";
import { DeviceShippingInformation, PluginDevice } from "@modules/shared/data/resources";
import { EnumService } from "@modules/shared/services/_index";
import { ResourceQuery } from "@modules/shared/stores/resource-query";

@Component({
    selector: "tmx-device-history",
    templateUrl: "./device-history.component.html",
    styleUrls: ["./device-history.component.scss"],
    standalone: false
})
export class DeviceHistoryComponent implements OnInit {

	serialNumber: string;
	device: PluginDevice;
	shippingColumns = ["policyNumber", "shipDate"];
	shippingDataSource: MatTableDataSource<DeviceShippingInformation>;

	constructor(
		public helper: ResourceQuery,
		public enums: EnumService,
		private deviceService: DeviceService) { }

	ngOnInit(): void {
		this.shippingDataSource = new MatTableDataSource<DeviceShippingInformation>();
	}

	search(serialNumber: string): void {
		const isRecycled = serialNumber.indexOf("_");
		const serialNumberAdj = isRecycled > -1 ? serialNumber.slice(0, isRecycled) : serialNumber;
		this.deviceService.deviceInfoDetails(serialNumberAdj).subscribe(x => {
			this.device = x;
			this.shippingDataSource.data = x.history.shippingInfo;
		});
	}

}
