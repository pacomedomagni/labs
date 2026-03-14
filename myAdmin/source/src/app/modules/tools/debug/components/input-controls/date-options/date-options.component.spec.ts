import { DateOptionsComponent } from "./date-options.component";

function setup() {
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new DateOptionsComponent();
		}
	};

	return builder;
}

describe("DateOptionsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
