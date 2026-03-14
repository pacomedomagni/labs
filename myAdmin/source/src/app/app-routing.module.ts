import { RouterModule, Routes } from "@angular/router";

import { ApplicationGroupIds } from "@modules/shared/data/_index";
import { ExternalRedirectGuard } from "@modules/shared/guards/_index";
import { NgModule } from "@angular/core";
import { WrapperComponent } from "@modules/shared/components/_index";
import { AuthGuard } from "@modules/auth/guards/auth.guard";

const routes: Routes = [
	{
		path: "", component: WrapperComponent,
		canActivate: [AuthGuard],
		children: [
			{
				path: "",
				redirectTo: ApplicationGroupIds.Portal,
				pathMatch: "full"
			},
			{
				path: ApplicationGroupIds.Portal,
				canActivate: [ExternalRedirectGuard],
				loadChildren: () => import("./modules/portal/portal.module")
					.then(m => m.PortalModule)
			},
			{
				path: ApplicationGroupIds.CustomerService,
				canActivate: [ExternalRedirectGuard],
				data: { breadcrumb: "Customer Service" },
				loadChildren: () => import("./modules/customer-service/customer-service.module")
					.then(m => m.CustomerServiceModule)
			},
			{
				path: ApplicationGroupIds.DevicePrep,
				canActivate: [ExternalRedirectGuard],
				loadChildren: () => import("./modules/device-prep/device-prep.module")
					.then(m => m.DevicePrepModule)
			},
			{
				path: ApplicationGroupIds.DeviceReturns,
				canActivate: [ExternalRedirectGuard],
				loadChildren: () => import("./modules/device-returns/device-returns.module")
					.then(m => m.DeviceReturnsModule)
			},
			{
				path: ApplicationGroupIds.Manufacturer,
				canActivate: [ExternalRedirectGuard],
				loadChildren: () => import("./modules/manufacturer/manufacturer.module")
					.then(m => m.ManufacturerModule)
			},
			{
				path: ApplicationGroupIds.OrderFulfillment,
				canActivate: [ExternalRedirectGuard],
				loadChildren: () => import("./modules/order-fulfillment/order-fulfillment.module")
					.then(m => m.OrderFulfillmentModule)
			},
			{
				path: ApplicationGroupIds.Tools,
				canActivate: [ExternalRedirectGuard],
				loadChildren: () => import("./modules/tools/tools.module")
					.then(m => m.ToolsModule)
			},
			{
				path: ApplicationGroupIds.CommercialLines,
				canActivate: [ExternalRedirectGuard],
				loadChildren: () => import("./modules/commercial-lines/commercial.module")
					.then(m => m.CommercialModule)
			}
		]
	}];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
