import { Component, OnInit } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

import { DeviceLot } from "@modules/shared/data/resources";
import { LabelService } from "@modules/shared/services/_index";
import { MatTableDataSource } from "@angular/material/table";
import { DevicePrepReceivedQuery } from "../../stores/received-query";

@UntilDestroy()
@Component({
    selector: "tmx-device-prep-received-details",
    templateUrl: "./received-details.component.html",
    styleUrls: ["./received-details.component.scss"],
    standalone: false
})
export class ReceivedDetailsComponent implements OnInit {

	private devices: DeviceLot[];

	dataSource: MatTableDataSource<DeviceLot>;
	columns: string[] = ["name", "status"];

	constructor(
		public labelService: LabelService,
		private query: DevicePrepReceivedQuery) { }

	ngOnInit(): void {
		this.dataSource = new MatTableDataSource<DeviceLot>(this.devices);
		this.query.lots$.pipe(untilDestroyed(this)).subscribe(x => {
			this.dataSource.data = x;
		});

	}

}
