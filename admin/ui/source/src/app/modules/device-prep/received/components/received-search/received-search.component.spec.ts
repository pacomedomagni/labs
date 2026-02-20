import { ReceivedSearchComponent } from "./received-search.component";

function setup() {

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new ReceivedSearchComponent();
		}
	};

	return builder;
}

describe("ReceivedSearchComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
