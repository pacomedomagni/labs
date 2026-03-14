import { RouterModule, Routes } from "@angular/router";

import { ExternalRedirectGuard } from "@modules/shared/guards/_index";
import { NgModule } from "@angular/core";
import { DeviceActivationContainerComponent } from "./activation/components/_index";
import { DeviceBenchtestContainerComponent } from "./bench-test/components/_index";
import { AppName as activation } from "./activation/metadata";
import { AppName as received } from "./received/metadata";
import { AppName as benchTest } from "./bench-test/metadata";
import { DeviceReceivedContainerComponent } from "./received/components/_index";

const routes: Routes = [
	{
		path: "",
		children: [
			{ path: "", pathMatch: "full", redirectTo: activation.DeviceActivation },
			{ path: benchTest.DeviceBenchtest, canActivate: [ExternalRedirectGuard], component: DeviceBenchtestContainerComponent },
			{ path: activation.DeviceActivation, canActivate: [ExternalRedirectGuard], component: DeviceActivationContainerComponent },
			{ path: received.DeviceReceived, canActivate: [ExternalRedirectGuard], component: DeviceReceivedContainerComponent }
		]
	}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class DevicePrepRoutingModule { }
