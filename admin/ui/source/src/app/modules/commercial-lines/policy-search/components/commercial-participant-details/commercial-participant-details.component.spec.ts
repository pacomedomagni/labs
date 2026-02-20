import { EnumService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { CommercialPolicyQuery } from "../../stores/_index";
import { CLParticipantDetailsComponent } from "./commercial-participant-details.component";

function setup() {

	const query = autoSpy(CommercialPolicyQuery);
	const enumService = autoSpy(EnumService);
	const builder = {
		query,
		default() {
			return builder;
		},
		build() {
			return new CLParticipantDetailsComponent(enumService, query);
		}
	};

	return builder;
}

describe("CLParticipantDetailsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
