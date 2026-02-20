import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { ExternalRedirectGuard } from "@modules/shared/guards/external-redirect.guard";
import { SnapshotContainerComponent } from "./components/container/snapshot-container.component";
import { AppName } from "./metadata";

const routes: Routes = [
	{
		path: "",
		children: [
			{ path: "", pathMatch: "full", redirectTo: AppName.SnapshotDiscount },
			{ path: AppName.SnapshotDiscount, canActivate: [ExternalRedirectGuard], component: SnapshotContainerComponent }
		]
	}];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CustomerServiceSnapshotRoutingModule { }
