import { RouterModule, Routes } from "@angular/router";

import { NgModule } from "@angular/core";
import { ForbiddenComponent } from "./components/error-screens/forbidden/forbidden.component";
import { OAuthSsoCallbackComponent } from "./components/oauth-sso-callback.component";
import { SsoLoginComponent } from "./components/sso-login.component";
import { UnauthorizedComponent } from "./components/error-screens/unauthorized/unauthorized.component";

const routes: Routes = [
	{ path: "forbidden", component: ForbiddenComponent, data: { title: "Forbidden" } },
	{ path: "login", component: SsoLoginComponent },
	{ path: "oauth_sso", component: OAuthSsoCallbackComponent },
	{ path: "unauthorized", component: UnauthorizedComponent, data: { title: "Unauthorized" } }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AuthRoutingModule { }
