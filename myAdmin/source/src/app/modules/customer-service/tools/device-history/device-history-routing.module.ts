import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DeviceHistoryComponent } from "./components/_index";
import { AppName } from "./metadata";

const routes: Routes = [
	{
		path: "",
		children: [
			{ path: "", pathMatch: "full", redirectTo: AppName.DeviceHistory },
			{ path: AppName.DeviceHistory, component: DeviceHistoryComponent }
		]
	}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class DeviceHistoryRoutingModule { }
