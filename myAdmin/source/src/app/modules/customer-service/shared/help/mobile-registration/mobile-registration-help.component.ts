import { Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MobileRegistrationStatusSummary } from "@modules/shared/data/enums";
import {MobileRegistrationStatusSummaryDescription} from "@modules/shared/data/enum-descriptions";
import { EnumService } from "@modules/shared/services/enum-service/enum.service";

@Component({
    selector: "tmx-mobile-registration-help",
    templateUrl: "./mobile-registration-help.component.html",
    styleUrls: ["./mobile-registration-help.component.scss"],
    standalone: false
})
export class MobileRegistrationHelpComponent implements OnInit {

	dataSource: MatTableDataSource<any>;
	columns: string[] = ["status", "description"];

	private data: Array<{ status: string; description: string }> = undefined;

	constructor(enumService: EnumService) {
		this.data = [
			{
				status:  MobileRegistrationStatusSummaryDescription.get(MobileRegistrationStatusSummary.Disabled),
				description: "Customer is unable to register. Registration for this phone number has been disabled as the participant is no longer enrolled."
			},
			{
				status: MobileRegistrationStatusSummaryDescription.get(MobileRegistrationStatusSummary.Inactive),
				description: "Customer is unable to register. Registration for this phone number has been deactivated. This phone number is now available to be used for another policy/participant."
			},
			{
				status: MobileRegistrationStatusSummaryDescription.get(MobileRegistrationStatusSummary.PendingResolution),
				description: "Customer is unable to register because the phone number listed is assigned to another participant.  To allow this phone number to be registered it must be set to Inactive for the other participant."
			},
			{
				status: MobileRegistrationStatusSummaryDescription.get(MobileRegistrationStatusSummary.Locked),
				description: "Customer is unable to register due to 5 failed registration attempts."
			},
			{
				status: MobileRegistrationStatusSummaryDescription.get(MobileRegistrationStatusSummary.New),
				description: "Customer is able to register."
			},
			{
				status: MobileRegistrationStatusSummaryDescription.get(MobileRegistrationStatusSummary.Complete),
				description: "Customer has successfully completed registration. Re-registration is available."
			}
		];
	}

	ngOnInit(): void {
		this.dataSource = new MatTableDataSource<any>(this.data);
	}
}
