import { APP_INITIALIZER, ErrorHandler, NgModule } from "@angular/core";
import { CoreUiModule, SideSheetServiceModule, ThemeServiceModule } from "@pgr-cla/core-ui-components";
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClientJsonpModule } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { OAuthModule } from "angular-oauth2-oidc";
import { AppConfigService, AppLoadService, EnvConfigService, getConfig } from "./services/configuration";
import { NotFoundComponent, TechnicalDifficultyComponent } from "./components/error-screens";

import { CoreRoutingModule } from "./core.routing.module";
import { ErrorHandlerService } from "./services/error-handler/error-handler.service";
import { HttpInterceptorErrorService } from "./services/http-interceptors/error-interceptor";
import { LoadingInterceptor } from "./services/http-interceptors/loading-interceptor";
import { PageTitleService } from "./services/_index";
import { JsonDateInterceptor } from "./services/http-interceptors/json-date-interceptor";

@NgModule({
	declarations: [
		NotFoundComponent,
		TechnicalDifficultyComponent
	],
	imports: [
		CommonModule,
		CoreRoutingModule,
		MatIconModule,
		CoreUiModule,
		HttpClientModule,
		HttpClientJsonpModule,
		OAuthModule.forRoot(),
		SideSheetServiceModule,
		ThemeServiceModule
	],
	providers: [
		PageTitleService,
		{ provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorErrorService, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: JsonDateInterceptor, multi: true },
		{ provide: ErrorHandler, useClass: ErrorHandlerService },
		{
			provide: APP_INITIALIZER,
			useFactory: getConfig,
			deps: [AppLoadService, EnvConfigService, AppConfigService],
			multi: true
		}
	]
})

export class CoreModule { }
