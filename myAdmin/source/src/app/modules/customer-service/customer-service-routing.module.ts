import { RouterModule, Routes } from "@angular/router";

import { ExternalRedirectGuard } from "@modules/shared/guards/_index";
import { NgModule } from "@angular/core";
import { SnapshotContainerComponent } from "./snapshot/components/_index";
import { TrialContainerComponent } from "./trial/components/_index";
// import { AppName as clApp, metadata as clMetadata } from "./commercial-lines/metadata";
import { AppName as snapshotApp, metadata as snapshotMetadata } from "./snapshot/metadata";
import { AppName as policyHistoryApp, metadata as policyHistoryMetadata } from "./tools/policy-history/metadata";
import { AppName as deviceHistoryApp, metadata as deviceHistoryMetadata } from "./tools/device-history/metadata";
import { AppName as eligibleZipCodesApp, metadata as eligibleZipCodesMetadata } from "./tools/eligible-zip-codes/metadata";
import { AppName as incidentResolutionApp, metadata as incidentResolutionMetadata } from "./tools/incident-resolution/metadata";
import { AppName as ineligibleVehiclesApp, metadata as ineligibleVehiclesMetadata } from "./tools/ineligible-vehicles/metadata";
import { AppName as mobileRegistrationSearchApp, metadata as mobileRegistrationSearchMetadata } from "./tools/mobile-registration-search/metadata";
import { AppName as trialApp, metadata as trialMetadata } from "./trial/metadata";
import { AppName as areApp, metadata as areMetadata } from "./are/metadata";
import { PolicyHistoryComponent } from "./tools/policy-history/components/policy-history.component";
import { DeviceHistoryComponent } from "./tools/device-history/components/_index";
import { EligibleZipCodesComponent } from "./tools/eligible-zip-codes/components/_index";
import { IneligibleVehiclesComponent } from "./tools/ineligible-vehicles/components/_index";
import { MobileRegistrationSearchComponent } from "./shared/components/mobile-registration-search/mobile-registration-search.component";
// import { CommercialLinesContainerComponent } from "./commercial-lines/components/_index";
import { IncidentResolutionComponent } from "./tools/incident-resolution/components/incident-resolution/incident-resolution.component";
import { AreContainerComponent } from "./are/components/_index";

const routes: Routes = [
	{
		path: "",
		children: [
			{
				path: "",
				pathMatch: "full",
				redirectTo: "Apps"
			},
			{
				path: "Apps",
				children: [
					{
						path: "",
						redirectTo: snapshotApp.SnapshotDiscount
					},
					{
						path: "mobile-registration-search",
						loadComponent: () => import("./shared/components/mobile-registration-search/mobile-registration-search.component").then(m => m.MobileRegistrationSearchComponent)
					},
					{
						data: { breadcrumb: areMetadata.name },
						path: areApp.AccidentDetection,
						component: AreContainerComponent
					},
					{
						data: { breadcrumb: snapshotMetadata.name },
						path: snapshotApp.SnapshotDiscount,
						canActivate: [ExternalRedirectGuard],
						component: SnapshotContainerComponent
					},
					{
						data: { breadcrumb: trialMetadata.name },
						path: trialApp.SnapshotTrial,
						canActivate: [ExternalRedirectGuard],
						component: TrialContainerComponent
					}
				]
			},
			{
				path: "Tools",
				children: [
					{
						path: "",
						redirectTo: deviceHistoryApp.DeviceHistory
					},
					{
						data: { breadcrumb: deviceHistoryMetadata.name },
						path: deviceHistoryApp.DeviceHistory,
						canActivate: [ExternalRedirectGuard],
						component: DeviceHistoryComponent
					},
					{
						data: { breadcrumb: eligibleZipCodesMetadata.name },
						path: eligibleZipCodesApp.EligibleZipCodes,
						canActivate: [ExternalRedirectGuard],
						component: EligibleZipCodesComponent
					},
					{
						data: { breadcrumb: incidentResolutionMetadata.name },
						path: incidentResolutionApp.IncidentResolution,
						canActivate: [ExternalRedirectGuard],
						component: IncidentResolutionComponent
					},
					{
						data: { breadcrumb: ineligibleVehiclesMetadata.name },
						path: ineligibleVehiclesApp.IneligibleVehicles,
						canActivate: [ExternalRedirectGuard],
						component: IneligibleVehiclesComponent
					},
					{
						data: { breadcrumb: policyHistoryMetadata.name },
						path: policyHistoryApp.PolicyHistory,
						canActivate: [ExternalRedirectGuard],
						component: PolicyHistoryComponent
					},
					{
						data: { breadcrumb: mobileRegistrationSearchMetadata.name },
						path: mobileRegistrationSearchApp.MobileRegistrationSearch,
						component: MobileRegistrationSearchComponent
					}
				]
			}
		]
	}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CustomerServiceRoutingModule { }
