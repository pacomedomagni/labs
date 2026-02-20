using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService.Helpers;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Shared;
using Xunit;

namespace Progressive.Telematics.Admin.Business.Tests.CustomerService.Helpers
{
    public class UpdateRegistrationCodeHelperTests
    {
        private Mock<ILogger<UpdateRegistrationCodeHelper>> logger { get; set; }
        private UpdateRegistrationCodeHelper regCodeHelper { get; set; }
        private static readonly Func<MobileRegistrationStatus, MobileRegistrationStatus?, Tuple<MobileRegistrationStatus, MobileRegistrationStatus?>> tuple = (x, y) => new Tuple<MobileRegistrationStatus, MobileRegistrationStatus?>(x, y);

        public UpdateRegistrationCodeHelperTests()
        {
            logger = Mock.Get(Mock.Of<ILogger<UpdateRegistrationCodeHelper>>());
            regCodeHelper = new UpdateRegistrationCodeHelper(logger.Object);
        }

        public static readonly object[][] ParticipantTestData =
        {
			//Inactive/Canceled scenarios
			new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.Inactive, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled, areEnrolled: true), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled, areEnrolled: true, areActivated: true), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled), MobileNumberStatus.AssignedToNonPolicyParticipant, tuple(MobileRegistrationStatus.Inactive, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.Inactive, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled, areEnrolled: true), MobileNumberStatus.AssignedToNonPolicyParticipant, tuple(MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled, areEnrolled: true), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.NotRegistered, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled, areEnrolled: true, areActivated: true), MobileNumberStatus.AssignedToNonPolicyParticipant, tuple(MobileRegistrationStatus.RegistrationComplete, MobileRegistrationStatus.Inactive) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled, areEnrolled: true, areActivated: true), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.RegistrationComplete, null) },
			//Active/Collecting Data scenarios
			new object[] { CreateParticipant(ParticipantStatus.Active, ParticipantReasonCode.CollectingData), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(ParticipantStatus.Active, ParticipantReasonCode.CollectingData, areEnrolled: true), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(ParticipantStatus.Active, ParticipantReasonCode.CollectingData, areEnrolled: true, areActivated: true), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(ParticipantStatus.Active, ParticipantReasonCode.CollectingData), MobileNumberStatus.AssignedToNonPolicyParticipant, tuple(MobileRegistrationStatus.RegistrationComplete, MobileRegistrationStatus.Inactive) },
            new object[] { CreateParticipant(ParticipantStatus.Active, ParticipantReasonCode.CollectingData), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.RegistrationComplete, null) },
            new object[] { CreateParticipant(ParticipantStatus.Active, ParticipantReasonCode.CollectingData, areEnrolled: true, areActivated: true), MobileNumberStatus.AssignedToNonPolicyParticipant, tuple(MobileRegistrationStatus.RegistrationComplete, MobileRegistrationStatus.Inactive) },
            new object[] { CreateParticipant(ParticipantStatus.Active, ParticipantReasonCode.CollectingData, areEnrolled: true, areActivated: true), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.RegistrationComplete, null) },
			//Inactive/Opted-Out scenarios
			new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-30)), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-31)), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.DriverDelete), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-30), areEnrolled: true), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-31), areEnrolled: true), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonCommunicator, areEnrolled: true), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-30), areEnrolled: true, areActivated: true), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-31), areEnrolled: true, areActivated: true), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NotFitMilesTrips, areEnrolled: true, areActivated: true), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-31)), MobileNumberStatus.AssignedToNonPolicyParticipant, tuple(MobileRegistrationStatus.Disabled, MobileRegistrationStatus.Inactive) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.VehicleDelete, DateTime.Today.AddDays(-31)), MobileNumberStatus.AssignedToNonPolicyParticipant, tuple(MobileRegistrationStatus.Disabled, MobileRegistrationStatus.Inactive) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-31)), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.Disabled, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.MonitoringComplete, DateTime.Today.AddDays(-31)), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.Disabled, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-30)), MobileNumberStatus.AssignedToNonPolicyParticipant, tuple(MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-30)), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.NotRegistered, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-31), areEnrolled: true), MobileNumberStatus.AssignedToNonPolicyParticipant, tuple(MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.Cancel, DateTime.Today.AddDays(-31), areEnrolled: true), MobileNumberStatus.AssignedToNonPolicyParticipant, tuple(MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-30), areEnrolled: true), MobileNumberStatus.AssignedToNonPolicyParticipant, tuple(MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-31), areEnrolled: true), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.NotRegistered, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.Cancel, areEnrolled: true), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.NotRegistered, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-30), areEnrolled: true), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.NotRegistered, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-31), areEnrolled: true, areActivated: true), MobileNumberStatus.AssignedToNonPolicyParticipant, tuple(MobileRegistrationStatus.RegistrationComplete, MobileRegistrationStatus.Inactive) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.Cancel, DateTime.Today.AddDays(-31), areEnrolled: true, areActivated: true), MobileNumberStatus.AssignedToNonPolicyParticipant, tuple(MobileRegistrationStatus.RegistrationComplete, MobileRegistrationStatus.Inactive) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-31), areEnrolled: true, areActivated: true), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.RegistrationComplete, null) },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-30), areEnrolled: true, areActivated: true), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.RegistrationComplete, null) },
			//Unenrolled/Opted-Out scenarios
			new object[] { CreateParticipant(ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut, areEnrolled: true), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut, areEnrolled: true, areActivated: true), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut), MobileNumberStatus.AssignedToNonPolicyParticipant, tuple(MobileRegistrationStatus.Disabled, MobileRegistrationStatus.Inactive) },
            new object[] { CreateParticipant(ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.Disabled, null) },
            new object[] { CreateParticipant(ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut, areEnrolled: true), MobileNumberStatus.AssignedToNonPolicyParticipant, tuple(MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive) },
            new object[] { CreateParticipant(ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut, areEnrolled: true), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.NotRegistered, null) },
            new object[] { CreateParticipant(ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut, areEnrolled: true, areActivated: true), MobileNumberStatus.AssignedToNonPolicyParticipant, tuple(MobileRegistrationStatus.RegistrationComplete, MobileRegistrationStatus.Inactive) },
            new object[] { CreateParticipant(ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut, areEnrolled: true, areActivated: true), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.RegistrationComplete, null) },
			//Pending/Pending Registration scenarios
			new object[] { CreateParticipant(ParticipantStatus.Pending, ParticipantReasonCode.MobilePendingRegistration), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(ParticipantStatus.Pending, ParticipantReasonCode.MobilePendingRegistration, areEnrolled: true), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(ParticipantStatus.Pending, ParticipantReasonCode.MobilePendingRegistration, areEnrolled: true, areActivated: true), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(ParticipantStatus.Pending, ParticipantReasonCode.MobilePendingRegistration), MobileNumberStatus.AssignedToNonPolicyParticipant, tuple(MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive) },
            new object[] { CreateParticipant(ParticipantStatus.Pending, ParticipantReasonCode.MobilePendingRegistration), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.NotRegistered, null) },
            new object[] { CreateParticipant(ParticipantStatus.Pending, ParticipantReasonCode.MobilePendingRegistration, areEnrolled: true), MobileNumberStatus.AssignedToNonPolicyParticipant, tuple(MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive) },
            new object[] { CreateParticipant(ParticipantStatus.Pending, ParticipantReasonCode.MobilePendingRegistration, areEnrolled: true), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.NotRegistered, null) },
			//Unlinked Participant (certain 3.0) scenarios
			new object[] { CreateParticipant(telematicsId: null), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(telematicsId: null, areEnrolled: true), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(telematicsId: null, areEnrolled: true, areActivated: true), MobileNumberStatus.AssignedToPolicyParticipant, tuple(MobileRegistrationStatus.PendingResolution, null) },
            new object[] { CreateParticipant(telematicsId: null), MobileNumberStatus.AssignedToNonPolicyParticipant, tuple(MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive) },
            new object[] { CreateParticipant(telematicsId: null), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.NotRegistered, null) },
            new object[] { CreateParticipant(telematicsId: null, areEnrolled: true), MobileNumberStatus.AssignedToNonPolicyParticipant, tuple(MobileRegistrationStatus.NotRegistered, MobileRegistrationStatus.Inactive) },
            new object[] { CreateParticipant(telematicsId: null, areEnrolled: true), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.NotRegistered, null) },
            new object[] { CreateParticipant(telematicsId: null, areEnrolled: true, areActivated: true), MobileNumberStatus.AssignedToNonPolicyParticipant, tuple(MobileRegistrationStatus.RegistrationComplete, MobileRegistrationStatus.Inactive) },
            new object[] { CreateParticipant(telematicsId: null, areEnrolled: true, areActivated: true), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.RegistrationComplete, null) },
			//Logger scenario
			new object[] { CreateParticipant(ParticipantStatus.Active, ParticipantReasonCode.CollectingData, areEnrolled: false, areActivated: true), MobileNumberStatus.Unassigned, tuple(MobileRegistrationStatus.Disabled, null), true },
        };

        [Theory, MemberData(nameof(ParticipantTestData))]
        public async Task DetermineRegistrationStatusForRegistrationCodeChange_Tests(Participant participant, MobileNumberStatus currentMobileStatus, Tuple<MobileRegistrationStatus, MobileRegistrationStatus?> expectedStatus, bool? unexpectedResult = false)
        {
            if (unexpectedResult == true)
                logger.ExpectError();

            var (registrationStatus, nonPolicyRegistrationStatus) = await regCodeHelper.DetermineRegistrationStatusForRegistrationCodeChange(participant, currentMobileStatus);

            Assert.Equal((expectedStatus.Item1, expectedStatus.Item2), (registrationStatus, nonPolicyRegistrationStatus));

            logger.Verify();
        }

        private static Participant CreateParticipant(
            ParticipantStatus? participantStatus = null,
            ParticipantReasonCode? participantReasonCode = null,
            OptOutReasonCode? optOutReasonCode = null,
            DateTime? optOutDate = null,
            string telematicsId = "123",
            bool? areEnrolled = null,
            bool? areActivated = null)
        {
            var participant = new Participant();

            if (!string.IsNullOrWhiteSpace(telematicsId))
            {
                participant.TelematicsId = telematicsId;
                participant.RegistrationDetails = new Registration { ParticipantExternalId = telematicsId };
            }

            if (participantStatus.HasValue || participantReasonCode.HasValue || optOutReasonCode.HasValue || optOutDate.HasValue)
            {
                participant.SnapshotDetails = new SnapshotParticipantDetails
                {
                    Status = participantStatus ?? ParticipantStatus.Active,
                    ReasonCode = participantReasonCode ?? ParticipantReasonCode.AutomatedOptInEndorsementPending
                };

                if (optOutReasonCode.HasValue || optOutDate.HasValue)
                {
                    participant.SnapshotDetails.OptOutDetails = new OptOutData
                    {
                        Reason = optOutReasonCode.Value,
                        Date = optOutDate
                    };
                }
            }

            if (areEnrolled.HasValue)
            {
                participant.AreDetails = new AreParticipantDetails
                {
                    ADEnrolled = areEnrolled.Value,
                    ADActivated = areActivated ?? false
                };
            }

            return participant;
        }
    }
}
