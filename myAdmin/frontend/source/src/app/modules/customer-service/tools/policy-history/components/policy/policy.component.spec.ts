import { LabelService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { PolicyComponent } from "./policy.component";

function setup() {
	const label = autoSpy(LabelService);

	const builder = {
		label,
		default() {
			return builder;
		},
		build() {
			return new PolicyComponent(label);
		}
	};

	return builder;
}

describe("PolicyComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
