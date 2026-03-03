import { AppHeaderComponent } from "./app-header.component";

function setup() {

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new AppHeaderComponent();
		}
	};

	return builder;
}

describe("AppHeaderComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
