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
    public interface IUnlockRegistrationHelper
    {
        Task<MobileRegistrationStatus> DetermineRegistrationStatusAfterUnlock(Participant participant);
    }

    public class UnlockRegistrationHelper : IUnlockRegistrationHelper
    {
        private readonly ILogger<UnlockRegistrationHelper> logger;

        public UnlockRegistrationHelper(ILogger<UnlockRegistrationHelper> logger)
        {
            this.logger = logger;
        }

        public Task<MobileRegistrationStatus> DetermineRegistrationStatusAfterUnlock(Participant participant)
        {
            Func<DateTime?, bool> dateGreaterThan30 = (x) => x != null && x < DateTime.Today.AddDays(-30);
            Func<DateTime?, bool> dateLessThan30 = (x) => x != null && x >= DateTime.Today.AddDays(-30);

            var result = (participant?.SnapshotDetails?.Status,
                participant?.SnapshotDetails?.ReasonCode,
                participant?.SnapshotDetails?.OptOutDetails?.Reason,
                participant?.AreDetails?.ADEnrolled ?? false,
                participant?.AreDetails?.ADActivated ?? false) switch
            {
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, false, false) when dateLessThan30(participant.SnapshotDetails?.OptOutDetails?.Date) => MobileRegistrationStatus.NotRegistered,
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, true, false) when dateLessThan30(participant.SnapshotDetails?.OptOutDetails?.Date) => MobileRegistrationStatus.NotRegistered,
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, true, false) when dateGreaterThan30(participant.SnapshotDetails?.OptOutDetails?.Date) => MobileRegistrationStatus.NotRegistered,
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, _, true, false) => MobileRegistrationStatus.NotRegistered,
                (ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled, _, true, false) => MobileRegistrationStatus.NotRegistered,
                (ParticipantStatus.Pending, ParticipantReasonCode.MobilePendingRegistration, _, false, false) => MobileRegistrationStatus.NotRegistered,
                (ParticipantStatus.Pending, ParticipantReasonCode.MobilePendingRegistration, _, true, false) => MobileRegistrationStatus.NotRegistered,
                (ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut, _, true, false) => MobileRegistrationStatus.NotRegistered,
                (_, _, _, true, false) => MobileRegistrationStatus.NotRegistered,

                (ParticipantStatus.Active, ParticipantReasonCode.CollectingData, _, false, false) => MobileRegistrationStatus.RegistrationComplete,
                (ParticipantStatus.Active, ParticipantReasonCode.CollectingData, _, true, true) => MobileRegistrationStatus.RegistrationComplete,
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, true, true) when dateGreaterThan30(participant.SnapshotDetails?.OptOutDetails?.Date) => MobileRegistrationStatus.RegistrationComplete,
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, _, true, true) => MobileRegistrationStatus.RegistrationComplete,
                (ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled, _, true, true) => MobileRegistrationStatus.RegistrationComplete,
                (ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut, _, true, true) => MobileRegistrationStatus.RegistrationComplete,
                (_, _, _, true, true) => MobileRegistrationStatus.RegistrationComplete,

                (ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled, _, false, false) => MobileRegistrationStatus.Inactive,

                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, false, false) when dateGreaterThan30(participant.SnapshotDetails?.OptOutDetails?.Date) => MobileRegistrationStatus.Disabled,
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, _, false, false) => MobileRegistrationStatus.Disabled,
                (ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut, _, false, false) => MobileRegistrationStatus.Disabled,
                (_, _, _, false, false) => MobileRegistrationStatus.Disabled,

                _ => new Func<MobileRegistrationStatus>(() =>
                {
                    logger.LogWarning(LoggingEvents.UnlockRegistrationHelper_NoDecisionMatch, "No match found for {Data} in unlock registration decision table.",
                        new
                        {
                            ParticipantStatus = participant.SnapshotDetails?.Status,
                            ParticipantReasonCode = participant.SnapshotDetails?.ReasonCode,
                            OptOutReasonCode = participant.SnapshotDetails?.OptOutDetails?.Reason,
                            OptOutDate = participant.SnapshotDetails?.OptOutDetails?.Date,
                            ADEnrolled = participant.AreDetails?.ADEnrolled,
                            ADActivated = participant.AreDetails?.ADActivated
                        });
                    return MobileRegistrationStatus.Disabled;
                })()
            };

            return Task.FromResult(result);
        }


    }

}
