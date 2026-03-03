import { RouterModule, Routes } from "@angular/router";

import { ExternalRedirectGuard } from "@modules/shared/guards/_index";
import { NgModule } from "@angular/core";
import { DeviceBenchtestContainerComponent } from "./components/_index";
import { AppName } from "./metadata";

const routes: Routes = [
	{
		path: "",
		children: [
			{ path: "", pathMatch: "full", redirectTo: AppName.DeviceBenchtest },
			{ path: AppName.DeviceBenchtest, canActivate: [ExternalRedirectGuard], component: DeviceBenchtestContainerComponent }
		]
	}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class DevicePrepBenchTestRoutingModule { }
