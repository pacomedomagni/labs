import { ApiService } from "@modules/core/services/_index";
import { RegistrationService } from "@modules/customer-service/shared/services/_index";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { SnapshotPolicyQuery } from "../stores/_index";
import { SnapshotPolicyService } from "./snapshot-policy.service";
import { HomebaseParticipantSummaryResponse, Policy } from "@modules/shared/data/resources";

function setup() {
    const api = autoSpy(ApiService);
    api.get.mockReturnValue(of({}));
    api.put.mockReturnValue(of({}));

    const registrationService = autoSpy(RegistrationService);
    registrationService.getRegistrationByPolicy.mockReturnValue(of([]));

    const policyQuery = autoSpy(SnapshotPolicyQuery);

    const builder = {
        api,
        registrationService,
        policyQuery,
        default() {
            return builder;
        },
        build() {
            return new SnapshotPolicyService(api, registrationService, policyQuery);
        }
    };

    return builder;
}

describe("SnapshotPolicyService", () => {

    it("should create", () => {
        const { build } = setup().default();
        const service = build();
        expect(service).toBeTruthy();
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