import { ApiService } from "@modules/core/services/_index";
import { RegistrationService } from "@modules/customer-service/shared/services/_index";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { ArePolicyQuery } from "../stores/_index";

import { ArePolicyService } from "./are-policy.service";
import { HomebaseParticipantSummaryResponse, Policy } from "@modules/shared/data/resources";

function setup() {
	const api = autoSpy(ApiService);
	api.get.mockReturnValue(of({}));

	const registrationService = autoSpy(RegistrationService);
	const policyQuery = autoSpy(ArePolicyQuery);

	const builder = {
		api,
		registrationService,
		policyQuery,
		default() {
			return builder;
		},
		build() {
			return new ArePolicyService(api, registrationService, policyQuery);
		}
	};

	return builder;
}

describe("ArePolicyService", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("should get homebase participants summaries and update the query", () => {

		const { build, api, policyQuery } = setup().default();
		const service = build();

		const policyNumber = "12345";
		const mockPolicy: Policy = {
			participants: [
				{
					homebaseParticipantSummaryResponse: null,
					areDetails: undefined,
					mobileDeviceDetails: undefined,
					pluginDeviceDetails: undefined,
					registrationDetails: undefined,
					snapshotDetails: undefined,
					telematicsId: "",
					extenders: [],
					messages: []
				},
				{
					homebaseParticipantSummaryResponse: null,
					areDetails: undefined,
					mobileDeviceDetails: undefined,
					pluginDeviceDetails: undefined,
					registrationDetails: undefined,
					snapshotDetails: undefined,
					telematicsId: "",
					extenders: [],
					messages: []
				}
			],
			areDetails: undefined,
			channelIndicator: "",
			policyNumber: "",
			policyPeriodDetails: [],
			snapshotDetails: undefined,
			extenders: [],
			messages: []
		};

		const mockSummaries: HomebaseParticipantSummaryResponse[] = [
			new HomebaseParticipantSummaryResponse(),
			new HomebaseParticipantSummaryResponse()
		];

		api.get.mockReturnValue(of(mockSummaries));

		service.getHomebaseParticipantsSummaries(policyNumber, mockPolicy).subscribe(() => {

			expect(api.get).toHaveBeenCalledWith({
				uri: `/CustomerService/Policy/${policyNumber}/TMXSummaries`
			});
			expect(policyQuery.updatePolicyParticipantsHomebaseSummaries).toHaveBeenCalledWith(mockPolicy.participants.map((participant, index) => {
				participant.homebaseParticipantSummaryResponse = mockSummaries[index];
				return participant.homebaseParticipantSummaryResponse;
			}));
		});
	});

});

