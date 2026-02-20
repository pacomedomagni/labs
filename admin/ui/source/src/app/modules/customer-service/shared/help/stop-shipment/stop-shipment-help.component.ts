import { Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";

@Component({
    selector: "tmx-stop-shipment-help",
    templateUrl: "./stop-shipment-help.component.html",
    styleUrls: ["./stop-shipment-help.component.scss"],
    standalone: false
})
export class StopShipmentHelpComponent implements OnInit {

	dataSource: MatTableDataSource<any>;
	columns: string[] = ["scenario", "selection"];

	private data: Array<{ scenario: string; selection: string }> = undefined;

	constructor() {
		this.data = [
			{
				scenario: "Policy Terms are Out of Order in Admin",
				selection: "Set to Opted Out"
			},
			{
				scenario: "Prep Participant for Policy Transfer",
				selection: "Set to Monitoring Complete"
			},
			{
				scenario: "Prep Participant for Re-enroll in Mobile 3.0",
				selection: "Set to Opted Out"
			},
			{
				scenario: "Set to Monitoring Complete with Discount",
				selection: "Set to Monitoring Complete"
			},
			{
				scenario: "Stop Shipment of Plug-in Device",
				selection: "Set to Opted Out"
			},
			{
				scenario: "Vehicle Replacement Correction",
				selection: "Refer to Guidelines"
			}
		];
	}

	ngOnInit(): void {
		this.dataSource = new MatTableDataSource<any>(this.data);
	}
}
