using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Progressive.AppLogger.NetCore;
using Progressive.FeatureFlags.Common;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService.Flagr;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService.Helpers;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Business.ResponseModels.CustomerService.Registration;
using Progressive.Telematics.Admin.Services.Api;
using Progressive.Telematics.Admin.Services.Database;
using Progressive.Telematics.Admin.Services.Wcf;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;

namespace Progressive.Telematics.Admin.Business.Orchestrators.CustomerService
{
    [SingletonService]
    public interface IRegistrationOrchestrator
    {
        Task<GetRegistrationResponse> GetRegistrations(List<string> telematicsIds, IRolloutHelper rolloutHelper, bool bypassRollout = false);
        Task<GetRegistrationResponse> GetRegistrationsByPolicy(string policyNumber, IRolloutHelper rolloutHelper);
        Task<GetRegistrationConflictsResponse> GetConflictingRegistrations(string registrationCode);
        Task<DetermineUnlockRegistrationStatusResponse> DetermineRegistrationStatusAfterUnlock(Participant participant, IRolloutHelper rolloutHelper);
        Task<UnlockRegistrationResponse> UnlockRegistration(Registration registration, IRolloutHelper rolloutHelper);
        Task<UpdateRegistrationCodeResponse> UpdateRegistrationCode(string policyNumber, string newRegistrationCode, Participant participant, List<int> conflictingRegistrationSeqIds, IRolloutHelper rolloutHelper);
        Task<UpdateRegistrationStatusCodeResponse> UpdateRegistrationStatusCode(string policyNumber, int mobileRegistrationSeqId, RegistrationStatusUpdateAction action, string telematicsId);
        Task<UnenrollResponse> UnenrollARE(string telematicsId, string unenrollReason);
    }

    public class RegistrationOrchestrator : IRegistrationOrchestrator
    {
        private readonly IDeviceApi deviceApi;
        private readonly IPolicyApi policyApi;
        private readonly IPolicyDeviceApi policyDeviceApi;
        private readonly ITransactionAuditLogService auditLog;
        private readonly IUnlockRegistrationHelper unlockHelper;
        private readonly IUpdateRegistrationCodeHelper registrationCodeHelper;
        private readonly IHomebaseDAL homebaseDAL;
        private readonly IHttpContextAccessor contextAccessor;
        private readonly IClaimsParticipantManagementApi claimsParticipantManagementApi;
        private readonly ILogger<RegistrationOrchestrator> logger;
        private readonly IClaimsRegistrationApi _claimsRegistrationApi;
        private readonly IRegistrationConflictService _registrationConflictService;
        private readonly IUbiApi _ubiApi;
        private readonly IHomebaseParticipantManagementApi _homebaseParticipantManagementApi;

        public RegistrationOrchestrator(
            IDeviceApi deviceApi,
            IPolicyApi policyApi,
            IPolicyDeviceApi policyDeviceApi,
            IClaimsParticipantManagementApi claimsParticipantManagementApi,
            IHomebaseParticipantManagementApi homebaseParticipantManagementApi,
            ITransactionAuditLogService transactionAuditLogService,
            IUnlockRegistrationHelper unlockHelper,
            IUpdateRegistrationCodeHelper registrationCodeHelper,
            IHomebaseDAL homebaseDAL,
            IHttpContextAccessor httpContextAccessor,
            ILogger<RegistrationOrchestrator> logger,
            IClaimsRegistrationApi claimsRegistrationApi,
            IRegistrationConflictService registrationConflictService,
            IUbiApi ubiApi)
        {
            this.deviceApi = deviceApi;
            this.policyApi = policyApi;
            this.policyDeviceApi = policyDeviceApi;
            this.claimsParticipantManagementApi = claimsParticipantManagementApi;
            _homebaseParticipantManagementApi = homebaseParticipantManagementApi;
            this.auditLog = transactionAuditLogService;
            this.unlockHelper = unlockHelper;
            this.registrationCodeHelper = registrationCodeHelper;
            this.homebaseDAL = homebaseDAL;
            this.logger = logger;
            contextAccessor = httpContextAccessor;
            _claimsRegistrationApi = claimsRegistrationApi;
            _registrationConflictService = registrationConflictService;
            _ubiApi = ubiApi;
        }

        public async Task<GetRegistrationResponse> GetRegistrations(List<string> telematicsIds, IRolloutHelper rolloutHelper, bool bypassRollout = false)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.TelematicsIdList, telematicsIds));

            try
            {
                logger.LogInformation($"{nameof(GetRegistrations)} call started");
                var tasks = new List<Task<List<Registration>>>();

                async Task<List<Registration>> GetRegistrationsWithFallback(string telematicsId)
                {
                    List<Registration> result = null;
                    try
                    {
                        result = await GetRegistrationsModern(telematicsId);
                        if (result == null)
                        {
                            logger.LogError(
                                LoggingEvents.RegistrationOrchestrator_GetRegistrations_FallbackToLegacy,
                                "Failed to get registrations by telematicsIds using ClaimsRegistrationApi, falling back to legacy method.");
                        }
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(
                            LoggingEvents.RegistrationOrchestrator_GetRegistrations_FallbackToLegacy,
                            ex,
                            "Failed to get registrations by telematicsIds using ClaimsRegistrationApi, falling back to legacy method.");
                        result = null;
                    }

                    if (result == null)
                    {
                        result = await deviceApi.GetRegistrations(telematicsId);
                    }
                    return result;
                }

                RolloutStatus rolloutStatus;
                if (!bypassRollout)
                {
                    TelematicsIdEntity tmxIdEntity = new TelematicsIdEntity(telematicsIds[0]);
                    rolloutStatus = await rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminStatusDisplayFeatureSwitchProduct>(tmxIdEntity);
                    logger.LogInformation(
                           LoggingEvents.RolloutStatusResult,
                           "Rollout status for CMDR_TmxAdminStatusDisplay_FeatureSwitch_Product is {RolloutStatus}",
                           rolloutStatus.ToString());
                }
                else
                {
                    rolloutStatus = RolloutStatus.Complete;
                }

                telematicsIds.ForEach(x =>
                {
                    switch (rolloutStatus)
                    {
                        case RolloutStatus.Ready:
                        default:
                            tasks.Add(deviceApi.GetRegistrations(x));
                            break;
                        case RolloutStatus.InProcess:
                            tasks.Add(GetRegistrationsWithFallback(x));
                            break;
                        case RolloutStatus.Complete:
                            tasks.Add(GetRegistrationsModern(x));
                            break;
                    }
                });

                var results = await (tasks);

                if (results.Any(x => x == null))
                {
                    logger.LogError(LoggingEvents.RegistrationOrchestrator_GetRegistrations_RegistrationNull, $"One or more of the registrations request to {nameof(DeviceApi)} failed.");
                    return new GetRegistrationResponse.NoRegistration();
                }

                var flattenedResults = results.SelectMany(x => x).ToList();
                flattenedResults.ForEach(x => x.AddExtender("ChallengeExpired", x.ChallengeExpirationDateTime <= DateTime.Now));
                return new GetRegistrationResponse.Success { Registrations = flattenedResults };
            }
            catch (Exception ex)
            {
                logger.LogError(LoggingEvents.RegistrationOrchestrator_GetRegistrations_UnknownError, ex, $"Unknown error occurred in {nameof(GetRegistrations)}");
                return new GetRegistrationResponse.Failure();
            }
        }

        private async Task<List<Registration>> GetRegistrationsModern(string telematicsId)
        {
            var snapshotSummary = await _ubiApi.GetParticipantSnapshotSummary(telematicsId);

            var result = await _claimsRegistrationApi.GetRegistrations(telematicsId);

            result?.ForEach(reg =>
            {
                if (reg != null)
                {
                    reg.DriverFirstName = snapshotSummary?.DriverFirstName;
                    reg.DriverLastName = snapshotSummary?.DriverLastName;
                }
            });

            return result;
        }

        public async Task<GetRegistrationResponse> GetRegistrationsByPolicy(string policyNumber, IRolloutHelper rolloutHelper)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.PolicyNumber, policyNumber));

            try
            {
                logger.LogInformation($"{nameof(GetRegistrationsByPolicy)} call started");
                List<Registration> registrations = null;

                PolicyNumberEntity policyNumberEntity = new PolicyNumberEntity(policyNumber);
                RolloutStatus rolloutStatus = await rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminPolicySearchFeatureSwitchProduct>(policyNumberEntity);
                logger.LogInformation(
                       LoggingEvents.RolloutStatusResult,
                       "Rollout status for CMDR_TmxAdminPolicySearch_FeatureSwitch_Product is {RolloutStatus}",
                       rolloutStatus.ToString());

                switch (rolloutStatus)
                {
                    case RolloutStatus.Ready:
                    default:
                        registrations = await policyApi.GetMobileParticipantRegistrationInfo(policyNumber);
                        if (registrations == null)
                        {
                            logger.LogError(LoggingEvents.RegistrationOrchestrator_GetRegistrationsByPolicy_RegistrationsNull, $"One or more of the registrations request to {nameof(DeviceApi)} failed.");
                            return new GetRegistrationResponse.NoRegistration();
                        }
                        break;
                    case RolloutStatus.InProcess:
                        try
                        {
                            registrations = await GetAndCompareRegistrationsByPolicy(policyNumber);
                            if (registrations == null)
                            {
                                logger.LogError(LoggingEvents.RegistrationOrchestrator_GetRegistrationsByPolicy_RegistrationsNull, $"Both modern and legacy calls returned errors.");
                                return new GetRegistrationResponse.NoRegistration();
                            }
                            break;
                        }
                        catch
                        {
                            throw;
                        }
                    case RolloutStatus.Complete:
                        registrations = await _claimsRegistrationApi.GetRegistrationsByPolicyNumber(policyNumber);
                        if (registrations == null)
                        {
                            logger.LogError(LoggingEvents.RegistrationOrchestrator_GetRegistrationsByPolicy_RegistrationsNull, $"One or more of the registrations request to {nameof(ClaimsRegistrationApi)} failed.");
                            return new GetRegistrationResponse.NoRegistration();
                        }
                        break;
                }

                registrations.ForEach(x => x.AddExtender("ChallengeExpired", x.ChallengeExpirationDateTime <= DateTime.Now));
                return new GetRegistrationResponse.Success { Registrations = registrations };
            }
            catch (Exception ex)
            {
                logger.LogError(LoggingEvents.RegistrationOrchestrator_GetRegistrationsByPolicy_UnknownError, ex, $"Unknown error occurred in {nameof(GetRegistrationsByPolicy)}");
                return new GetRegistrationResponse.Failure();
            }
        }
        
        private async Task<List<Registration>> GetAndCompareRegistrationsByPolicy(string policyNumber)
        {
            List<Registration> modernRegistrations, legacyRegistrations = null;

            var modernTask = _claimsRegistrationApi.GetRegistrationsByPolicyNumber(policyNumber);
            var legacyTask = policyApi.GetMobileParticipantRegistrationInfo(policyNumber);

            (modernRegistrations, legacyRegistrations) = await (modernTask, legacyTask);

            return (modernRegistrations, legacyRegistrations) switch
            {
                (null, null) => null,
                (null, _) => legacyRegistrations,
                (_, null) => modernRegistrations,
                _ => CompareRegistrations(legacyRegistrations, modernRegistrations)
            };
        }

        private List<Registration> CompareRegistrations(List<Registration> legacyRegistrations, List<Registration> modernRegistrations)
        {
            try
            {
                if (modernRegistrations.Count != legacyRegistrations.Count)
                {
                    logger.LogError(LoggingEvents.RegistrationOrchestrator_GetRegistrationsByPolicy_LegacyCountMismatch, $"Modern and Legacy implementations returned a different number of rows, falling back to legacy.");
                    return legacyRegistrations;
                }

                foreach (var modernRegistration in modernRegistrations)
                {
                    var matchingLegacyRegistration = legacyRegistrations.FirstOrDefault(x => x.ParticipantExternalId == modernRegistration.ParticipantExternalId);

                    if (matchingLegacyRegistration == null)
                    {
                        logger.LogError(
                            LoggingEvents.RegistrationOrchestrator_GetRegistrationsByPolicy_LegacyFieldMismatch,
                            $"Modern and Legacy implementations returned mismatched values, falling back to legacy. Modern TMX ID: ${modernRegistration.ParticipantExternalId}");
                        return legacyRegistrations;
                    }
                }

                return modernRegistrations;
            }
            catch (Exception ex)
            {
                logger.LogError(LoggingEvents.RegistrationOrchestrator_GetRegistrationsByPolicy_UnknownError, ex, $"Unknown error occurred in {nameof(GetRegistrationsByPolicy)}");

                if (legacyRegistrations != null && legacyRegistrations.Count > 0)
                {
                    return legacyRegistrations;
                }

                return null;
            }
        }

        public async Task<GetRegistrationConflictsResponse> GetConflictingRegistrations(string registrationCode)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.MobileRegistrationCode, registrationCode));
            logger.LogInformation($"{nameof(GetConflictingRegistrations)} call started");

            try
            {
                return await _registrationConflictService.GetConflictingRegistrations(registrationCode);
            }
            catch (Exception ex)
            {
                logger.LogError(LoggingEvents.RegistrationOrchestrator_GetConflictingRegistrations_UnknownError, ex, $"Unknown error occurred in {nameof(GetConflictingRegistrations)}");
                return new GetRegistrationConflictsResponse.Failure();
            }
        }

        public async Task<DetermineUnlockRegistrationStatusResponse> DetermineRegistrationStatusAfterUnlock(Participant participant, IRolloutHelper rolloutHelper)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.TelematicsId, participant?.TelematicsId));

            try
            {
                logger.LogInformation($"{nameof(DetermineRegistrationStatusAfterUnlock)} call started");

                RolloutStatus rolloutStatus = await rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminUnlockFeatureSwitchProduct>(new TelematicsIdEntity(participant.TelematicsId));
                logger.LogInformation(
                    LoggingEvents.RolloutStatusResult,
                    "Rollout status for CMDR_TmxAdminUnlock_FeatureSwitch_Product is {RolloutStatus}",
                    rolloutStatus.ToString());

                MobileRegistrationStatus? newStatus;
                switch (rolloutStatus)
                {
                    case RolloutStatus.Ready:
                    default:
                        newStatus = await unlockHelper.DetermineRegistrationStatusAfterUnlock(participant);
                        break;
                    case RolloutStatus.InProcess:
                    case RolloutStatus.Complete:
                        newStatus = null;
                        break;
                }

                return new DetermineUnlockRegistrationStatusResponse.Success { RegistrationStatus = newStatus };
            }
            catch (Exception ex)
            {
                logger.LogError(LoggingEvents.RegistrationOrchestrator_DetermineRegistrationStatusAfterUnlock_UnknownError, ex, $"Unknown error occurred in {nameof(DetermineRegistrationStatusAfterUnlock)}");
                return new DetermineUnlockRegistrationStatusResponse.Failure();
            }
        }

        public async Task<UnlockRegistrationResponse> UnlockRegistration(Registration registration, IRolloutHelper rolloutHelper)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.MobileRegistrationCode, registration.MobileRegistrationCode));

            RolloutStatus rolloutStatus = await rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminUnlockFeatureSwitchProduct>(new TelematicsIdEntity(registration.ParticipantExternalId));
            logger.LogInformation(
                LoggingEvents.RolloutStatusResult,
                "Rollout status for CMDR_TmxAdminUnlock_FeatureSwitch_Product is {RolloutStatus}",
                rolloutStatus.ToString());

            try
            {
                async Task<bool> Legacy(Registration registration)
                {
                    registration.ChallengeExpirationDateTime = null;
                    registration.ChallengeRequestCount = 0;
                    registration.MobileChallengeCode = null;
                    registration.MobileApiTokenId = registration.MobileLastRegistrationDateTime != null ? registration.MobileApiTokenId : null;
                    registration.VehicleExternalId = registration.MobileLastRegistrationDateTime != null ? registration.VehicleExternalId : null;
                    registration.LastChangeDateTime = DateTime.Now;

                    if (registration.MobileRegistrationSeqId <= 0 && registration.ParticipantExternalId != null)
                    {
                        registration.MobileRegistrationSeqId = await homebaseDAL.GetMobileRegistrationSeqIdAsync(registration.ParticipantExternalId) ?? 0;
                    }
                    if (registration.MobileRegistrationSeqId <= 0)
                    {
                        logger.LogError(LoggingEvents.RegistrationOrchestrator_UnlockRegistration_InvalidSeqId, "Failed to unlock registration. Could not find MobileRegistrationSeqId");
                        return false;
                    }

                    bool updateSuccessful = await homebaseDAL.UpdateMobileRegistration(registration);
                    if (!updateSuccessful)
                    {
                        logger.LogError(LoggingEvents.RegistrationOrchestrator_UnlockRegistration_Failed, "Failed to unlock registration.");
                        return false;
                    }

                    return true;
                }

                bool updateSuccessful = false;
                string errorMessage = null;

                switch (rolloutStatus)
                {
                    case RolloutStatus.Ready:
                    default:
                        updateSuccessful = await Legacy(registration);
                        break;
                    case RolloutStatus.InProcess:
                        try
                        {
                            (updateSuccessful, errorMessage) = await _claimsRegistrationApi.UnlockRegistration(registration.ParticipantExternalId);
                            if (!updateSuccessful)
                            {
                                logger.LogError(LoggingEvents.RegistrationOrchestrator_UnlockRegistration_FallbackToLegacy, "Failed to unlock registration using ClaimsRegistrationApi, falling back to legacy method. - {errorMessage}", errorMessage);
                                updateSuccessful = false;
                            }
                        }
                        catch (Exception ex)
                        {
                            logger.LogError(LoggingEvents.RegistrationOrchestrator_UnlockRegistration_FallbackToLegacy, ex, "Failed to unlock registration using ClaimsRegistrationApi, falling back to legacy method. - {errorMessage}", errorMessage);
                            updateSuccessful = false;
                        }
                        if (!updateSuccessful)
                        {
                            updateSuccessful = await Legacy(registration);
                        }
                        break;
                    case RolloutStatus.Complete:
                        (updateSuccessful, errorMessage) = await _claimsRegistrationApi.UnlockRegistration(registration.ParticipantExternalId);
                        if (!updateSuccessful)
                        {
                            logger.LogError(LoggingEvents.RegistrationOrchestrator_UnlockRegistration_Failed, "Failed to unlock registration - {errorMessage}", errorMessage);
                        }
                        break;
                }

                return updateSuccessful
                    ? new UnlockRegistrationResponse.Success()
                    : new UnlockRegistrationResponse.Failure();
            }
            catch (Exception ex)
            {
                logger.LogError(LoggingEvents.RegistrationOrchestrator_UnlockRegistration_Unknown, ex, $"Unknown error occurred in {nameof(UnlockRegistration)}");
                return new UnlockRegistrationResponse.Failure();
            }
        }

        public async Task<UpdateRegistrationCodeResponse> UpdateRegistrationCode(string policyNumber, string newRegistrationCode, Participant participant, List<int> conflictingRegistrationSeqIds, IRolloutHelper rolloutHelper)
        {
            using var loggingScope = logger.BeginPropertyScope(
                (LoggingConstants.TelematicsId, participant.TelematicsId),
                (LoggingConstants.PolicyNumber, policyNumber),
                ("NewMobileRegistrationCode", newRegistrationCode),
                ("CurrentMobileRegistrationCode", participant.RegistrationDetails?.MobileRegistrationCode));

            if (string.IsNullOrWhiteSpace(participant.TelematicsId))
            {
                logger.LogError(
                    LoggingEvents.RegistrationOrchestrator_UpdateRegistrationCode_TelematicsIdNullOrEmpty,
                    "TelematicsId is null or empty in UpdateRegistrationCode request. Participant Data : {Participant}", participant);

                var response = new UpdateRegistrationCodeResponse.Failure();
                response.DeveloperMessage = "TelematicsId must be provided.";
                return response;
            }

            TelematicsIdEntity tmxIdEntity = new TelematicsIdEntity(participant.TelematicsId);

            RolloutStatus rolloutStatus = await rolloutHelper.GetRolloutStatusByFeatureSwitch<CmdrTmxAdminUpdateRegCodeFeatureSwitchProduct>(tmxIdEntity);

            logger.LogInformation(
                LoggingEvents.RolloutStatusResult,
                "Rollout status for CMDR_TmxAdminUpdateRegCode_FeatureSwitch_Product is {RolloutStatus}",
                rolloutStatus.ToString());

            bool updateSuccessful = false;
            string errorMessage;

            switch (rolloutStatus)
            {
                case RolloutStatus.Ready:
                default:
                    return await LegacyUpdateRegistrationCode(
                        policyNumber,
                        newRegistrationCode,
                        participant,
                        conflictingRegistrationSeqIds);
                case RolloutStatus.InProcess:
                    try
                    {
                        (updateSuccessful, errorMessage) = await _claimsRegistrationApi.UpdateMobileRegistrationCode(
                            participant.RegistrationDetails.MobileRegistrationCode,
                            newRegistrationCode,
                            participant.TelematicsId);
                        if (!updateSuccessful)
                        {
                            logger.LogError(
                                LoggingEvents.RegistrationOrchestrator_UpdateRegistrationCode_ClaimsRegistrationFailure,
                                "Failed to update mobile registration code using ClaimsRegistrationApi.");
                            var response = new UpdateRegistrationCodeResponse.Failure();
                            response.DeveloperMessage = !string.IsNullOrWhiteSpace(errorMessage) ? errorMessage : response.DeveloperMessage;
                            return response;
                        }
                        return new UpdateRegistrationCodeResponse.Success();
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(
                            LoggingEvents.RegistrationOrchestrator_UpdateRegistrationCode_FallbackToLegacy,
                            "Failed to update mobile registration code using ClaimsRegistrationApi, falling back to legacy method.");
                    }
                    return await LegacyUpdateRegistrationCode(
                        policyNumber,
                        newRegistrationCode,
                        participant,
                        conflictingRegistrationSeqIds);
                case RolloutStatus.Complete:
                    (updateSuccessful, errorMessage) = await _claimsRegistrationApi.UpdateMobileRegistrationCode(
                       participant.RegistrationDetails.MobileRegistrationCode,
                       newRegistrationCode,
                       participant.TelematicsId);
                    if (!updateSuccessful)
                    {
                        logger.LogError(
                            LoggingEvents.RegistrationOrchestrator_UpdateRegistrationCode_ClaimsRegistrationFailure,
                            "Failed to update mobile registration code using ClaimsRegistrationApi.");
                        var response = new UpdateRegistrationCodeResponse.Failure();
                        response.DeveloperMessage = !string.IsNullOrWhiteSpace(errorMessage) ? errorMessage : response.DeveloperMessage;
                        return response;
                    }
                    return new UpdateRegistrationCodeResponse.Success();
            }
        }

        public async Task<UpdateRegistrationStatusCodeResponse> UpdateRegistrationStatusCode(string policyNumber, int mobileRegistrationSeqId, RegistrationStatusUpdateAction action, string telematicsId)
        {
            using var loggingScope = logger.BeginPropertyScope(
                (LoggingConstants.PolicyNumber, policyNumber),
                (LoggingConstants.MobileRegistrationSeqId, mobileRegistrationSeqId),
                (LoggingConstants.RegistrationStatusUpdateAction, action.ToString()),
                (LoggingConstants.ParticipantExternalId, telematicsId));

            try
            {
                if (!string.IsNullOrWhiteSpace(telematicsId))
                {
                    mobileRegistrationSeqId = await homebaseDAL.GetMobileRegistrationSeqIdAsync(telematicsId) ?? mobileRegistrationSeqId;
                }

                var (updateSuccessful, errorMessage) = await policyDeviceApi.UpdateMobileRegistration(policyNumber, mobileRegistrationSeqId, action);

                if (!updateSuccessful)
                {
                    logger.LogError(LoggingEvents.RegistrationOrchestrator_UpdateRegistrationStatusCode_UpdateRegistrationStatus, "Failed to update registration status to {Status}", action.ToString());
                    var response = new UpdateRegistrationStatusCodeResponse.Failure();
                    response.DeveloperMessage = !string.IsNullOrWhiteSpace(errorMessage) ? errorMessage : response.DeveloperMessage;
                    return response;
                }

                var registration = await homebaseDAL.GetRegistration(mobileRegistrationSeqId);

                return new UpdateRegistrationStatusCodeResponse.Success { NewRegistrationStatus = registration.MobileRegistrationStatusCode.Value };
            }
            catch (Exception ex)
            {
                logger.LogError(LoggingEvents.RegistrationOrchestrator_UpdateRegistrationStatusCode_Unknown, ex, $"Unknown error occurred in {nameof(GetConflictingRegistrations)}");
                return new UpdateRegistrationStatusCodeResponse.Failure();
            }
        }

        public async Task<UnenrollResponse> UnenrollARE(string telematicsId, string unenrollReason)
        {
            using var loggingScope = logger.BeginPropertyScope(
                (LoggingConstants.TelematicsId, telematicsId));

            try
            {
                var updateSuccessful = await claimsParticipantManagementApi.Unenroll(telematicsId, unenrollReason);

                if (!updateSuccessful)
                {
                    logger.LogError(LoggingEvents.RegistrationOrchestrator_Unenroll_Failed, "Failed to unenroll participant {telematicsId}", telematicsId);
                    return new UnenrollResponse.Failure();
                }


                return new UnenrollResponse.Success();
            }
            catch (Exception ex)
            {
                logger.LogError(LoggingEvents.RegistrationOrchestrator_Unenroll_Unknown, ex, $"Unknown error occurred in {nameof(UnenrollARE)}");
                return new UnenrollResponse.Failure();
            }
        }

        private async Task<UpdateRegistrationCodeResponse> LegacyUpdateRegistrationCode(string policyNumber, string newRegistrationCode, Participant participant, List<int> conflictingRegistrationSeqIds)
        {
            try
            {
                logger.LogInformation($"{nameof(UpdateRegistrationCode)} call started");

                var registrationSeqId = participant.RegistrationDetails.MobileRegistrationSeqId;
                var registrations = await deviceApi.GetUnfilteredRegistrations(newRegistrationCode);

                if (conflictingRegistrationSeqIds == null)
                {
                    var conflictingRegistrations = await _registrationConflictService.GetConflictingRegistrations(newRegistrationCode);
                    if (conflictingRegistrations == null)
                    {
                        return new UpdateRegistrationCodeResponse.Failure();
                    }
                    conflictingRegistrationSeqIds = ((GetRegistrationConflictsResponse.Success)conflictingRegistrations).ConflictingRegistrations.Select(x => x.MobileRegistrationSeqId).ToList();
                }

                var mobileNumberStatus = await registrationCodeHelper.DetermineMobileNumberStatus(registrations, conflictingRegistrationSeqIds);
                var (registrationStatus, nonPolicyRegistrationStatus) = await registrationCodeHelper.DetermineRegistrationStatusForRegistrationCodeChange(participant, mobileNumberStatus);

                if (nonPolicyRegistrationStatus.HasValue && nonPolicyRegistrationStatus.Value == MobileRegistrationStatus.Inactive)
                {
                    var updateTasks = conflictingRegistrationSeqIds
                        .Select(x => deviceApi.UpdateRegistration(newRegistrationCode, x, MobileRegistrationStatus.Inactive))
                        .ToList();

                    var updateResults = await Task.WhenAll(updateTasks);
                    if (updateResults.Any(x => x == false))
                    {
                        logger.LogError(LoggingEvents.RegistrationOrchestrator_UpdateRegistrationCode_UpdateConflict, "Failed to update one or more of the conflicting {RegistrationSeqIds}.", conflictingRegistrationSeqIds);
                        return new UpdateRegistrationCodeResponse.FailureUpdatingConflictingRegistration();
                    }
                }

                var updateSuccessful = await deviceApi.UpdateRegistration(newRegistrationCode, registrationSeqId, registrationStatus);

                if (!updateSuccessful)
                {
                    logger.LogError(LoggingEvents.RegistrationOrchestrator_UpdateRegistrationCode_UpdateRegistration, "Failed to update registration status to {NewRegistrationStatus}", registrationStatus);
                    return new UpdateRegistrationCodeResponse.FailureUpdatingRegistration();
                }

                await auditLog.AddAuditLog(new WcfTransactionAuditLogService.AddTALRequest
                {
                    PolicyNumber = policyNumber,
                    ResultStatus = "Success",
                    ResultMessage = $"User: {contextAccessor.CurrentUser().ToUpper()}",
                    TransactionName = "UpdateMobileRegistrationCode",
                    TransactionData = new { MobileRegistrationSeqId = registrationSeqId, NewMobilePhoneNumber = newRegistrationCode }.ToString()
                });

                return new UpdateRegistrationCodeResponse.Success();
            }
            catch (Exception ex)
            {
                logger.LogError(LoggingEvents.RegistrationOrchestrator_UpdateRegistrationCode_Unknown, ex, $"Unknown error occurred in {nameof(UpdateRegistrationCode)}");
                return new UpdateRegistrationCodeResponse.Failure();
            }
        }

    }
}
