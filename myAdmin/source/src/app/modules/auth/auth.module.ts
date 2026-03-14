import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { NgModule } from "@angular/core";
import { OAuthModule } from "angular-oauth2-oidc";
import { ForbiddenComponent } from "./components/error-screens/forbidden/forbidden.component";
import { AuthSpinnerComponent } from "./components/spinner.component";
import { AuthRoutingModule } from "./auth-routing.module";
import { AuthGuard } from "./guards/auth.guard";
import { OAuthSsoCallbackComponent } from "./components/oauth-sso-callback.component";
import { SsoLoginComponent } from "./components/sso-login.component";
import { UnauthorizedComponent } from "./components/error-screens/unauthorized/unauthorized.component";

@NgModule({
	declarations: [
		SsoLoginComponent,
		OAuthSsoCallbackComponent,
		UnauthorizedComponent,
		ForbiddenComponent,
		AuthSpinnerComponent
	],
	imports: [
		CommonModule,
		AuthRoutingModule,
		MatIconModule,
		MatProgressSpinnerModule,
		MatButtonModule,
		OAuthModule.forRoot()
	],
	providers: [
		AuthGuard
	]
})
export class AuthModule { }
