import { Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MobileRegistrationStatus } from "@modules/shared/data/enums";
import { EnumService } from "@modules/shared/services/enum-service/enum.service";

@Component({
    selector: "tmx-mobile-registration-reset-help",
    templateUrl: "./mobile-registration-reset-help.component.html",
    styleUrls: ["./mobile-registration-reset-help.component.scss"],
    standalone: false
})
export class MobileRegistrationResetHelpComponent implements OnInit {

	dataSource: MatTableDataSource<any>;
	columns: string[] = ["experience", "reasonCode", "areEnrolled", "regStatus"];

	private data: Array<{ experience: "Mobile" | "OBD" | "N/A" | "ANY"; reasonCode: string; areEnrolled: boolean; regStatus: string }> = undefined;

	constructor(enumService: EnumService) {
		this.data = [
			{
				experience: "N/A",
				reasonCode: "Not Enrolled",
				areEnrolled: false,
				regStatus: enumService.mobileRegistrationStatus.description(MobileRegistrationStatus.Disabled)
			},
			{
				experience: "N/A",
				reasonCode: "Not Enrolled",
				areEnrolled: true,
				regStatus: `${enumService.mobileRegistrationStatus.description(MobileRegistrationStatus.NotRegistered)} 
					or ${enumService.mobileRegistrationStatus.description(MobileRegistrationStatus.RegistrationComplete)}`
			},
			{
				experience: "ANY",
				reasonCode: "ANY",
				areEnrolled: true,
				regStatus: `${enumService.mobileRegistrationStatus.description(MobileRegistrationStatus.NotRegistered)} 
					or ${enumService.mobileRegistrationStatus.description(MobileRegistrationStatus.RegistrationComplete)}`
			},
			{
				experience: "OBD",
				reasonCode: "ANY",
				areEnrolled: false,
				regStatus: enumService.mobileRegistrationStatus.description(MobileRegistrationStatus.Disabled)
			},
			{
				experience: "Mobile",
				reasonCode: "Pending Registration Needed",
				areEnrolled: false,
				regStatus: enumService.mobileRegistrationStatus.description(MobileRegistrationStatus.NotRegistered)
			},
			{
				experience: "Mobile",
				reasonCode: "Active Collecting Data",
				areEnrolled: false,
				regStatus: enumService.mobileRegistrationStatus.description(MobileRegistrationStatus.RegistrationComplete)
			},
			{
				experience: "Mobile",
				reasonCode: "Opted Out for Non-Installer less than 30 days ago",
				areEnrolled: false,
				regStatus: enumService.mobileRegistrationStatus.description(MobileRegistrationStatus.NotRegistered)
			},
			{
				experience: "Mobile",
				reasonCode: "Opted Out for any other reason",
				areEnrolled: false,
				regStatus: enumService.mobileRegistrationStatus.description(MobileRegistrationStatus.Disabled)
			},
			{
				experience: "Mobile",
				reasonCode: "Monitoring Complete",
				areEnrolled: false,
				regStatus: enumService.mobileRegistrationStatus.description(MobileRegistrationStatus.Disabled)
			}, {
				experience: "Mobile",
				reasonCode: "Inactive",
				areEnrolled: false,
				regStatus: enumService.mobileRegistrationStatus.description(MobileRegistrationStatus.Disabled)
			}
		];
	}

	ngOnInit(): void {
		this.dataSource = new MatTableDataSource<any>(this.data);
	}

}
