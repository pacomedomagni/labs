import { RouterModule, Routes } from "@angular/router";

import { NgModule } from "@angular/core";
import { PolicyHistoryComponent } from "./components/policy-history.component";
import { AppName } from "./metadata";

const routes: Routes = [
	{
		path: "",
		children: [
			{ path: "", pathMatch: "full", redirectTo: AppName.PolicyHistory },
			{ path: AppName.PolicyHistory, component: PolicyHistoryComponent }
		]
	}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PolicyHistoryRoutingModule { }
