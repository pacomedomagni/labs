using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Progressive.AppLogger.NetCore;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService.Flagr;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService.Helpers;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Services.Api;
using Progressive.Telematics.Admin.Services.Models;
using Progressive.Telematics.Admin.Services.Models.ClaimsRegistrationApi;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;

namespace Progressive.Telematics.Admin.Business.Orchestrators.CustomerService;

[SingletonService]
public interface IArePolicyOrchestrator
{
    Task<Policy> GetPolicySummary(string policyNumber);
    Task<List<Policy>> GetArePoliciesByMobileRegistrations(List<RegistrationsModel> mobileRegistrations);
}

public class ArePolicyOrchestrator : IArePolicyOrchestrator
{
    private readonly IClaimsParticipantManagementApi _claimsParticipantManagement;
    private readonly IHomebaseParticipantManagementApi _homebaseParticipantManagement;
    private readonly IPolicyDeviceApi _policyDeviceApi;
    private readonly IClaimsRegistrationApi _claimsRegistrationApi;
    private readonly IPolicyServicingApi _policyServicingApi;
    private readonly IMapper _mapper;
    private readonly ILogger<ArePolicyOrchestrator> _logger;

    public ArePolicyOrchestrator(
        IClaimsParticipantManagementApi claimsParticipantManagement,
        IHomebaseParticipantManagementApi homebaseParticipantManagement,
        IPolicyDeviceApi policyDeviceApi,
        IClaimsRegistrationApi claimsRegistrationApi,
        IPolicyServicingApi policyServicingApi,
        IMapper mapper,
        ILogger<ArePolicyOrchestrator> logger)
    {
        _claimsParticipantManagement = claimsParticipantManagement;
        _homebaseParticipantManagement = homebaseParticipantManagement;
        _policyDeviceApi = policyDeviceApi;
        _claimsRegistrationApi = claimsRegistrationApi;
        _policyServicingApi = policyServicingApi;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Policy> GetPolicySummary(string policyNumber)
    {
        Task<ClaimsPolicySummaryResponse> claimsSummaryTask = _claimsParticipantManagement.GetPolicySummary(policyNumber);
        Task<HomebasePolicySummaryResponse> homebaseSummaryTask = _homebaseParticipantManagement.GetPolicySummary(policyNumber);
        Task<PolicyServicingPolicy> policyServicingApiTask = _policyServicingApi.GetPolicy(policyNumber);

        (ClaimsPolicySummaryResponse claimsSummary, HomebasePolicySummaryResponse homebaseSummary, PolicyServicingPolicy policyServicingApiPolicy) = await (claimsSummaryTask, homebaseSummaryTask, policyServicingApiTask);

        if (!IsValidPolicy(claimsSummary, homebaseSummary))
            return null;

        List<HomebaseParticipantMobileDeviceResponse> homebaseMobileDevices = await GetHomebaseMobileDevice(claimsSummary, homebaseSummary);

        Policy model = MapPolicy(claimsSummary, homebaseSummary, policyServicingApiPolicy, homebaseMobileDevices);
        return model;
    }

    private async Task<List<HomebaseParticipantMobileDeviceResponse>> GetHomebaseMobileDevice(ClaimsPolicySummaryResponse claimsSummary, HomebasePolicySummaryResponse homebaseSummary)
    {
        List<string> telematicsIds = GetTelematicsIds(claimsSummary, homebaseSummary);
        List<HomebaseParticipantMobileDeviceResponse> mobileDevices = new();

        foreach (string telematicsId in telematicsIds)
        {
            HomebaseParticipantMobileDeviceResponse homebaseParticipantMobileDeviceResponse = await _homebaseParticipantManagement.GetParticipantMobileDevice(telematicsId) ?? new HomebaseParticipantMobileDeviceResponse();
            homebaseParticipantMobileDeviceResponse.TelematicsId = telematicsId;

            mobileDevices.Add(homebaseParticipantMobileDeviceResponse);
        }

        return mobileDevices;
    }

    private static List<string> GetTelematicsIds(ClaimsPolicySummaryResponse claimsSummary, HomebasePolicySummaryResponse homebaseSummary)
    {
        List<string> homebaseTelematicsIds = homebaseSummary != null ? homebaseSummary.Participants.Select(x => x.TelematicsId).ToList() : new List<string>();
        List<string> claimsTelematicsIds = claimsSummary != null ? claimsSummary.ParticipantSummaries.Select(x => x.TelematicsId).ToList() : new List<string>();
        return homebaseTelematicsIds.Union(claimsTelematicsIds).ToList();
    }

    public async Task<List<Policy>> GetArePoliciesByMobileRegistrations(List<RegistrationsModel> mobileRegistrations)
    {
        List<Registration> data = new List<Registration>();
        
        data = mobileRegistrations?.Select(x => new Registration
        {
            ParticipantExternalId = x.TelematicsId,
            StatusSummary = RegistrationsModel.MapMobileRegistrationStatusSummary(x.StatusSummary)
        }).ToList();

        List<Policy> model = new();

        if (data == null)
        {
            return null;
        }

        if (data.Count == 1)
        {
            MultiRegistrationSummary summary = await GetMultiPolicySummary(data.First().ParticipantExternalId);
            Policy policy = await GetPolicySummary(summary.PolicyNumber);
            if (policy == null) return null;
            model.Add(policy);
        }
        else
        {
            List<Task<MultiRegistrationSummary>> summaryTasks = new();
            data.ForEach(x => summaryTasks.Add(GetMultiPolicySummary(x.ParticipantExternalId)));
            IEnumerable<MultiRegistrationSummary> summaries = await (summaryTasks);
            List<MultiRegistrationSummary> validSummaries = summaries.Where(x => x.IsValidParticipant).ToList();

            if (validSummaries.Count == 0)
            {
                return null;
            }

            validSummaries.ForEach(x =>
            {
                Policy policy = new() { PolicyNumber = x.PolicyNumber };
                policy.AddExtender("StatusSummary", data.FirstOrDefault(y => y.ParticipantExternalId == x.TelematicsId)?.StatusSummary);
                model.Add(policy);
            });
        }

        return model;
    }

    private Policy MapPolicy(ClaimsPolicySummaryResponse claimsResponse, HomebasePolicySummaryResponse homebaseResponse, PolicyServicingPolicy policyServicingApiPolicy, List<HomebaseParticipantMobileDeviceResponse> participantMobileDevices)
    {
        Policy policy = new()
        {
            PolicyNumber = claimsResponse?.PolicyNumber ?? homebaseResponse?.Policy,
            AreDetails = new ArePolicyDetails(),
            Participants = new List<Participant>()
        };

        claimsResponse?.ParticipantSummaries.ForEach(x =>
        {
            Participant mappedParticipant = _mapper.Map<Participant>(x);
            _mapper.Map(policyServicingApiPolicy?.CorePolicyDetails?.Drivers?.FirstOrDefault(d => d.DriverId == x.DriverReferenceId), mappedParticipant.AreDetails);
            policy.Participants.Add(mappedParticipant);
        });

        homebaseResponse?.Participants.ForEach(x =>
        {
            Participant match = policy.Participants.FirstOrDefault(y => y.TelematicsId == x.TelematicsId);
            if (match == null)
            {
                Participant participant = _mapper.Map<Participant>(x);
                _mapper.Map(policyServicingApiPolicy?.CorePolicyDetails?.Drivers?.FirstOrDefault(d => d.DriverId == x.DriverReferenceId), participant.AreDetails);
                policy.Participants.Add(participant);
            }
            else
            {
                _mapper.Map(x, match);
            }
        });

        participantMobileDevices?.ForEach(participantMobileDevice =>
        {
            Participant matchedParticipant = policy.Participants.FirstOrDefault(p => p.TelematicsId == participantMobileDevice.TelematicsId);
            if (matchedParticipant == null) return;
            if (matchedParticipant is { MobileDeviceDetails: null })
            {
                matchedParticipant.MobileDeviceDetails = new MobileDevice();
            }

            matchedParticipant.MobileDeviceDetails.MobileAppVersionName = participantMobileDevice?.MobileAppVersionName;
            matchedParticipant.MobileDeviceDetails.MobileDeviceModelName = participantMobileDevice?.MobileDeviceModelName;
            matchedParticipant.MobileDeviceDetails.MobileOSName = participantMobileDevice?.MobileOSName;
            matchedParticipant.MobileDeviceDetails.MobileOSVersionName = participantMobileDevice?.MobileOSVersionName;

        });

        policy.AreDetails.ExperienceType = policy.Participants.First().AreDetails.CADExperience == true ? AreExperience.CAD : AreExperience.ARE;

        return policy;
    }

    private async Task<MultiRegistrationSummary> GetMultiPolicySummary(string telematicsId)
    {
        Task<ClaimsParticipantSummaryResponse> claimsSummaryTask = _claimsParticipantManagement.GetParticipantSummary(telematicsId);
        Task<HomebaseParticipantSummaryResponse> homebaseSummaryTask = _homebaseParticipantManagement.GetParticipantSummary(telematicsId);

        (ClaimsParticipantSummaryResponse claimsSummary, HomebaseParticipantSummaryResponse homebaseSummary) = await (claimsSummaryTask, homebaseSummaryTask);

        return new MultiRegistrationSummary
        {
            PolicyNumber = claimsSummary?.PolicyNumber ?? homebaseSummary?.PolicyNumber,
            TelematicsId = telematicsId,
            IsValidParticipant = IsValidParticipant(claimsSummary, homebaseSummary)
        };
    }

    private static bool IsValidPolicy(ClaimsPolicySummaryResponse claimsSummary, HomebasePolicySummaryResponse homebaseSummary)
    {
        //No data found in either system
        if (claimsSummary == null && homebaseSummary == null) return false;
        //Snapshot only policy, never been in AD as no record exists in claims
        if (homebaseSummary != null && homebaseSummary.Participants.All(x => x.ADEnrolled == false) && claimsSummary == null) return false;
        return true;
    }

    private static bool IsValidParticipant(ClaimsParticipantSummaryResponse claimsSummary, HomebaseParticipantSummaryResponse homebaseSummary)
    {
        //No data found in either system
        if (claimsSummary == null && homebaseSummary == null) return false;
        //Snapshot only policy, never been in AD as no record exists in claims
        if (homebaseSummary is { ADEnrolled: false } && claimsSummary == null) return false;
        return true;
    }
}

internal class MultiRegistrationSummary
{
    public string PolicyNumber { get; init; }
    public string TelematicsId { get; init; }
    public bool IsValidParticipant { get; init; }
}

