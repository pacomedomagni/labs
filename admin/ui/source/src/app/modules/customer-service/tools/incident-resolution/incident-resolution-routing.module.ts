import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { IncidentResolutionComponent } from "./components/incident-resolution/incident-resolution.component";
import { AppName } from "./metadata";

const routes: Routes = [
	{
		path: "",
		children: [
			{ path: "", pathMatch: "full", redirectTo: AppName.IncidentResolution },
			{ path: AppName.IncidentResolution, component: IncidentResolutionComponent }
		]
	}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class IncidentResolutionRoutingModule { }
