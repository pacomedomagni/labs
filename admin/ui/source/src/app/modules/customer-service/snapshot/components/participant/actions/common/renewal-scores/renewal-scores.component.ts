import { Component, Inject, Input, OnInit, Optional } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { ParticipantCalculatedRenewalValues } from "@modules/shared/data/resources";

@Component({
    selector: "tmx-snapshot-renewal-scores",
    templateUrl: "./renewal-scores.component.html",
    styleUrls: ["./renewal-scores.component.scss"],
    standalone: false
})
export class RenewalScoresComponent implements OnInit {

	@Input() renewalInfo: ParticipantCalculatedRenewalValues[];

	dataSource: MatTableDataSource<ParticipantCalculatedRenewalValues>;
	columns: string[] = ["suffix", "start", "end", "connected", "disconnect", "score", "value", "message", "eligibility", "create"];

	constructor(@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: any) { }

	ngOnInit(): void {
		this.renewalInfo = this.renewalInfo || this.injectedData;
		this.dataSource = new MatTableDataSource<ParticipantCalculatedRenewalValues>(this.renewalInfo);
	}

}
