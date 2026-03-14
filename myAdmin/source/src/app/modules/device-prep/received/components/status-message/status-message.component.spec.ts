import { StatusMessageComponent } from "./status-message.component";

function setup() {

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new StatusMessageComponent();
		}
	};

	return builder;
}

describe("StatusMessageComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
