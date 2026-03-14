import { ApiService } from "@modules/core/services/_index";
import { MobileRegistrationStatus, RegistrationStatusUpdateAction } from "@modules/shared/data/enums";
import { Participant, Registration } from "@modules/shared/data/resources";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { RegistrationService } from "./registration.service";

const controller = "/CustomerService/Registration";

function setup() {
	const api = autoSpy(ApiService);
	api.get.mockReturnValue(of({}));
	api.post.mockReturnValue(of());
	api.put.mockReturnValue(of());

	const builder = {
		api,
		default() {
			return builder;
		},
		build() {
			return new RegistrationService(api);
		}
	};

	return builder;
}

describe("RegistrationService", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("should get registration", () => {
		const { build, api } = setup().default();
		const component = build();
		const telematicsId = "123";

		component.getRegistration(telematicsId);

		expect(api.get).toHaveBeenCalledWith({
			uri: `${controller}/${telematicsId}`
		});
	});

	it("should get registrations", () => {
		const { build, api } = setup().default();
		const component = build();

		const telematicsIds = ["123", "456"];
		component.getRegistrations(telematicsIds);

		expect(api.post).toHaveBeenCalledWith({
			uri: `${controller}`,
			payload: { telematicsIds }
		});
	});

	it("should get registration by policy", () => {
		const { build, api } = setup().default();
		const component = build();

		const policyNumber = "123";
		component.getRegistrationByPolicy(policyNumber);

		expect(api.get).toHaveBeenCalledWith({
			uri: `${controller}/ByPolicy/${policyNumber}`,
			options: undefined
		});
	});

	it("should unlock registration", () => {
		const { build, api } = setup().default();
		const component = build();

		const registration = { participantExternalId: "123" } as Registration;
		component.unlockRegistration(registration);

		expect(api.post).toHaveBeenCalledWith({
			uri: `${controller}/Unlock`,
			payload: { participantExternalId: "123" } as Registration
		});
	});

	it("should update registration code", () => {
		const { build, api } = setup().default();
		const component = build();

		const policyNumber = "123"; const newRegistrationCode = MobileRegistrationStatus.Authenticated; const participant = { telematicsId: "456" } as Participant; const conflictingRegistrationSeqIds = [];
		component.updateRegistrationCode(policyNumber, newRegistrationCode, participant, conflictingRegistrationSeqIds);

		expect(api.put).toHaveBeenCalledWith({
			uri: `${controller}/RegistrationCode`,
			payload: { policyNumber, newRegistrationCode, participant, conflictingRegistrationSeqIds },
			options: undefined
		});
	});

	it("should get conflicting registrations", () => {
		const { build, api } = setup().default();
		const component = build();

		const registrationCode = "8675309";
		component.getConflictingRegistrations(registrationCode);

		expect(api.get).toHaveBeenCalledWith({
			uri: `${controller}/RegistrationCode/${registrationCode}/Conflicts`,
			options: undefined
		});
	});

	it("should get update registration status", () => {
		const { build, api } = setup().default();
		const component = build();

		const policyNumber = "123"; const registrationSeqId = 1; const updateAction = RegistrationStatusUpdateAction.Enable; const telematicsId = "456";
		component.updateRegistrationStatus(policyNumber, registrationSeqId, telematicsId, updateAction);

		expect(api.put).toHaveBeenCalledWith({
			uri: `${controller}/RegistrationStatusCode`,
			payload: { policyNumber, registrationSeqId, telematicsId, updateAction }
		});
	});
});
