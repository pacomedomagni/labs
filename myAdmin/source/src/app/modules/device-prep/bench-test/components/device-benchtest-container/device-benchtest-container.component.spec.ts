import { DeviceBenchtestContainerComponent } from "./device-benchtest-container.component";

function setup() {

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new DeviceBenchtestContainerComponent();
		}
	};

	return builder;
}

describe("DeviceBenchtestContainerComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
