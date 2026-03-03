import { autoSpy } from "autoSpy";
import { IneligibleVehiclesService } from "../services/ineligible-vehicles.service";
import { IneligibleVehiclesComponent } from "./ineligible-vehicles.component";

function setup() {
	const service = autoSpy(IneligibleVehiclesService);
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new IneligibleVehiclesComponent(service);
		}
	};

	return builder;
}

describe("IneligibleVehiclesComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});