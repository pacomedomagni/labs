import { Component, Inject, Input, OnInit, Optional } from "@angular/core";
import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { ParticipantCalculatedValues } from "@modules/shared/data/resources";

@Component({
    selector: "tmx-snapshot-score-info",
    templateUrl: "./snapshot-score-info.component.html",
    styleUrls: ["./snapshot-score-info.component.scss"],
    standalone: false
})
export class SnapshotScoreInfoComponent implements OnInit {

	@Input() data: { scoreData: ParticipantCalculatedValues; isMobile: boolean };

	constructor(@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: any) { }

	ngOnInit(): void {
		this.data = this.data || this.injectedData;

	}

}
