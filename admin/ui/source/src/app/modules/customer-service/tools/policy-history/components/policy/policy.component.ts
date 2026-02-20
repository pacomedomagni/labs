import { Component, Input } from "@angular/core";
import { UntilDestroy } from "@ngneat/until-destroy";
import { LabelService } from "@modules/shared/services/label-service/label.service";
import { MatTableDataSource } from "@angular/material/table";
import { SupportPolicy } from "@modules/shared/data/resources";
import { UIFormats } from "@modules/shared/data/ui-format";

@UntilDestroy()
@Component({
    selector: "tmx-policy-history-policy",
    templateUrl: "./policy.component.html",
    styleUrls: ["./policy.component.scss"],
    standalone: false
})
export class PolicyComponent {

	@Input() data: SupportPolicy;

	formats = UIFormats;
	dataSource: MatTableDataSource<SupportPolicy>;
	columns: string[] = [
		"polSeqId",
		"polNbr",
		"email",
		"name",
		"address1",
		"address2",
		"city",
		"state",
		"zip",
		"source",
		"activeEmail",
		"needsLabel",
		"createDate",
		"firstLogin",
		"partType",
		"partSubType",
		"channel",
		"lastReconcile",
		"mailingState",
		"deviceCat",
		"trialCustId"
	];

	constructor(public labelService: LabelService) { }

}
