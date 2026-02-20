import { Router } from "@angular/router";
import { autoSpy } from "autoSpy";
import { AppDataService, UserInfoService } from "@modules/shared/services/_index";
import { PortalContainerComponent } from "./container.component";

function setup() {
	const router = autoSpy(Router);
	const appDataService = autoSpy(AppDataService);
	const userService = autoSpy(UserInfoService);

	const builder = {
		router,
		appDataService,
		userService,
		default() {
			return builder;
		},
		build() {
			return new PortalContainerComponent(router, appDataService, userService);
		}
	};

	return builder;
}

describe("PortalContainerComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
