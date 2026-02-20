import { CommunicationDetailsComponent } from "./communication-details.component";

function setup() {
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new CommunicationDetailsComponent();
		}
	};

	return builder;
}

describe("CommunicationsDetailsComponent", () => {
	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
		expect(component.columns).toEqual(["create", "method", "reason", "serialNumber"]);
	});

});
