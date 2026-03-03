import { Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

import { PluginDevice } from "@modules/shared/data/resources";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { DevicePrepActivationQuery } from "../../stores/activation-query";

@UntilDestroy()
@Component({
    selector: "tmx-device-prep-device-details",
    templateUrl: "./device-details.component.html",
    styleUrls: ["./device-details.component.scss"],
    standalone: false
})
export class DeviceDetailsComponent implements OnInit {

	private devices: PluginDevice[];

	dataSource: MatTableDataSource<PluginDevice>;
	columns: string[] = ["serialNumber", "sim", "status"];

	constructor(public helperSerivce: ResourceQuery, private query: DevicePrepActivationQuery) { }

	ngOnInit(): void {
		this.dataSource = new MatTableDataSource<PluginDevice>(this.devices);
		this.query.devices$.pipe(untilDestroyed(this)).subscribe(x => {
			this.dataSource.data = x;
		});

	}

}
