using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;

namespace Progressive.Telematics.Admin.Business.Orchestrators.CustomerService.Helpers
{
    [SingletonService]
    public interface IUpdateRegistrationCodeHelper
    {
        Task<MobileNumberStatus> DetermineMobileNumberStatus(List<Registration> registrations, List<int> conflictingRegistrationSeqIds);
        Task<(MobileRegistrationStatus PolicyRegistrationStatus, MobileRegistrationStatus? NonPolicyRegistrationStatus)> DetermineRegistrationStatusForRegistrationCodeChange(Participant participant, MobileNumberStatus phoneNumberStatus);
    }

    public class UpdateRegistrationCodeHelper : IUpdateRegistrationCodeHelper
    {
        private readonly ILogger<UpdateRegistrationCodeHelper> logger;

        public UpdateRegistrationCodeHelper(ILogger<UpdateRegistrationCodeHelper> logger)
        {
            this.logger = logger;
        }

        public Task<MobileNumberStatus> DetermineMobileNumberStatus(List<Registration> registrations, List<int> conflictingRegistrationSeqIds)
        {
            var status = MobileNumberStatus.Unassigned;

            bool areAssignedParticipantsPresent = registrations.Where(x =>
                x.ProgramCode == ProgramCode.Snapshot &&
                x.MobileRegistrationStatusCode != MobileRegistrationStatus.PendingResolution &&
                x.MobileRegistrationStatusCode != MobileRegistrationStatus.Inactive).Count() > 0;

            if (areAssignedParticipantsPresent)
            {
                status = MobileNumberStatus.AssignedToPolicyParticipant;
            }

            bool areAssignedParticipantsPresentWithPendingResolution = registrations.Where(x =>
                x.ProgramCode == ProgramCode.Snapshot &&
                x.MobileRegistrationStatusCode == MobileRegistrationStatus.PendingResolution).Count() > 0;

            if (conflictingRegistrationSeqIds.Count > 0)
            {
                status = MobileNumberStatus.AssignedToNonPolicyParticipant;
            }

            return Task.FromResult(status);
        }

        public Task<(MobileRegistrationStatus PolicyRegistrationStatus, MobileRegistrationStatus? NonPolicyRegistrationStatus)> DetermineRegistrationStatusForRegistrationCodeChange(Participant participant, MobileNumberStatus phoneNumberStatus)
        {
            Func<DateTime?, bool> dateGreaterThan30 = (x) => x != null && x < DateTime.Today.AddDays(-30);
            Func<DateTime?, bool> dateLessThan30 = (x) => x != null && x >= DateTime.Today.AddDays(-30);
            Func<Registration, bool> isUnlinked = (registration) => registration == null;

            var result = (participant.SnapshotDetails?.Status,
                participant.SnapshotDetails?.ReasonCode,
                participant.SnapshotDetails?.OptOutDetails?.Reason,
                participant.AreDetails?.ADEnrolled ?? false,
                participant.AreDetails?.ADActivated ?? false,
                phoneNumberStatus) switch
            {
                (ParticipantStatus.Pending, ParticipantReasonCode.MobilePendingRegistration, _, _, _, MobileNumberStatus.AssignedToPolicyParticipant) => (MobileRegistrationStatus.PendingResolution, null),
                (ParticipantStatus.Pending, ParticipantReasonCode.MobilePendingRegistration, _, false, false, MobileNumberStatus.AssignedToNonPolicyParticipant) => (MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive),
                (ParticipantStatus.Pending, ParticipantReasonCode.MobilePendingRegistration, _, false, false, MobileNumberStatus.Unassigned) => (MobileRegistrationStatus.NotRegistered, null),
                (ParticipantStatus.Pending, ParticipantReasonCode.MobilePendingRegistration, _, true, false, MobileNumberStatus.AssignedToNonPolicyParticipant) => (MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive),
                (ParticipantStatus.Pending, ParticipantReasonCode.MobilePendingRegistration, _, true, false, MobileNumberStatus.Unassigned) => (MobileRegistrationStatus.NotRegistered, null),

                (ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled, _, false, false, MobileNumberStatus.AssignedToPolicyParticipant) => (MobileRegistrationStatus.Inactive, null),
                (ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled, _, true, _, MobileNumberStatus.AssignedToPolicyParticipant) => (MobileRegistrationStatus.PendingResolution, null),
                (ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled, _, false, false, MobileNumberStatus.AssignedToNonPolicyParticipant) => (MobileRegistrationStatus.Inactive, null),
                (ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled, _, false, false, MobileNumberStatus.Unassigned) => (MobileRegistrationStatus.Inactive, null),
                (ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled, _, true, false, MobileNumberStatus.AssignedToNonPolicyParticipant) => (MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive),
                (ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled, _, true, false, MobileNumberStatus.Unassigned) => (MobileRegistrationStatus.NotRegistered, null),
                (ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled, _, true, true, MobileNumberStatus.AssignedToNonPolicyParticipant) => (MobileRegistrationStatus.RegistrationComplete, MobileRegistrationStatus.Inactive),
                (ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled, _, true, true, MobileNumberStatus.Unassigned) => (MobileRegistrationStatus.RegistrationComplete, null),

                (ParticipantStatus.Active, ParticipantReasonCode.CollectingData, _, _, _, MobileNumberStatus.AssignedToPolicyParticipant) => (MobileRegistrationStatus.PendingResolution, null),
                (ParticipantStatus.Active, ParticipantReasonCode.CollectingData, _, false, false, MobileNumberStatus.AssignedToNonPolicyParticipant) => (MobileRegistrationStatus.RegistrationComplete, MobileRegistrationStatus.Inactive),
                (ParticipantStatus.Active, ParticipantReasonCode.CollectingData, _, false, false, MobileNumberStatus.Unassigned) => (MobileRegistrationStatus.RegistrationComplete, null),
                (ParticipantStatus.Active, ParticipantReasonCode.CollectingData, _, true, true, MobileNumberStatus.AssignedToNonPolicyParticipant) => (MobileRegistrationStatus.RegistrationComplete, MobileRegistrationStatus.Inactive),
                (ParticipantStatus.Active, ParticipantReasonCode.CollectingData, _, true, true, MobileNumberStatus.Unassigned) => (MobileRegistrationStatus.RegistrationComplete, null),

                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, false, false, MobileNumberStatus.AssignedToPolicyParticipant) when dateLessThan30(participant.SnapshotDetails.OptOutDetails?.Date) => (MobileRegistrationStatus.PendingResolution, null),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, false, false, MobileNumberStatus.AssignedToPolicyParticipant) when dateGreaterThan30(participant.SnapshotDetails.OptOutDetails?.Date) => (MobileRegistrationStatus.PendingResolution, null),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, true, false, MobileNumberStatus.AssignedToPolicyParticipant) when dateLessThan30(participant.SnapshotDetails.OptOutDetails?.Date) => (MobileRegistrationStatus.PendingResolution, null),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, true, false, MobileNumberStatus.AssignedToPolicyParticipant) when dateGreaterThan30(participant.SnapshotDetails.OptOutDetails?.Date) => (MobileRegistrationStatus.PendingResolution, null),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, true, true, MobileNumberStatus.AssignedToPolicyParticipant) when dateLessThan30(participant.SnapshotDetails.OptOutDetails?.Date) => (MobileRegistrationStatus.PendingResolution, null),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, true, true, MobileNumberStatus.AssignedToPolicyParticipant) when dateGreaterThan30(participant.SnapshotDetails.OptOutDetails?.Date) => (MobileRegistrationStatus.PendingResolution, null),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, false, false, MobileNumberStatus.AssignedToNonPolicyParticipant) when dateGreaterThan30(participant.SnapshotDetails.OptOutDetails?.Date) => (MobileRegistrationStatus.Disabled, MobileRegistrationStatus.Inactive),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, false, false, MobileNumberStatus.Unassigned) when dateGreaterThan30(participant.SnapshotDetails.OptOutDetails?.Date) => (MobileRegistrationStatus.Disabled, null),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, false, false, MobileNumberStatus.AssignedToNonPolicyParticipant) when dateLessThan30(participant.SnapshotDetails?.OptOutDetails?.Date) => (MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, false, false, MobileNumberStatus.Unassigned) when dateLessThan30(participant.SnapshotDetails?.OptOutDetails?.Date) => (MobileRegistrationStatus.NotRegistered, null),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, true, false, MobileNumberStatus.AssignedToNonPolicyParticipant) when dateGreaterThan30(participant.SnapshotDetails?.OptOutDetails?.Date) => (MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, true, false, MobileNumberStatus.AssignedToNonPolicyParticipant) when dateLessThan30(participant.SnapshotDetails?.OptOutDetails?.Date) => (MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, true, false, MobileNumberStatus.Unassigned) when dateGreaterThan30(participant.SnapshotDetails?.OptOutDetails?.Date) => (MobileRegistrationStatus.NotRegistered, null),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, true, false, MobileNumberStatus.Unassigned) when dateLessThan30(participant.SnapshotDetails?.OptOutDetails?.Date) => (MobileRegistrationStatus.NotRegistered, null),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, true, true, MobileNumberStatus.AssignedToNonPolicyParticipant) when dateGreaterThan30(participant.SnapshotDetails?.OptOutDetails?.Date) => (MobileRegistrationStatus.RegistrationComplete, MobileRegistrationStatus.Inactive),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, true, true, MobileNumberStatus.Unassigned) when dateGreaterThan30(participant.SnapshotDetails?.OptOutDetails?.Date) => (MobileRegistrationStatus.RegistrationComplete, null),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, _, false, false, MobileNumberStatus.AssignedToPolicyParticipant) => (MobileRegistrationStatus.PendingResolution, null),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, _, true, false, MobileNumberStatus.AssignedToPolicyParticipant) => (MobileRegistrationStatus.PendingResolution, null),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, _, true, true, MobileNumberStatus.AssignedToPolicyParticipant) => (MobileRegistrationStatus.PendingResolution, null),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, _, false, false, MobileNumberStatus.AssignedToNonPolicyParticipant) => (MobileRegistrationStatus.Disabled, MobileRegistrationStatus.Inactive),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, _, false, false, MobileNumberStatus.Unassigned) => (MobileRegistrationStatus.Disabled, null),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, _, true, false, MobileNumberStatus.AssignedToNonPolicyParticipant) => (MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, _, true, false, MobileNumberStatus.Unassigned) => (MobileRegistrationStatus.NotRegistered, null),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, _, true, true, MobileNumberStatus.AssignedToNonPolicyParticipant) => (MobileRegistrationStatus.RegistrationComplete, MobileRegistrationStatus.Inactive),
                (ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, _, true, true, MobileNumberStatus.Unassigned) => (MobileRegistrationStatus.RegistrationComplete, null),

                (ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut, _, _, _, MobileNumberStatus.AssignedToPolicyParticipant) => (MobileRegistrationStatus.PendingResolution, null),
                (ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut, _, false, false, MobileNumberStatus.AssignedToNonPolicyParticipant) => (MobileRegistrationStatus.Disabled, MobileRegistrationStatus.Inactive),
                (ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut, _, false, false, MobileNumberStatus.Unassigned) => (MobileRegistrationStatus.Disabled, null),
                (ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut, _, true, false, MobileNumberStatus.AssignedToNonPolicyParticipant) => (MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive),
                (ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut, _, true, false, MobileNumberStatus.Unassigned) => (MobileRegistrationStatus.NotRegistered, null),
                (ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut, _, true, true, MobileNumberStatus.AssignedToNonPolicyParticipant) => (MobileRegistrationStatus.RegistrationComplete, MobileRegistrationStatus.Inactive),
                (ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut, _, true, true, MobileNumberStatus.Unassigned) => (MobileRegistrationStatus.RegistrationComplete, null),

                (_, _, _, _, _, MobileNumberStatus.AssignedToPolicyParticipant) when isUnlinked(participant.RegistrationDetails) => (MobileRegistrationStatus.PendingResolution, null),
                (_, _, _, false, false, MobileNumberStatus.AssignedToNonPolicyParticipant) when isUnlinked(participant.RegistrationDetails) => (MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive),
                (_, _, _, false, false, MobileNumberStatus.Unassigned) when isUnlinked(participant.RegistrationDetails) => (MobileRegistrationStatus.NotRegistered, null),
                (_, _, _, true, false, MobileNumberStatus.AssignedToNonPolicyParticipant) when isUnlinked(participant.RegistrationDetails) => (MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive),
                (_, _, _, true, false, MobileNumberStatus.Unassigned) when isUnlinked(participant.RegistrationDetails) => (MobileRegistrationStatus.NotRegistered, null),
                (_, _, _, true, true, MobileNumberStatus.AssignedToNonPolicyParticipant) when isUnlinked(participant.RegistrationDetails) => (MobileRegistrationStatus.RegistrationComplete, MobileRegistrationStatus.Inactive),
                (_, _, _, true, true, MobileNumberStatus.Unassigned) when isUnlinked(participant.RegistrationDetails) => (MobileRegistrationStatus.RegistrationComplete, null),

                (_, _, _, true, false, MobileNumberStatus.AssignedToPolicyParticipant) => (MobileRegistrationStatus.PendingResolution, null),
                (_, _, _, true, false, MobileNumberStatus.AssignedToNonPolicyParticipant) => (MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive),
                (_, _, _, true, false, MobileNumberStatus.Unassigned) => (MobileRegistrationStatus.NotRegistered, null),
                (_, _, _, true, true, MobileNumberStatus.AssignedToPolicyParticipant) => (MobileRegistrationStatus.PendingResolution, null),
                (_, _, _, true, true, MobileNumberStatus.AssignedToNonPolicyParticipant) => (MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive),
                (_, _, _, true, true, MobileNumberStatus.Unassigned) => (MobileRegistrationStatus.NotRegistered, null),
                (_, _, _, false, false, MobileNumberStatus.AssignedToPolicyParticipant) => (MobileRegistrationStatus.PendingResolution, null),
                (_, _, _, false, false, MobileNumberStatus.AssignedToNonPolicyParticipant) => (MobileRegistrationStatus.Disabled, MobileRegistrationStatus.Inactive),
                (_, _, _, false, false, MobileNumberStatus.Unassigned) => (MobileRegistrationStatus.Disabled, null),

                _ => new Func<(MobileRegistrationStatus, MobileRegistrationStatus?)>(() =>
                {
                    logger.LogError(LoggingEvents.UpdateRegistrationCodeHelper_NoDecisionMatch, "No match found for {Data} in registration status code decision table.",
                        new
                        {
                            ParticipantStatus = participant.SnapshotDetails?.Status,
                            ParticipantReasonCode = participant.SnapshotDetails?.ReasonCode,
                            OptOutReasonCode = participant.SnapshotDetails?.OptOutDetails?.Reason,
                            OptOutDate = participant.SnapshotDetails?.OptOutDetails?.Date,
                            ADEnrolled = participant.AreDetails?.ADEnrolled,
                            ADActivated = participant.AreDetails?.ADActivated,
                            PhoneNumberStatus = phoneNumberStatus
                        });
                    return (MobileRegistrationStatus.Disabled, null);
                })()
            };

            return Task.FromResult(result);
        }


    }
}
