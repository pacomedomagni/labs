import { TextOptionsComponent } from "./text-options.component";

function setup() {
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new TextOptionsComponent();
		}
	};

	return builder;
}

describe("TextOptionsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
