import { DeviceInfoMobileComponent } from "./device-info-mobile.component";

function setup() {
	const data: any = {};

	const builder = {
		data,
		default() {
			return builder;
		},
		build() {
			return new DeviceInfoMobileComponent(data);
		}
	};

	return builder;
}

describe("DeviceInfoMobileComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
