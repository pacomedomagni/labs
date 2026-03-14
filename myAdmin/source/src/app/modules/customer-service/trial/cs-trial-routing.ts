import { RouterModule, Routes } from "@angular/router";

import { ExternalRedirectGuard } from "@modules/shared/guards/_index";
import { NgModule } from "@angular/core";
import { TrialContainerComponent } from "./components/_index";
import { AppName } from "./metadata";

const routes: Routes = [
	{
		path: "",
		children: [
			{ path: "", pathMatch: "full", redirectTo: AppName.SnapshotTrial },
			{ path: AppName.SnapshotTrial, canActivate: [ExternalRedirectGuard], component: TrialContainerComponent }
		]
	}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CustomerServiceTrialRoutingModule { }
