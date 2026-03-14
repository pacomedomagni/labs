import { ApiService } from "@modules/core/services/_index";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { PolicyQuery } from "../stores/policy-query";
import { PolicyService } from "./policy.service";
import { RegistrationService } from "./registration.service";
import { HomebaseParticipantSummaryResponse, Participant, Policy } from "@modules/shared/data/resources";

function setup() {
	const api = autoSpy(ApiService);
	api.get.mockReturnValue(of({}));

	const registrationService = autoSpy(RegistrationService);
	const policyQuery = autoSpy(PolicyQuery);
	const builder = {
		api,
		registrationService,
		policyQuery,
		default() {
			return builder;
		},
		build() {
			return new PolicyService(api, registrationService, policyQuery);
		}
	};

	return builder;
}

describe("PolicyService", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	describe("getPolicy", () => {
		it("should call api.get with correct URI", (done) => {
			const { build, api } = setup().default();
			const service = build();
			const mockPolicy = { policyNumber: "123456789", participants: [] } as Policy;
			const mockSummaries: HomebaseParticipantSummaryResponse[] = [];

			api.get.mockReturnValueOnce(of(mockPolicy)).mockReturnValueOnce(of(mockSummaries));

			service.getPolicy("123456789").subscribe(() => {
				expect(api.get).toHaveBeenCalledWith({ uri: "/CustomerService/Policy/Search/ByPolicy/123456789" });
				done();
			});
		});

		it("should call getHomebaseParticipantsSummaries after fetching policy", (done) => {
			const { build, api } = setup().default();
			const service = build();
			const mockPolicy = { policyNumber: "123456789", participants: [{ telematicsId: "TEL123" }] } as Policy;
			const mockSummaries: HomebaseParticipantSummaryResponse[] = [];

			api.get.mockReturnValueOnce(of(mockPolicy)).mockReturnValueOnce(of(mockSummaries));

			service.getPolicy("123456789").subscribe(() => {
				expect(api.get).toHaveBeenCalledWith({ uri: "/CustomerService/Policy/123456789/TMXSummaries" });
				done();
			});
		});

		it("should initialize homebaseParticipantSummaryResponse on participants", (done) => {
			const { build, api } = setup().default();
			const service = build();
			const mockPolicy = { policyNumber: "123456789", participants: [{ telematicsId: "TEL123" }] } as Policy;
			const mockSummaries: HomebaseParticipantSummaryResponse[] = [];

			api.get.mockReturnValueOnce(of(mockPolicy)).mockReturnValueOnce(of(mockSummaries));

			service.getPolicy("123456789").subscribe((policy) => {
				expect(policy.participants[0].homebaseParticipantSummaryResponse).toBeDefined();
				done();
			});
		});
	});

	describe("getHomebaseParticipantsSummaries", () => {
		it("should call api.get with correct URI", (done) => {
			const { build, api } = setup().default();
			const service = build();
			const mockPolicy = { policyNumber: "123456789", participants: [] } as Policy;
			const mockSummaries: HomebaseParticipantSummaryResponse[] = [];

			api.get.mockReturnValue(of(mockSummaries));

			service.getHomebaseParticipantsSummaries("123456789", mockPolicy).subscribe(() => {
				expect(api.get).toHaveBeenCalledWith({ uri: "/CustomerService/Policy/123456789/TMXSummaries" });
				done();
			});
		});

		it("should match summaries to participants by telematicsId", (done) => {
			const { build, api } = setup().default();
			const service = build();
			const mockPolicy = {
				policyNumber: "123456789",
				participants: [
					{ telematicsId: "TEL123", homebaseParticipantSummaryResponse: new HomebaseParticipantSummaryResponse() } as unknown as Participant,
					{ telematicsId: "TEL456", homebaseParticipantSummaryResponse: new HomebaseParticipantSummaryResponse() } as unknown as Participant
				]
			} as Policy;
			const mockSummaries = [
				{ telematicsId: "TEL123", adEnrolled: true, ubiEnrolled: false } as HomebaseParticipantSummaryResponse,
				{ telematicsId: "TEL456", adEnrolled: false, ubiEnrolled: true } as HomebaseParticipantSummaryResponse
			];

			api.get.mockReturnValue(of(mockSummaries));

			service.getHomebaseParticipantsSummaries("123456789", mockPolicy).subscribe(() => {
				expect(mockPolicy.participants[0].homebaseParticipantSummaryResponse.adEnrolled).toBe(true);
				expect(mockPolicy.participants[0].homebaseParticipantSummaryResponse.ubiEnrolled).toBe(false);
				expect(mockPolicy.participants[1].homebaseParticipantSummaryResponse.adEnrolled).toBe(false);
				expect(mockPolicy.participants[1].homebaseParticipantSummaryResponse.ubiEnrolled).toBe(true);
				done();
			});
		});

		it("should not update participant if no matching summary found", (done) => {
			const { build, api } = setup().default();
			const service = build();
			const originalSummary = new HomebaseParticipantSummaryResponse();
			const mockPolicy = {
				policyNumber: "123456789",
				participants: [
					{ telematicsId: "TEL123", homebaseParticipantSummaryResponse: originalSummary } as unknown as Participant
				]
			} as Policy;
			const mockSummaries = [
				{ telematicsId: "TEL999", adEnrolled: true, ubiEnrolled: true } as HomebaseParticipantSummaryResponse
			];

			api.get.mockReturnValue(of(mockSummaries));

			service.getHomebaseParticipantsSummaries("123456789", mockPolicy).subscribe(() => {
				expect(mockPolicy.participants[0].homebaseParticipantSummaryResponse).toBe(originalSummary);
				done();
			});
		});
	});
});
