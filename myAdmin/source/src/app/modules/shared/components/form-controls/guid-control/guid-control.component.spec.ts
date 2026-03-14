import { GuidControlComponent } from "../_index";

function setup() {
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new GuidControlComponent();
		}
	};

	return builder;
}

describe("GuidControlComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
