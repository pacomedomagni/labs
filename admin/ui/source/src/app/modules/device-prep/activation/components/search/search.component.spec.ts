import { autoSpy } from "autoSpy";
import { ActivationSearchComponent } from "./search.component";
import { DeviceActivationService } from "../../services/device-activation.service";

function setup() {
	const service = autoSpy(DeviceActivationService);

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new ActivationSearchComponent(service);
		}
	};

	return builder;
}

describe("ActivationSearchComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
