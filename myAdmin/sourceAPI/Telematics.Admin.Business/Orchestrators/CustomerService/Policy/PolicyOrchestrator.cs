using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Progressive.AppLogger.NetCore;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService.Flagr;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Business.ResponseModels.CustomerService.Policy;
using Progressive.Telematics.Admin.Business.ResponseModels.CustomerService.Registration;
using Progressive.Telematics.Admin.Services.Api;
using Progressive.Telematics.Admin.Services.Database;
using Progressive.Telematics.Admin.Services.Models.ClaimsRegistrationApi;
using Progressive.Telematics.Admin.Services.Wcf;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;

namespace Progressive.Telematics.Admin.Business.Orchestrators.CustomerService
{
    [SingletonService]
    public interface IPolicyOrchestrator
    {
        Task<GetPolicyResponse> GetPolicy(
            string policyNumber,
            IRolloutHelper rolloutHelper,
            short? policySuffix = null,
            short? expirationYear = null
        );
        Task<GetPolicyByRegistrationCodeResponse> GetPolicyByRegistrationCode(
            string registrationCode,
            IRolloutHelper rolloutHelper
        );
        Task<GetPolicyByDeviceSerialNumberResponse> GetPolicyByDeviceSerialNumber(
            string serialNumber
        );
        Task<UpdateMailingAddressResponse> UpdateMailingAddress(
            string policyNumber,
            string contactName,
            string address1,
            string address2,
            string city,
            string state,
            string zipCode
        );
        Task<UpdateAppAssignmentResponse> UpdateAppAssignment(string policyNumber, string appName);
        Task<GetEligibleTransferParticipantsResponse> GetParticipantsEligibleForTransfer(
            string oldPolicyNumber,
            string newPolicyNumber
        );
        Task<TransferParticipantsResponse> TransferParticipants(Policy oldPolicy, Policy newPolicy);
        Task<GetParticipantResponse> GetParticipantByTelematicsId(
            string policyNumber,
            string telematicsId,
            IRolloutHelper rolloutHelper
        );
        Task<GetHomebaseParticipantSummaryResponse> GetAllParticipantsHomebaseSummaryOnPolicy(
            string policyNumber
        );

        Task<GetParticipantResponse> GetParticipantBySeqId(
            string policyNumber,
            int participantSeqId,
            IRolloutHelper rolloutHelper
        );
        Task<GetPolicyResponse> GetPolicyByMobileIdentifier(Guid mobileId, IRolloutHelper rolloutHelper);
        Task<GetTransactionAlertResponse> GetTransactionAlert(string policyNumber);
    }

    public class PolicyOrchestrator : IPolicyOrchestrator
    {
        private readonly IPolicyApi policyApi;
        private readonly IHomebaseDAL homebaseDAL;
        private readonly IPolicyService policyService;
        private readonly IPolicyDAL policyDAL;
        private readonly IArePolicyOrchestrator areOrchestrator;
        private readonly IHomebaseParticipantManagementApi _homebaseParticipantManagement;
        private readonly ISnapshotPolicyOrchestrator snapshotOrchestrator;
        private readonly IRegistrationOrchestrator registrationOrchestrator;
        private readonly IClaimsRegistrationApi _claimsRegistrationApi;
        private readonly IMapper mapper;
        private readonly ILogger<PolicyOrchestrator> logger;

        public PolicyOrchestrator(
            IPolicyApi policyApi,
            IHomebaseDAL homebaseDAL,
            IPolicyService policyService,
            IPolicyDAL policyDAL,
            IArePolicyOrchestrator areOrchestrator,
            IHomebaseParticipantManagementApi homebaseParticipantManagement,
            ISnapshotPolicyOrchestrator snapshotOrchestrator,
            IRegistrationOrchestrator registrationOrchestrator,
            IClaimsRegistrationApi claimsRegistrationApi,
            IMapper mapper,
            ILogger<PolicyOrchestrator> logger
        )
        {
            this.policyApi = policyApi;
            this.policyService = policyService;
            this.policyDAL = policyDAL;
            this.homebaseDAL = homebaseDAL;
            this.areOrchestrator = areOrchestrator;
            this.snapshotOrchestrator = snapshotOrchestrator;
            this._homebaseParticipantManagement = homebaseParticipantManagement;
            this.registrationOrchestrator = registrationOrchestrator;
            this._claimsRegistrationApi = claimsRegistrationApi;
            this.mapper = mapper;
            this.logger = logger;
        }

        public async Task<GetPolicyResponse> GetPolicy(
            string policyNumber,
            IRolloutHelper rolloutHelper,
            short? policySuffix = null,
            short? expirationYear = null
        )
        {
            using var logginScope = logger.BeginPropertyScope(
                (LoggingConstants.PolicyNumber, policyNumber),
                (LoggingConstants.PolicySuffix, policySuffix),
                (LoggingConstants.PolicyExpirationYear, expirationYear)
            );

            try
            {
                var snapshotTask = snapshotOrchestrator.GetPolicySummary(
                    policyNumber,
                    policySuffix,
                    expirationYear
                );
                var areTask = areOrchestrator.GetPolicySummary(policyNumber);

                var (snapshotPolicy, arePolicy) = await (snapshotTask, areTask);

                if (snapshotPolicy == null && arePolicy == null)
                {
                    logger.LogWarning("No policy data found.");
                    return new GetPolicyResponse.SuccessWithNoResults
                    {
                        Policy = CreateNotFoundModel()
                    };
                }

                var policy = MergePolicyData(snapshotPolicy, arePolicy);

                var selectedTerm = policySuffix.HasValue
                    ? policy.PolicyPeriodDetails.First(x => x.PolicySuffix == policySuffix)
                    : policy.PolicyPeriodDetails?.OrderByDescending(x => x.PolicySuffix).First();
                selectedTerm?.AddExtender("IsSelectedTerm", true);

                if (!(await FetchRegistrationData(policy, rolloutHelper)))
                {
                    return new GetPolicyResponse.NoRegistrationData();
                }

                return new GetPolicyResponse.Success { Policy = policy };
            }
            catch (Exception ex)
            {
                logger.LogError(
                    LoggingEvents.PolicyOrchestrator_UnknownError,
                    ex,
                    $"Unknown error occurred in {nameof(GetPolicy)}"
                );
                return new GetPolicyResponse.Failure();
            }
        }

        public async Task<GetPolicyResponse> GetHomebasePolicySummary(
            string policyNumber,
            short? policySuffix = null,
            short? expirationYear = null
        )
        {
            using var logginScope = logger.BeginPropertyScope(
                (LoggingConstants.PolicyNumber, policyNumber),
                (LoggingConstants.PolicySuffix, policySuffix),
                (LoggingConstants.PolicyExpirationYear, expirationYear)
            );

            try
            {
                var homebaseTask = _homebaseParticipantManagement.GetPolicySummary(policyNumber);
                var homebasePolicy = await homebaseTask;

                if (homebasePolicy == null)
                {
                    logger.LogWarning("No policy data found.");
                    return new GetPolicyResponse.SuccessWithNoResults
                    {
                        Policy = CreateNotFoundModel()
                    };
                }
                return new GetPolicyResponse.Success { homebasePolicySummary = homebasePolicy };
            }
            catch (Exception ex)
            {
                logger.LogError(
                    LoggingEvents.PolicyOrchestrator_UnknownError,
                    ex,
                    $"Unknown error occurred in {nameof(GetPolicy)}"
                );
                return new GetPolicyResponse.Failure();
            }
        }

        

        public async Task<GetPolicyByRegistrationCodeResponse> GetPolicyByRegistrationCode(
            string registrationCode,
            IRolloutHelper rolloutHelper
        )
        {
            using var logginScope = logger.BeginPropertyScope(
                (LoggingConstants.MobileRegistrationCode, registrationCode)
            );

            try
            {
                var mobileRegistrations = await GetRegistrations(registrationCode);  

                var snapshotTask = snapshotOrchestrator.GetSnapshotPoliciesByMobileRegistrations(mobileRegistrations);
                var areTask = areOrchestrator.GetArePoliciesByMobileRegistrations(mobileRegistrations);

                var (snapshotPolicies, arePolicies) = await (snapshotTask, areTask);

                if (snapshotPolicies == null && arePolicies == null)
                {
                    logger.LogWarning("No policy data found.");
                    return new GetPolicyByRegistrationCodeResponse.SuccessWithNoResults
                    {
                        Policies = new List<Policy> { CreateNotFoundModel() }
                    };
                }
                var aggregatedPolicies = new List<Policy>()
                    .AddRangeSafe(snapshotPolicies)
                    .AddRangeSafe(arePolicies);

                var policyNumbers = aggregatedPolicies.Select(x => x.PolicyNumber).Distinct();

                if (policyNumbers.Count() == 1)
                {
                    var policy = MergePolicyData(
                        snapshotPolicies?.FirstOrDefault(),
                        arePolicies?.FirstOrDefault()
                    );
                    var selectedTerm = policy.PolicyPeriodDetails
                        ?.OrderByDescending(x => x.PolicySuffix)
                        .First();
                    selectedTerm?.AddExtender("IsSelectedTerm", true);

                    if (!(await FetchRegistrationData(policy, rolloutHelper, true)))
                    {
                        return new GetPolicyByRegistrationCodeResponse.NoRegistrationData();
                    }

                    return new GetPolicyByRegistrationCodeResponse.Success
                    {
                        Policies = new List<Policy> { policy }
                    };
                }
                else
                {
                    var policies = new List<Policy>();
                    policyNumbers.ForEach(x =>
                    {
                        var policy = MergePolicyData(
                            snapshotPolicies?.FirstOrDefault(y => y.PolicyNumber == x),
                            arePolicies?.FirstOrDefault(y => y.PolicyNumber == x)
                        );

                        policies.Add(policy);
                    });
                    return new GetPolicyByRegistrationCodeResponse.Success { Policies = policies };
                }
            }
            catch (Exception ex)
            {
                logger.LogError(
                    LoggingEvents.PolicyOrchestrator_UnknownError,
                    ex,
                    $"Unknown error occurred in {nameof(GetPolicyByRegistrationCode)}"
                );
                return new GetPolicyByRegistrationCodeResponse.Failure();
            }
        }

        public async Task<GetPolicyByDeviceSerialNumberResponse> GetPolicyByDeviceSerialNumber(
            string serialNumber
        )
        {
            using var logginScope = logger.BeginPropertyScope(
                (LoggingConstants.DeviceSerialNumber, serialNumber)
            );

            try
            {
                var policy = await snapshotOrchestrator.GetPolicyByDeviceSerialNumber(serialNumber);
                var selectedTerm = policy.PolicyPeriodDetails
                    ?.OrderByDescending(x => x.PolicySuffix)
                    .First();
                selectedTerm?.AddExtender("IsSelectedTerm", true);
                return new GetPolicyByDeviceSerialNumberResponse.Success { Policy = policy };
            }
            catch (Exception ex)
            {
                logger.LogError(
                    LoggingEvents.PolicyOrchestrator_UnknownError,
                    ex,
                    $"Unknown error occurred in {nameof(GetPolicyByDeviceSerialNumber)}"
                );
                return new GetPolicyByDeviceSerialNumberResponse.Failure();
            }
        }

        public async Task<UpdateMailingAddressResponse> UpdateMailingAddress(
            string policyNumber,
            string contactName,
            string address1,
            string address2,
            string city,
            string state,
            string zipCode
        )
        {
            using var logginScope = logger.BeginPropertyScope(
                (LoggingConstants.PolicyNumber, policyNumber)
            );

            try
            {
                await policyService.UpdateAddress(
                    policyNumber,
                    contactName,
                    address1,
                    address2,
                    city,
                    state,
                    zipCode
                );
                return new UpdateMailingAddressResponse.Success();
            }
            catch (Exception ex)
            {
                logger.LogError(
                    LoggingEvents.PolicyOrchestrator_UnknownError,
                    ex,
                    $"Unknown error occurred in {nameof(UpdateMailingAddress)}"
                );
                return new UpdateMailingAddressResponse.Failure();
            }
        }

        public async Task<UpdateAppAssignmentResponse> UpdateAppAssignment(
            string policyNumber,
            string appName
        )
        {
            using var logginScope = logger.BeginPropertyScope(
                (LoggingConstants.PolicyNumber, policyNumber),
                (LoggingConstants.AppName, appName)
            );

            try
            {
                var successful = await policyApi.SetPolicyAppAssignment(policyNumber, appName);
                if (successful)
                {
                    return new UpdateAppAssignmentResponse.Success();
                }
                else
                {
                    logger.LogError(
                        LoggingEvents.PolicyOrchestrator_UpdateAppAssignment_Failure,
                        "Failure to update app assignment"
                    );
                    return new UpdateAppAssignmentResponse.Failure();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(
                    LoggingEvents.PolicyOrchestrator_UnknownError,
                    ex,
                    $"Unknown error occurred in {nameof(UpdateAppAssignment)}"
                );
                return new UpdateAppAssignmentResponse.Failure();
            }
        }

        public async Task<GetEligibleTransferParticipantsResponse> GetParticipantsEligibleForTransfer(
            string oldPolicyNumber,
            string newPolicyNumber
        )
        {
            using var logginScope = logger.BeginPropertyScope(
                ($"Old{LoggingConstants.PolicyNumber}", oldPolicyNumber),
                ($"New{LoggingConstants.PolicyNumber}", newPolicyNumber)
            );
            try
            {
                var participants = await snapshotOrchestrator.GetParticipantsEligibleForTransfer(
                    oldPolicyNumber,
                    newPolicyNumber
                );
                return new GetEligibleTransferParticipantsResponse.Success
                {
                    EligibleParticipants = participants
                };
            }
            catch (Exception ex)
            {
                logger.LogError(
                    LoggingEvents.PolicyOrchestrator_UnknownError,
                    ex,
                    $"Unknown error occurred in {nameof(GetParticipantsEligibleForTransfer)}"
                );
                return new GetEligibleTransferParticipantsResponse.Failure();
            }
        }

        public async Task<TransferParticipantsResponse> TransferParticipants(
            Policy oldPolicy,
            Policy newPolicy
        )
        {
            using var logginScope = logger.BeginPropertyScope(
                ($"Old{LoggingConstants.PolicyNumber}", oldPolicy.PolicyNumber),
                ($"New{LoggingConstants.PolicyNumber}", newPolicy.PolicyNumber)
            );

            try
            {
                var success = await snapshotOrchestrator.TransferParticipants(oldPolicy, newPolicy);
                if (success)
                    return new TransferParticipantsResponse.Success();
                else
                    return new TransferParticipantsResponse.Failure();
            }
            catch (Exception ex)
            {
                logger.LogError(
                    LoggingEvents.PolicyOrchestrator_UnknownError,
                    ex,
                    $"Unknown error occurred in {nameof(TransferParticipants)}"
                );
                return new TransferParticipantsResponse.Failure();
            }
        }

        public async Task<GetParticipantResponse> GetParticipantByTelematicsId(
            string policyNumber,
            string telematicsId,
            IRolloutHelper rolloutHelper
        )
        {
            using var logginScope = logger.BeginPropertyScope(
                (LoggingConstants.TelematicsId, telematicsId)
            );

            try
            {
                var policyResponse = await GetPolicy(policyNumber, rolloutHelper);
                if (!policyResponse.Successful)
                    return new GetParticipantResponse.Failure();

                var participant = (
                    (GetPolicyResponse.Success)policyResponse
                ).Policy.Participants.FirstOrDefault(x => x.TelematicsId == telematicsId);
                return new GetParticipantResponse.Success { Participant = participant };
            }
            catch (Exception ex)
            {
                logger.LogError(
                    LoggingEvents.PolicyOrchestrator_UnknownError,
                    ex,
                    $"Unknown error occurred in {nameof(GetParticipantByTelematicsId)}"
                );
                return new GetParticipantResponse.Failure();
            }
        }

        public async Task<GetHomebaseParticipantSummaryResponse> GetAllParticipantsHomebaseSummaryOnPolicy(
            string policyNumber
        )
        {
            try
            {
                using var logginScope = logger.BeginPropertyScope((LoggingConstants.PolicyNumber, policyNumber));

                var policyResponse = await GetHomebasePolicySummary(policyNumber);

                if (((GetPolicyResponse.Success)policyResponse).homebasePolicySummary != null && ((GetPolicyResponse.Success)policyResponse).Successful)
                {
                    return new GetHomebaseParticipantSummaryResponse.Success { Participants = ((GetPolicyResponse.Success)policyResponse).homebasePolicySummary.Participants };
                }
                else
                {
                    return new GetHomebaseParticipantSummaryResponse.NotFound();
                }
            }
            catch (Exception ex)
            {
                return new GetHomebaseParticipantSummaryResponse.Failure();
            }
        }

        public async Task<GetParticipantResponse> GetParticipantBySeqId(
            string policyNumber,
            int participantSeqId,
            IRolloutHelper rolloutHelper
        )
        {
            using var logginScope = logger.BeginPropertyScope(
                (LoggingConstants.ParticipantSeqId, participantSeqId)
            );

            try
            {
                var policyResponse = await GetPolicy(policyNumber, rolloutHelper);
                if (!policyResponse.Successful)
                    return new GetParticipantResponse.Failure();

                var participant = (
                    (GetPolicyResponse.Success)policyResponse
                ).Policy.Participants.FirstOrDefault(
                    x => x.SnapshotDetails?.ParticipantSeqId == participantSeqId
                );
                return new GetParticipantResponse.Success { Participant = participant };
            }
            catch (Exception ex)
            {
                logger.LogError(
                    LoggingEvents.PolicyOrchestrator_UnknownError,
                    ex,
                    $"Unknown error occurred in {nameof(GetParticipantBySeqId)}"
                );
                return new GetParticipantResponse.Failure();
            }
        }

        private Policy MergePolicyData(Policy snapshotPolicy, Policy arePolicy)
        {
            var policy = new Policy
            {
                PolicyNumber = snapshotPolicy?.PolicyNumber ?? arePolicy.PolicyNumber,
                Participants = new List<Participant>()
            };

            policy.ChannelIndicator = snapshotPolicy?.ChannelIndicator;
            policy.PolicyPeriodDetails = snapshotPolicy?.PolicyPeriodDetails;
            policy.SnapshotDetails = snapshotPolicy?.SnapshotDetails;
            policy.AreDetails = arePolicy?.AreDetails;

            policy.AddExtenders(snapshotPolicy?.Extenders);
            policy.AddExtenders(arePolicy?.Extenders);

            var telematicsIds = new List<string>()
                .AddRangeSafe(snapshotPolicy?.Participants?.Select(x => x.TelematicsId))
                .AddRangeSafe(arePolicy?.Participants?.Select(x => x.TelematicsId));

            telematicsIds
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct()
                .ForEach(x =>
                {
                    var participant = new Participant { TelematicsId = x };
                    var snapshotParticipant = snapshotPolicy?.Participants?.FirstOrDefault(
                        y => y.TelematicsId == x
                    );
                    var areParticipant = arePolicy?.Participants?.FirstOrDefault(
                        y => y.TelematicsId == x
                    );

                    participant.UBIFeatureActivationDateTime = snapshotParticipant?.UBIFeatureActivationDateTime;
                    participant.SnapshotDetails = snapshotParticipant?.SnapshotDetails;
                    participant.AreDetails = areParticipant?.AreDetails;
                    participant.PluginDeviceDetails = snapshotParticipant?.PluginDeviceDetails;
                    if (areParticipant == null)
                    {
                        participant.MobileDeviceDetails = snapshotParticipant?.MobileDeviceDetails;
                    }
                    else
                    {
                        participant.MobileDeviceDetails = areParticipant?.MobileDeviceDetails;
                        participant.MobileDeviceDetails.DeviceSeqId = snapshotParticipant?.MobileDeviceDetails.DeviceSeqId;
                        participant.MobileDeviceDetails.MobileDeviceAliasName = snapshotParticipant?.MobileDeviceDetails?.MobileDeviceAliasName; 
                    }

                    participant.AddExtenders(snapshotParticipant?.Extenders);
                    participant.AddExtenders(areParticipant?.Extenders);

                    policy.Participants.Add(participant);
                });

            //Remove once 3.0 is no longer available
            if (snapshotPolicy != null)
            {
                var threeOparticipants = ProcessThreeOhParticipants(snapshotPolicy);
                if (threeOparticipants.Count > 0)
                    policy.Participants.AddRange(threeOparticipants);
            }

            return policy;
        }

        private async Task<bool> FetchRegistrationData(Policy policy, IRolloutHelper rolloutHelper, bool bypassRollout = false)
        {
            var telematicsId = policy.Participants
                .Where(x => !string.IsNullOrWhiteSpace(x.TelematicsId))
                .Select(x => x.TelematicsId)
                .ToList();

            if (telematicsId.Count == 0)
            {
                return true;
            }

            var registrationResponse = await registrationOrchestrator.GetRegistrations(telematicsId, rolloutHelper, bypassRollout);
            if (!registrationResponse.Successful)
            {
                return false;
            }

            (((GetRegistrationResponse.Success)registrationResponse).Registrations).ForEach(
                x =>
                    policy.Participants
                        .FirstOrDefault(y => y.TelematicsId == x.ParticipantExternalId)
                        .RegistrationDetails = x
            );

            return true;
        }

        private List<Participant> ProcessThreeOhParticipants(Policy snapshotPolicy)
        {
            var participants = new List<Participant>();
            snapshotPolicy.Participants
                ?.Where(x => string.IsNullOrWhiteSpace(x.TelematicsId))
                .ForEach(x =>
                {
                    var participant = new Participant
                    {
                        SnapshotDetails = x.SnapshotDetails,
                        PluginDeviceDetails = x.PluginDeviceDetails,
                        MobileDeviceDetails = x.MobileDeviceDetails
                    };
                    participant.AddExtenders(x.Extenders);
                    participants.Add(participant);
                });
            return participants;
        }

        private Policy CreateNotFoundModel(string errorMessage = "Policy Not Found")
        {
            var model = new Policy { PolicyNumber = "-1" };
            model.AddMessage(MessageCode.Error, errorMessage);
            return model;
        }

        public async Task<GetPolicyResponse> GetPolicyByMobileIdentifier(Guid mobileId, IRolloutHelper rolloutHelper)
        {
            var participantExtId = await this.homebaseDAL.GetParticipantExternalIdAsync(mobileId);
            var DevSeqId = await this.homebaseDAL.GetDeviceSeqIdAsync(mobileId);

            var policyNumber = await this.policyDAL.GetPolicyNumberAsync(
                participantExtId,
                DevSeqId
            );
            if (policyNumber == null)
            {
                return null;
            }
            return await this.GetPolicy(policyNumber, rolloutHelper);
        }

        public async Task<GetTransactionAlertResponse> GetTransactionAlert(string policyNumber)
        {
            return new GetTransactionAlertResponse.Success() { Alert = await this.policyDAL.GetPolicyTransactionErrorAsync(policyNumber) };
        }

        private async Task<List<RegistrationsModel>> GetRegistrations(string registrationCode)
        {
            var mobileRegistrations = await _claimsRegistrationApi.GetMobileRegistrations(registrationCode);
            return mobileRegistrations?.GetAllRegistrations();
        }
    }
}
