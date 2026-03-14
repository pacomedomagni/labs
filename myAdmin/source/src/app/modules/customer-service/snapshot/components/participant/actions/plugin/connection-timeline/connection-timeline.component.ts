import { Component, Inject, Input, OnInit, Optional } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { ConnectionTimeline, DisconnectionInterval } from "@modules/shared/data/resources";
import { UIFormats } from "@modules/shared/data/ui-format";
import { ResourceQuery } from "@modules/shared/stores/resource-query";

@Component({
    selector: "tmx-snapshot-connection-timeline",
    templateUrl: "./connection-timeline.component.html",
    styleUrls: ["./connection-timeline.component.scss"],
    standalone: false
})
export class ConnectionTimelineComponent implements OnInit {

	@Input() connectionTimeline: ConnectionTimeline;

	dataSource: MatTableDataSource<DisconnectionInterval>;
	formats = UIFormats;
	topColumns: string[] = ["Disconnect Time", "Connection Time", "Disconnect Duration"];
	tableFooterColumns: string[] = ["Title", "Disconnected Time"];

	constructor(
		@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: any,
		public helper: ResourceQuery) { }

	ngOnInit(): void {
		this.connectionTimeline = this.connectionTimeline || this.injectedData;
		this.dataSource = new MatTableDataSource<DisconnectionInterval>(this.connectionTimeline.eventPairs);

	}

}
