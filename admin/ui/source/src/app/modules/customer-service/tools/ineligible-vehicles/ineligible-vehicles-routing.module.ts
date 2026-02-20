import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { IneligibleVehiclesComponent } from "./components/_index";
import { AppName } from "./metadata";

const routes: Routes = [
	{
		path: "",
		children: [
			{ path: "", pathMatch: "full", redirectTo: AppName.IneligibleVehicles },
			{ path: AppName.IneligibleVehicles, component: IneligibleVehiclesComponent }
		]
	}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class IneligibleVehiclesRoutingModule { }
