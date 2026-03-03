using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;

namespace Progressive.Telematics.Admin.Business.Orchestrators.CustomerService.Helpers
{
    [SingletonService]
    public interface IResetRegistrationHelper
    {
        Task<MobileRegistrationStatus> DetermineRegistrationStatusAfterReset(Participant participant);
    }

    public class ResetRegistrationHelper
    {
        private readonly ILogger<ResetRegistrationHelper> logger;

        public ResetRegistrationHelper(ILogger<ResetRegistrationHelper> logger)
        {
            this.logger = logger;
        }

        public Task<MobileRegistrationStatus> DetermineRegistrationStatusAfterReset(Participant participant)
        {
            Func<DateTime?, bool> dateGreaterThan30 = (x) => x != null && x < DateTime.Today.AddDays(-30);
            Func<DateTime?, bool> dateLessThan30 = (x) => x != null && x >= DateTime.Today.AddDays(-30);
            Func<string, bool> hasParticipantExternalId = (participantExternalId) => !string.IsNullOrWhiteSpace(participantExternalId);

            var result = (
                participant.SnapshotDetails?.Status,
                participant.SnapshotDetails?.ReasonCode,
                participant.SnapshotDetails?.EnrollmentExperience,
                participant.SnapshotDetails?.OptOutDetails?.Reason,
                participant.RegistrationDetails.MobileRegistrationStatusCode,
                participant.AreDetails?.ADEnrolled,
                participant.AreDetails?.ADActivated) switch
            {
                (_, _, DeviceExperience.Device, _, _, false, false) => MobileRegistrationStatus.Disabled,
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, DeviceExperience.Mobile, OptOutReasonCode.NonInstaller, _, false, false) when dateGreaterThan30(participant.SnapshotDetails?.OptOutDetails?.Date) => MobileRegistrationStatus.Disabled,
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, DeviceExperience.Mobile, _, _, false, false) => MobileRegistrationStatus.Disabled,
                (ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled, DeviceExperience.Mobile, _, _, false, false) when !hasParticipantExternalId(participant.RegistrationDetails.ParticipantExternalId) => MobileRegistrationStatus.Disabled,
                (ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut, DeviceExperience.Mobile, _, _, false, false) => MobileRegistrationStatus.Disabled,

                (_, _, _, _, _, true, false) => MobileRegistrationStatus.NotRegistered,
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, DeviceExperience.Mobile, OptOutReasonCode.NonInstaller, _, _, _) when dateLessThan30(participant.SnapshotDetails?.OptOutDetails?.Date) => MobileRegistrationStatus.NotRegistered,
                (ParticipantStatus.Pending, ParticipantReasonCode.MobilePendingRegistration, DeviceExperience.Mobile, _, _, _, _) => MobileRegistrationStatus.NotRegistered,

                (ParticipantStatus.Active, ParticipantReasonCode.CollectingData, DeviceExperience.Mobile, _, _, _, _) => MobileRegistrationStatus.RegistrationComplete,
                (_, _, _, _, _, true, true) => MobileRegistrationStatus.RegistrationComplete,

                _ => new Func<MobileRegistrationStatus>(() =>
                {
                    logger.LogError(LoggingEvents.ResetRegistrationHelper_NoDecisionMatch, "No match found for {Data} in reset registration decision table.",
                        new
                        {
                            ParticipantStatus = participant.SnapshotDetails?.Status,
                            ParticipantReasonCode = participant.SnapshotDetails?.ReasonCode,
                            EnrollmentExperience = participant.SnapshotDetails?.EnrollmentExperience,
                            OptOutReason = participant.SnapshotDetails?.OptOutDetails?.Reason,
                            RegistrationStatusCode = participant.RegistrationDetails.MobileRegistrationStatusCode,
                            ADEnrolled = participant.AreDetails?.ADEnrolled,
                            ADActivated = participant.AreDetails?.ADActivated,
                            ParticipantExternalId = participant.RegistrationDetails.ParticipantExternalId
                        });
                    return MobileRegistrationStatus.None;
                })()
            };

            return Task.FromResult(result);
        }
    }
}
