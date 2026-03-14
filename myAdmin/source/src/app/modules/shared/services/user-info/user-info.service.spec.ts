import { ApiService } from "@modules/core/services/_index";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { CookieService } from "ngx-cookie-service";
import { UserInfoService } from "./user-info.service";

function setup() {
	const api = autoSpy(ApiService);
	const cookieService = autoSpy(CookieService);
	api.get.mockReturnValue(of({}));

	const builder = {
		api,
		cookieService,
		default() {
			return builder;
		},
		build() {
			return new UserInfoService(api, cookieService);
		}
	};

	return builder;
}

describe("UserInfoService", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("should call api to get user info", () => {
		const { build, api } = setup().default();
		const component = build();

		component.getUserInfo().subscribe();

		expect(api.get).toHaveBeenCalledWith({ uri: "/customerService/roles", options: { fullResponse: true } });
	});

});
