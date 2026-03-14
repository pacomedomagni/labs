import { UpdateGuidComponent } from "./update-guid.component";

function setup() {
	const injectedData = {};

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new UpdateGuidComponent(injectedData);
		}
	};

	return builder;
}

describe("UpdateGuidComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
