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
    public class UnlockRegistrationHelperTests
    {
        private Mock<ILogger<UnlockRegistrationHelper>> logger { get; set; }
        private UnlockRegistrationHelper unlockHelper { get; set; }

        public UnlockRegistrationHelperTests()
        {
            logger = Mock.Get(Mock.Of<ILogger<UnlockRegistrationHelper>>());
            unlockHelper = new UnlockRegistrationHelper(logger.Object);
        }

        public static readonly object[][] ParticipantTestData =
        {
			//Not Registered (New) scenarios
			new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-30)), MobileRegistrationStatus.NotRegistered },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-30), true), MobileRegistrationStatus.NotRegistered },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-31), true), MobileRegistrationStatus.NotRegistered },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, areEnrolled: true), MobileRegistrationStatus.NotRegistered },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled, areEnrolled: true), MobileRegistrationStatus.NotRegistered },
            new object[] { CreateParticipant(ParticipantStatus.Pending, ParticipantReasonCode.MobilePendingRegistration, areEnrolled: false), MobileRegistrationStatus.NotRegistered },
            new object[] { CreateParticipant(ParticipantStatus.Pending, ParticipantReasonCode.MobilePendingRegistration, areEnrolled: true), MobileRegistrationStatus.NotRegistered },
            new object[] { CreateParticipant(ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut, areEnrolled: true), MobileRegistrationStatus.NotRegistered },
            new object[] { CreateParticipant(areEnrolled: true), MobileRegistrationStatus.NotRegistered },
			//Registration Complete scenarios
			new object[] { CreateParticipant(ParticipantStatus.Active, ParticipantReasonCode.CollectingData), MobileRegistrationStatus.RegistrationComplete },
            new object[] { CreateParticipant(ParticipantStatus.Active, ParticipantReasonCode.CollectingData, areEnrolled: true, areActivated: true), MobileRegistrationStatus.RegistrationComplete },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-31), true, true), MobileRegistrationStatus.RegistrationComplete },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, areEnrolled: true, areActivated: true), MobileRegistrationStatus.RegistrationComplete },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled, areEnrolled: true, areActivated: true), MobileRegistrationStatus.RegistrationComplete },
            new object[] { CreateParticipant(ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut, areEnrolled: true, areActivated: true), MobileRegistrationStatus.RegistrationComplete },
            new object[] { CreateParticipant(areEnrolled: true, areActivated: true), MobileRegistrationStatus.RegistrationComplete },
			//Inactive scenarios
			new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.PolicyCanceled), MobileRegistrationStatus.Inactive },
			//Disabled scenarios
			new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller), MobileRegistrationStatus.Disabled },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut, OptOutReasonCode.NonInstaller, DateTime.Today.AddDays(-31), false), MobileRegistrationStatus.Disabled },
            new object[] { CreateParticipant(ParticipantStatus.Inactive, ParticipantReasonCode.ParticipantOptedOut), MobileRegistrationStatus.Disabled },
            new object[] { CreateParticipant(ParticipantStatus.Unenrolled, ParticipantReasonCode.ParticipantOptedOut), MobileRegistrationStatus.Disabled },
            new object[] { CreateParticipant(areEnrolled: false), MobileRegistrationStatus.Disabled },
			//Logger scenario
			new object[] { CreateParticipant(areEnrolled: false, areActivated: true), MobileRegistrationStatus.Disabled, true },
        };

        [Theory, MemberData(nameof(ParticipantTestData))]
        public async Task DetermineRegistrationStatusAfterUnlock_Tests(Participant participant, MobileRegistrationStatus expectedStatus, bool? unexpectedResult = false)
        {
            if (unexpectedResult == true)
                logger.ExpectWarning();

            var status = await unlockHelper.DetermineRegistrationStatusAfterUnlock(participant);

            Assert.Equal(expectedStatus, status);
            logger.Verify();
        }

        private static Participant CreateParticipant(
            ParticipantStatus? participantStatus = null,
            ParticipantReasonCode? participantReasonCode = null,
            OptOutReasonCode? optOutReasonCode = null,
            DateTime? optOutDate = null,
            bool? areEnrolled = null,
            bool? areActivated = null)
        {
            var participant = new Participant();
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
