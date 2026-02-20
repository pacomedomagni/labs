import { RouterModule, Routes } from "@angular/router";

import { ExternalRedirectGuard } from "@modules/shared/guards/_index";
import { NgModule } from "@angular/core";
import { DeviceReceivedContainerComponent } from "./components/_index";
import { AppName } from "./metadata";

const routes: Routes = [
	{
		path: "",
		children: [
			{ path: "", pathMatch: "full", redirectTo: AppName.DeviceReceived },
			{ path: AppName.DeviceReceived, canActivate: [ExternalRedirectGuard], component: DeviceReceivedContainerComponent }
		]
	}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class DevicePrepReceivedRoutingModule { }
