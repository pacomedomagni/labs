using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Business.Resources.Resources.Snapshot;
using Progressive.Telematics.Admin.Services.Api;
using Progressive.Telematics.Admin.Services.Database;
using Progressive.Telematics.Admin.Services.Models.ClaimsRegistrationApi;
using Progressive.Telematics.Admin.Services.Wcf;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;

namespace Progressive.Telematics.Admin.Business.Orchestrators.CustomerService
{
    [SingletonService]
    public interface ISnapshotPolicyOrchestrator
    {
        Task<Policy> GetPolicySummary(string policyNumber, short? policySuffix = null, short? expirationYear = null);
        Task<List<Policy>> GetSnapshotPoliciesByMobileRegistrations(List<RegistrationsModel> mobileRegistrations);
        Task<Policy> GetPolicyByDeviceSerialNumber(string serialNumber);
        Task<List<Participant>> GetParticipantsEligibleForTransfer(string oldPolicyNumber, string newPolicyNumber);
        Task<bool> TransferParticipants(Policy oldPolicy, Policy newPolicy);
    }

    public class SnapshotPolicyOrchestrator : ISnapshotPolicyOrchestrator
    {
        private readonly ICommonApi _commonApi;
        private readonly IDeviceApi _deviceApi;
        private readonly IPolicyDeviceApi _policyDeviceApi;
        private readonly IPolicyService _policyService;
        private readonly IMobileActionsOrchestrator _mobileOrchestrator;
        private readonly IPluginActionsOrchestrator _pluginOrchestrator;
        private readonly IPolicyDAL _policyDAL;
        private readonly ILogger<SnapshotPolicyOrchestrator> _logger;
        private readonly IMapper _mapper;
        private readonly IScoringAlgorithmsOrchestrator _scoringAlgorithmsOrchestrator;
        private readonly IClaimsRegistrationApi _claimsRegistrationApi;

        public SnapshotPolicyOrchestrator(ICommonApi commonApi,
            IDeviceApi deviceApi,
            IPolicyDeviceApi policyDeviceApi,
            IPolicyService policyService,
            IMobileActionsOrchestrator mobileOrchestrator,
            IPluginActionsOrchestrator pluginOrchestrator,
            IPolicyDAL policyDAL,
            ILogger<SnapshotPolicyOrchestrator> logger,
            IMapper mapper,
            IScoringAlgorithmsOrchestrator scoringAlgorithmsOrchestrator,
            IClaimsRegistrationApi claimsRegistrationApi)
        {
            _commonApi = commonApi;
            _deviceApi = deviceApi;
            _policyDeviceApi = policyDeviceApi;
            _policyService = policyService;
            _mobileOrchestrator = mobileOrchestrator;
            _pluginOrchestrator = pluginOrchestrator;
            _policyDAL = policyDAL;
            _logger = logger;
            _mapper = mapper;
            _scoringAlgorithmsOrchestrator = scoringAlgorithmsOrchestrator;
            _claimsRegistrationApi = claimsRegistrationApi;
        }

        public async Task<Policy> GetPolicySummary(string policyNumber, short? policySuffix = null, short? expirationYear = null)
        {
            try
            {
                WcfPolicyService.GetPolicyResponse response = await _policyService.GetPolicy(policyNumber: policyNumber, policySuffix: policySuffix, expirationYear: expirationYear);
                return await CreatePolicyModel(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(LoggingEvents.PolicyOrchestrator_GetPolicy_ProcessingError, ex, "Error processing policy summary");
                return null;
            }
        }

        public async Task<List<Policy>> GetSnapshotPoliciesByMobileRegistrations(List<RegistrationsModel> mobileRegistrations)
        {
            try
            {
                if (mobileRegistrations == null)
                {
                    return null;
                }

                List<Registration> data = new List<Registration>();

                data = await GetParticipantRegistrationInfo(mobileRegistrations);

                var model = new List<Policy>();

                if (data == null)
                {
                    return null;
                }

                if (data.Count == 1 || data.DistinctBy(x => x.PolicyParticipant.PolicyNumber).Count() == 1)
                {
                    Policy policy = await GetPolicySummary(data.First().PolicyParticipant.PolicyNumber);
                    model.Add(policy);
                }
                else
                    data.ForEach(x =>
                    {
                        Policy policy = _mapper.Map<Policy>(x);
                        policy
                            .AddExtender("DriverName", $"{x.PolicyParticipant.DriverFirstName} {x.PolicyParticipant.DriverLastName}")
                            .AddExtender("ParticipantStatus", x.PolicyParticipant.PJStatus)
                            .AddExtender("StatusSummary", data.FirstOrDefault(y => y.ParticipantExternalId == x.ParticipantExternalId)?.StatusSummary);
                        model.Add(policy);
                    });

                return model.Count != 0 ? model : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(LoggingEvents.PolicyOrchestrator_GetPolicy_ProcessingError, ex, "Error processing policy summary");
                return null;
            }
        }

        private async Task<List<Registration>> GetParticipantRegistrationInfo(List<RegistrationsModel> mobileRegistrations)
        {
            var result = new List<Registration>();

            var registrationsTmxIds = mobileRegistrations.Select(x => x.TelematicsId).Distinct().ToList();
            var participantsData = new Dictionary<string, SnapshotMobileParticipant>();

            var participantInfoTasks = registrationsTmxIds.Select(x => _policyDAL.GetDriverDataByParticipantExternalId(x))
                .ToList();
            var participantsInfoResults = await Task.WhenAll(participantInfoTasks);
            for (int i = 0; i < registrationsTmxIds.Count; i++)
            {
                if (participantsInfoResults[i] != null)
                {
                    participantsData.Add(registrationsTmxIds[i], participantsInfoResults[i]);
                }
            }

            result = mobileRegistrations
                .Where(x => participantsData.ContainsKey(x.TelematicsId))
                .Select(x => new Registration
            {
                ParticipantExternalId = x.TelematicsId,
                StatusSummary = RegistrationsModel.MapMobileRegistrationStatusSummary(x.StatusSummary),
                PolicyParticipant = new PolicyDriverData
                {
                    PolicyNumber = participantsData[x.TelematicsId].PolicyNumber,
                    PJStatus = participantsData[x.TelematicsId].Status,
                    DriverFirstName = participantsData[x.TelematicsId].DriverFirstName,
                    DriverLastName = participantsData[x.TelematicsId].DriverLastName
                },
            }).ToList();
            
            return result.Count != 0 ? result : null;
        }

        public async Task<Policy> GetPolicyByDeviceSerialNumber(string serialNumber)
        {
            try
            {
                WcfPolicyService.GetPolicyResponse data = await _policyService.GetPolicy(deviceSerialNumber: serialNumber);
                Policy model = await CreatePolicyModel(data);
                return model;
            }
            catch (Exception ex)
            {
                _logger.LogError(LoggingEvents.PolicyOrchestrator_GetPolicy_ProcessingError, ex, "Error processing policy summary");
                return null;
            }
        }

        public async Task<List<Participant>> GetParticipantsEligibleForTransfer(string oldPolicyNumber, string newPolicyNumber)
        {
            try
            {
                Task<Policy> oldTask = GetPolicySummary(oldPolicyNumber);
                Task<Policy> newTask = GetPolicySummary(newPolicyNumber);

                (Policy oldPolicy, Policy newPolicy) = await (oldTask, newTask);

                IEnumerable<Participant> participants = oldPolicy.Participants.Intersect(newPolicy.Participants, (p1, p2) =>
                {
                    return p1.SnapshotDetails.EnrollmentExperience == DeviceExperience.Device && p2.SnapshotDetails.EnrollmentExperience == DeviceExperience.Device &&
                        p1.SnapshotDetails.VehicleDetails?.VIN == p2.SnapshotDetails.VehicleDetails?.VIN &&
                        p2.PluginDeviceDetails?.DeviceSeqId != 0;
                });

                return participants.ToList();
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task<bool> TransferParticipants(Policy oldPolicy, Policy newPolicy)
        {
            try
            {
                WcfPolicyService.PolicyMergeResponse result = await _policyService.TransferParticipants(oldPolicy, newPolicy);
                if (result.ResponseErrors.Length == 0) return true;
                else return false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }


        private async Task<Policy> CreatePolicyModel(WcfPolicyService.GetPolicyResponse response)
        {
            if (response.ResponseStatus != WcfPolicyService.ResponseStatus.Success || response.Policy == null)
                return null;
            Policy policy = _mapper.Map<Policy>(response.Policy);

            if (response.Policy.IsMaxPolicyPeriodFlag)
                policy.AddExtender("IsMaxPolicyPeriod", response.Policy.IsMaxPolicyPeriodFlag);

            if (response.Policy.IsMigratedFromTrial)
                policy.AddExtender("IsMigratedFromTrial", response.Policy.IsMigratedFromTrial);

            foreach (Participant x in policy.Participants)
            {
                x.UBIFeatureActivationDateTime = await _policyDAL.GetUBIFeatureActivationDateTime(x.TelematicsId);
                WcfPolicyService.Participant source = response.Policy.Participants.FirstOrDefault(y => y.ParticipantExternalID == x.TelematicsId);
                if (source?.IsMigratedFromTrial == true)
                    x.AddExtender("IsMigratedFromTrial", source.IsMigratedFromTrial);

                if (x.PluginDeviceDetails != null)
                    x.AddExtender("IsDeviceAudioEnabled", source?.AudioOn);

                IEnumerable<WcfPolicyService.CommunicationItem> communicationData = await _policyService.GetPolicyCommunications(policy.PolicyNumber, x.SnapshotDetails.ParticipantSeqId);
                List<Communication> communications = _mapper.Map<List<Communication>>(communicationData);
                x.SnapshotDetails.Communications = communications.Count > 0 ? communications : null;

                if (x.SnapshotDetails.EnrollmentExperience == DeviceExperience.Device && x.PluginDeviceDetails != null)
                {
                    PluginDevice deviceData = await _pluginOrchestrator.DeviceInformation(x.PluginDeviceDetails.DeviceSerialNumber, false);
                    x.PluginDeviceDetails.Features = deviceData.Features ?? x.PluginDeviceDetails.Features;
                    x.PluginDeviceDetails.Status = deviceData.Status ?? x.PluginDeviceDetails.Status;
                    x.PluginDeviceDetails.Location = deviceData.Location ?? x.PluginDeviceDetails.Location;
                    x.PluginDeviceDetails.ReportedVIN = deviceData.ReportedVIN ?? x.PluginDeviceDetails.ReportedVIN;
                    x.PluginDeviceDetails.DeviceVersion = deviceData.DeviceVersion ?? x.PluginDeviceDetails.DeviceVersion;
                }

                if (x.SnapshotDetails.ScoringAlgorithmCode != null)
                {
                    x.SnapshotDetails.ScoringAlgorithmData = await _scoringAlgorithmsOrchestrator
                            .GetScoringAlgorithmByCodeAsync((int)x.SnapshotDetails.ScoringAlgorithmCode);
                }


                try
                {
                    List<CompatibilityItem> compatibilityData = (await _commonApi.GetCompatibilityItems(x.SnapshotDetails.ParticipantSeqId))?.Values;
                    if (compatibilityData?.Count > 0)
                    {
                        x.SnapshotDetails.CompatibilityIssues = compatibilityData.ToList();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(LoggingEvents.PolicyOrchestrator_CompatibilityItems, ex, "Unble To Retrieve Compatibility Items");
                }
            }

            List<Registration> registrationData = await _mobileOrchestrator.GetMobileRegistrationData(policy.SnapshotDetails.GroupExternalId);

            registrationData?.ForEach(x =>
            {
                Participant match = policy.Participants.Find(y => y.TelematicsId == x.ParticipantExternalId);
                if (match != null && match.SnapshotDetails.EnrollmentExperience == DeviceExperience.Mobile)
                {
                    MobileDevice deviceData = match.MobileDeviceDetails.HomeBaseDeviceSeqId.HasValue ? _deviceApi.GetDevice(match.MobileDeviceDetails.HomeBaseDeviceSeqId.Value).Result : null;
                    if (deviceData != null)
                    {
                        deviceData.DeviceSeqId = match.MobileDeviceDetails.DeviceSeqId;
                        deviceData.HomeBaseDeviceSeqId = match.MobileDeviceDetails.HomeBaseDeviceSeqId;
                        deviceData.MobileDeviceAliasName = match.MobileDeviceDetails.MobileDeviceAliasName;
                        match.SnapshotDetails.FirstContactDateTime = deviceData.FirstContactDateTime;
                        match.SnapshotDetails.LastContactDateTime = deviceData.LastContactDateTime;
                        match.SnapshotDetails.LastUploadDateTime = deviceData.LastUploadDateTime;
                        match.MobileDeviceDetails = deviceData;
                    }

                    if (match.SnapshotDetails.VehicleDetails != null)
                        match.SnapshotDetails.VehicleDetails.VehicleExternalId = x.VehicleExternalId;
                }
            });

            return policy;
        }
    }
}
