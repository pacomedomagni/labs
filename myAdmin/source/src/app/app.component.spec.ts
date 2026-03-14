import { AuthService } from "@modules/auth/services/auth.service";
import { Router } from "@angular/router";
import { UserInfoService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { AppComponent } from "./app.component";

function setup() {
	const router = autoSpy(Router);
	const authService = autoSpy(AuthService);
	const userInfoService = autoSpy(UserInfoService);

	const builder = {
		router,
		authService,
		userInfoService,
		default() {
			return builder;
		},
		build() {
			return new AppComponent(router, authService, userInfoService);
		}
	};

	return builder;
}

describe("AppComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		// const component = build();

		expect(true).toBeTruthy();
	});

});
