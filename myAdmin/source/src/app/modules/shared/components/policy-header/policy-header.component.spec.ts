import { PolicyHeaderComponent } from "./policy-header.component";

function setup() {

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new PolicyHeaderComponent();
		}
	};

	return builder;
}

describe("PolicyHeaderComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
