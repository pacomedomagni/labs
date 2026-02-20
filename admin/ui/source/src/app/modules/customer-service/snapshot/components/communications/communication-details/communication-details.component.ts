import { Component, Input, OnInit } from "@angular/core";

import { Communication } from "@modules/shared/data/resources";
import { MatTableDataSource } from "@angular/material/table";

@Component({
    selector: "tmx-snapshot-communication-details",
    templateUrl: "./communication-details.component.html",
    styleUrls: ["./communication-details.component.scss"],
    standalone: false
})
export class CommunicationDetailsComponent implements OnInit {

	@Input() communications: Communication[];

	dataSource: MatTableDataSource<Communication>;
	columns: string[] = ["create", "method", "reason", "serialNumber"];

	constructor() { }

	ngOnInit(): void {
		this.dataSource = new MatTableDataSource<Communication>(this.communications);
	}

}
