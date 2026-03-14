import { HttpClient } from "@angular/common/http";
import { ConfigurationSettings, IApiKeys, IAppConfig } from "@modules/core/services/configuration/config-info";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { GoogleMapsService } from "./google-maps.service";

function setup() {
	const http = autoSpy(HttpClient);
	http.jsonp.mockReturnValue(of({}));
	const sanitizer: any = {};
	ConfigurationSettings.appSettings = {
		apiKeys: { googleMaps: "123" } as IApiKeys
	} as IAppConfig;
	const builder = {
		http,
		sanitizer,
		default() {
			return builder;
		},
		build() {
			return new GoogleMapsService(http);
		}
	};

	return builder;
}

describe("GoogleMapsService", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
