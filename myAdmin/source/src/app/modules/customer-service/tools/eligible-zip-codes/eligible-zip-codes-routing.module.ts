import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { EligibleZipCodesComponent } from "./components/_index";
import { AppName } from "./metadata";

const routes: Routes = [
	{
		path: "",
		children: [
			{ path: "", pathMatch: "full", redirectTo: AppName.EligibleZipCodes },
			{ path: AppName.EligibleZipCodes, component: EligibleZipCodesComponent }
		]
	}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class EligibleZipCodesRoutingModule { }
