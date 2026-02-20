import { ApiService } from "@modules/core/services/_index";
import { RegistrationService } from "@modules/customer-service/shared/services/_index";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { NotificationService } from "@pgr-cla/core-ui-components";
import { CommercialPolicyQuery } from "../stores/_index";
import { CommercialPolicyService } from "./comm-policy.service";

function setup() {
	const api = autoSpy(ApiService);
	api.get.mockReturnValue(of({}));
	api.post.mockReturnValue(of({}));

	const registrationService = autoSpy(RegistrationService);
	const policyQuery = autoSpy(CommercialPolicyQuery);
	const notificationService = autoSpy(NotificationService);

	const builder = {
		api,
		registrationService,
		policyQuery,
		default() {
			return builder;
		},
		build() {
			return new CommercialPolicyService(notificationService, api, registrationService, policyQuery);
		}
	};

	return builder;
}

describe("CommercialPolicyService", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("should call getPolicy", () => {
		const { build, api } = setup().default();
		const component = build();

		component.getPolicy("123").subscribe();
		expect(api.get).toHaveBeenCalledWith({ uri: "/customerService/commercialLines/Search/ByPolicy/123" });
	});

	it("should call activateDevice", () => {
		const { build, api } = setup().default();
		const component = build();

		component.activateDevice("123", "123");
		expect(api.get).toHaveBeenCalledWith({ uri: "/customerService/commercialLines/Search/ByPolicy/123" });
	});

	it("should call reEnroll", () => {
		const { build, api } = setup().default();
		const component = build();

		component.reEnroll("123");
		expect(api.post).toHaveBeenCalledWith({
			uri: "/customerService/commercialLines/removeOptOutRequest",
			payload: "123"
		});
	});

	it("should call replaceDevice", () => {
		const { build, api } = setup().default();
		const component = build();

		component.replaceDevice("123");
		expect(api.post).toHaveBeenCalledWith({
			uri: "/customerService/commercialLines/replaceDevice",
			payload: "123"
		});
	});

	it("should call connectionTimeline", () => {
		const { build, api } = setup().default();
		const component = build();

		component.connectionTimeline("123", {
			programType: "",
			participantSeqId: 123,
			isCommunicationAllowed: true,
			wirelessStatus: "",
			participantID: "123",
			deviceSeqId: null,
			status: null,
			reasonCode: null,
			changeDate: null,
			YMM: null,
			ymm: null,
			vin: "ABC",
			vehicleSeqId: null,
			deviceReportedVIN: null,
			deviceStatus: null,
			deviceType: null,
			serialNumber: null,
			sim: null,
			enrolledDate: null,
			shipDate: null,
			firstContactDate: null,
			lastContactDate: null,
			returnDate: null,
			returnReason: null,
			abandonDate: null,
			deviceLocation: null,
			orderId: null,
			features: {},
			deviceReceivedDate: {},
			deviceAbandonedDate: {},
			extenders: [],
			messages: []

		});
		expect(api.get).toBeCalledTimes(1);

	});

	it("should call markAbandon", () => {
		const { build, api } = setup().default();
		const component = build();

		component.markAbandon("123", 123, "123", 0, null);
		expect(api.post).toBeCalledTimes(1);
	});

});
