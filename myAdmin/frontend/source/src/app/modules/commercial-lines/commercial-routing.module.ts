import { RouterModule, Routes } from "@angular/router";

import { NgModule } from "@angular/core";
import { CommercialLinesContainerComponent } from "./policy-search/components/_index";
import { AppName as commercialLines, policySearch } from "./policy-search/metadata";

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
						redirectTo: commercialLines.PolicySearch
					},
					{
						data: { breadcrumb: policySearch.name },
						path: commercialLines.PolicySearch,
						component: CommercialLinesContainerComponent
					}
				]
			}
		]
	}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CommercialRoutingModule { }
