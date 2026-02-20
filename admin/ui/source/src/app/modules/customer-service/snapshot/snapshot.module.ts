
import { CommonModule } from "@angular/common";
import { CoreModule } from "@modules/core/core.module";
import { NgModule } from "@angular/core";
import { SharedModule } from "@modules/shared/shared.module";
import {
	BillingDetailsComponent,
	CommunicationDetailsComponent,
	CompatibilityDetailsComponent,
	CompatibilityEditComponent,
	ConnectionTimelineComponent,
	DeviceInformationDetailsComponent,
	DeviceLocationComponent,
	DeviceRecoveryComponent,
	SnapshotContainerComponent,
	EnrollmentDateComponent,
	EnrollmentDate20Component,
	ExcludeDateRangeComponent,
	ExcludeDateRangeEditComponent,
	InitialDiscountComponent,
	MobileConnectivityComponent,
	MultiPolicyDetailsComponent,
	OptOutSuspensionComponent,
	OptOutSuspensionEditComponent,
	ParticipantActionsComponent,
	ParticipantDetailsComponent,
	ParticipantMergeComponent,
	PolicyActionsComponent,
	PolicyDetailsComponent,
	PolicyDetailsEditComponent,
	RenewalScoresComponent,
	StopShipmentComponent,
	SwapDevicesComponent,
	SwapDriverComponent,
	TripSummaryComponent,
	SnapshotScoreInfoComponent,
	UpdateGuidComponent,
	TransferPolicyComponent,
	TransferPolicySelectionComponent
} from "./components/_index";
import { CustomerServiceSharedModule } from "../shared/customer-service-shared.module";
import { CustomerServiceSnapshotRoutingModule } from "./snapshot-routing.module";
import {
	DeviceService,
	MobileService,
	ParticipantService,
	SnapshotPolicyService,
	PolicyTransferDialogService
} from "./services/_index";
import { SnapshotPolicyQuery } from "./stores/_index";
import { CancelDeviceShipmentComponent } from "./components/participant/actions/plugin/cancel-device-shipment/cancel-device-shipment.component";

@NgModule({
	declarations: [
		BillingDetailsComponent,
		CommunicationDetailsComponent,
		CompatibilityDetailsComponent,
		CompatibilityEditComponent,
		ConnectionTimelineComponent,
		DeviceLocationComponent,
		DeviceInformationDetailsComponent,
		DeviceRecoveryComponent,
		SnapshotContainerComponent,
		EnrollmentDateComponent,
		EnrollmentDate20Component,
		ExcludeDateRangeComponent,
		ExcludeDateRangeEditComponent,
		MobileConnectivityComponent,
		MultiPolicyDetailsComponent,
		OptOutSuspensionComponent,
		OptOutSuspensionEditComponent,
		ParticipantActionsComponent,
		ParticipantDetailsComponent,
		ParticipantMergeComponent,
		PolicyActionsComponent,
		PolicyDetailsComponent,
		PolicyDetailsEditComponent,
		RenewalScoresComponent,
		StopShipmentComponent,
		SwapDevicesComponent,
		SwapDriverComponent,
		TransferPolicyComponent,
		TransferPolicySelectionComponent,
		TripSummaryComponent,
		SnapshotScoreInfoComponent,
		UpdateGuidComponent,
		InitialDiscountComponent,
		CancelDeviceShipmentComponent
	],
	imports: [
		CommonModule,
		CoreModule,
		SharedModule,
		CustomerServiceSharedModule,
		CustomerServiceSnapshotRoutingModule,
	],
	providers: [
		PolicyTransferDialogService,
		DeviceService,
		MobileService,
		ParticipantService,
		SnapshotPolicyService,
		SnapshotPolicyQuery,
	]
})
export class CustomerServiceSnapshotModule { }
