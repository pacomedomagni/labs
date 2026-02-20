import { PhoneNumberControlComponent } from "../_index";

function setup() {
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new PhoneNumberControlComponent();
		}
	};

	return builder;
}

describe("PhoneNumberControlComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
