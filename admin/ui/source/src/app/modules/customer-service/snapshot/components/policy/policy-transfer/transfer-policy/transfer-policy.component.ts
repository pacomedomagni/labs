import { Component, Inject, Input, OnInit, Optional } from "@angular/core";
import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { Participant } from "@modules/shared/data/resources";

@Component({
    selector: "tmx-snapshot-transfer-policy",
    templateUrl: "./transfer-policy.component.html",
    styleUrls: ["./transfer-policy.component.scss"],
    standalone: false
})
export class TransferPolicyComponent implements OnInit {

	@Input() participants: Participant[];
	@Input() oldPolicyNumber: string;
	@Input() newPolicyNumber: string;

	constructor(@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: any) { }

	ngOnInit(): void {
		this.participants = this.participants || this.injectedData.participants;
		this.oldPolicyNumber = this.oldPolicyNumber || this.injectedData.oldPolicyNumber;
		this.newPolicyNumber = this.newPolicyNumber || this.injectedData.newPolicyNumber;
	}

}
