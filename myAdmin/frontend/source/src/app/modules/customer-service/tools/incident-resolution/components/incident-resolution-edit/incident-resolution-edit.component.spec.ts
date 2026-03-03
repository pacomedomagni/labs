import { IncidentResolutionEditComponent } from "./incident-resolution-edit.component";

function setup() {
	const injectedData = [];
	const builder = {
		injectedData,
		default() {
			return builder;
		},
		build() {
			return new IncidentResolutionEditComponent(injectedData);
		}
	};

	return builder;
}

describe("IncidentResolutionEditComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
