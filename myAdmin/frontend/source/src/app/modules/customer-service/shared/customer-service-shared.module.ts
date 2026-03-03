import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { SharedModule } from "@modules/shared/shared.module";
import {
	MobileRegistrationHelpComponent,
	MobileRegistrationResetHelpComponent,
	StopShipmentHelpComponent
} from "./help/_index";
import {
	CrossAppBannerComponent,
	MobileNumberEditComponent,
	MobileRegistrationComponent,
	TransactionLogViewerComponent,
	UnenrollmentParticipantComponent
} from "./components/_index";
import {
	CrossAppService,
	PolicyService,
	RegistrationService,
	RegistrationDialogService,
	AccidentDetectionService,
	AccidentDetectionDialogService
} from "./services/_index";
import {
	CrossAppQuery,
	PolicyQuery
} from "./stores/_index";

@NgModule({
	declarations: [
		CrossAppBannerComponent,
		MobileNumberEditComponent,
		MobileRegistrationComponent,
		MobileRegistrationHelpComponent,
		MobileRegistrationResetHelpComponent,
		StopShipmentHelpComponent,
		TransactionLogViewerComponent,
		UnenrollmentParticipantComponent
	],
	imports: [
		CommonModule,
		SharedModule,
		RouterModule,
	],
	exports: [
		CrossAppBannerComponent,
		MobileNumberEditComponent,
		MobileRegistrationComponent,
		MobileRegistrationHelpComponent,
		MobileRegistrationResetHelpComponent,
		StopShipmentHelpComponent,
		UnenrollmentParticipantComponent
	],
	providers: [
		CrossAppService,
		CrossAppQuery,
		PolicyService,
		PolicyQuery,
		RegistrationService,
		RegistrationDialogService,
		AccidentDetectionService,
		AccidentDetectionDialogService
	]
})
export class CustomerServiceSharedModule { }
