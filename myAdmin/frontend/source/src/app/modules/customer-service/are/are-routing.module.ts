import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AreContainerComponent } from "./components/container/are-container.component";
import { AppName } from "./metadata";

const routes: Routes = [
	{
		path: "",
		children: [
			{ path: "", pathMatch: "full", redirectTo: AppName.AccidentDetection },
			{ path: AppName.AccidentDetection, component: AreContainerComponent }
		]
	}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AreRoutingModule { }
