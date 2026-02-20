using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DeepEqual.Syntax;
using Moq;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Business.ResponseModels.CustomerService.Policy;
using Progressive.Telematics.Admin.Business.ResponseModels.CustomerService.Registration;
using Progressive.Telematics.Admin.Services.Api;
using Progressive.Telematics.Admin.Services.Database;
using Progressive.Telematics.Admin.Services.Models;
using Progressive.Telematics.Admin.Shared;
using Xunit;

namespace Progressive.Telematics.Admin.Business.Tests.CustomerService.PolicyOrchestrators
{
    public class PolicyOrchestratorTests : TestBase<PolicyOrchestrator, IPolicyOrchestrator>
    {
        private readonly string policyNumber = "policyNumber";
        private readonly string serialNumber = "serialNumber";

        public PolicyOrchestratorTests() : base()
        {

            Orchestrator = new PolicyOrchestrator(
                Apis.Policy.Object,
                Databases.Homebase.Object,
                Services.Policy.Object,
                Databases.Policy.Object,
                Orchestrators.ArePolicy.Object,
                Apis.HomebaseParticipantManagement.Object,
                Orchestrators.SnapshotPolicy.Object,
                Orchestrators.Registration.Object,
                Apis.ClaimsRegistration.Object,
                Mapper,
                Logger.Object);
        }

        [Fact]
        public async Task GetPolicy_Success()
        {
            var snapshotPolicy = CreatePolicy();
            var arePolicy = CreatePolicy(2);
            var registrations = CreateRegistrations(2);

            Orchestrators.SnapshotPolicy.Setup(x => x.GetPolicySummary(policyNumber, null, null)).ReturnsAsync(snapshotPolicy);
            Orchestrators.ArePolicy.Setup(x => x.GetPolicySummary(policyNumber)).ReturnsAsync(arePolicy);
            Orchestrators.Registration.Setup(x => x.GetRegistrations(It.IsAny<List<string>>(), Services.RolloutHelper.Object, It.IsAny<bool>())).ReturnsAsync(new GetRegistrationResponse.Success { Registrations = registrations });

            var result = await Orchestrator.GetPolicy(policyNumber, Services.RolloutHelper.Object);

            Assert.Equal(typeof(GetPolicyResponse.Success), result.GetType());
            VerifyAllServices();
        }

        [Fact]
        public async Task GetAllParticipantsHomebaseSummaryOnPolicy_Success()
        {
            // Arrange
            var testParticipants = new List<HomebaseParticipantSummaryResponse> {
                new HomebaseParticipantSummaryResponse
                {
                    TelematicsId = "285f64b8-5355-4dcd-99ac-ae87d3b6b4e5"
                },
                new HomebaseParticipantSummaryResponse
                {
                    TelematicsId = "385f64b8-3355-3dcd-19ac-5e84d3b6b4e2"
                } };

            Apis.HomebaseParticipantManagement.Setup(x => x.GetPolicySummary(policyNumber)).ReturnsAsync(new HomebasePolicySummaryResponse { Participants = testParticipants });

            // Act
            var result = await Orchestrator.GetAllParticipantsHomebaseSummaryOnPolicy(policyNumber);

            // Assert
            Assert.IsType<GetHomebaseParticipantSummaryResponse.Success>(result);
            var successResult = result as GetHomebaseParticipantSummaryResponse.Success;
            Assert.NotNull(successResult.Participants);
            ((GetHomebaseParticipantSummaryResponse.Success)result).Participants.ShouldDeepEqual(testParticipants);
            VerifyAllServices();
        }

        [Fact]
        public async Task GetAllParticipantsHomebaseSummaryOnPolicy_Failure()
        {
            // Arrange
            Apis.HomebaseParticipantManagement.Setup(x => x.GetPolicySummary(policyNumber))
                .ThrowsAsync(new Exception());
            Logger.ExpectError();

            // Act
            var result = await Orchestrator.GetAllParticipantsHomebaseSummaryOnPolicy(policyNumber);

            // Assert
            Assert.IsType<GetHomebaseParticipantSummaryResponse.Failure>(result);
            VerifyAllServices();
        }

        [Fact]
        public async Task GetPolicy_NoRegistrationDataFound()
        {
            var policy = CreatePolicy();

            Orchestrators.SnapshotPolicy.Setup(x => x.GetPolicySummary(policyNumber, null, null)).ReturnsAsync(policy);
            Orchestrators.ArePolicy.Setup(x => x.GetPolicySummary(It.IsAny<string>())).ReturnsAsync(() => null);
            Orchestrators.Registration.Setup(x => x.GetRegistrations(new List<string> { policy.Participants.First().TelematicsId }, Services.RolloutHelper.Object, It.IsAny<bool>())).ReturnsAsync(new GetRegistrationResponse.Failure());

            var result = await Orchestrator.GetPolicy(policyNumber, Services.RolloutHelper.Object);

            Assert.Equal(typeof(GetPolicyResponse.NoRegistrationData), result.GetType());
            VerifyAllServices();
        }

        [Fact]
        public async Task GetPolicy_NoPolicyFound()
        {
            Orchestrators.SnapshotPolicy.Setup(x => x.GetPolicySummary(It.IsAny<string>(), null, null)).ReturnsAsync(() => null);
            Orchestrators.ArePolicy.Setup(x => x.GetPolicySummary(It.IsAny<string>())).ReturnsAsync(() => null);
            Logger.ExpectWarning();

            var result = await Orchestrator.GetPolicy(policyNumber, Services.RolloutHelper.Object);

            Assert.Equal(typeof(GetPolicyResponse.SuccessWithNoResults), result.GetType());
            Assert.Equal("-1", ((GetPolicyResponse.SuccessWithNoResults)result).Policy.PolicyNumber);
            Assert.Equal("Policy Not Found", ((GetPolicyResponse.SuccessWithNoResults)result).Policy.Messages[MessageCode.Error]);
            VerifyAllServices();
        }

        [Fact]
        public async Task GetPolicy_Failure()
        {
            Orchestrators.SnapshotPolicy.Setup(x => x.GetPolicySummary(It.IsAny<string>(), null, null)).Throws(new Exception());
            Logger.ExpectError();

            var result = await Orchestrator.GetPolicy(policyNumber, Services.RolloutHelper.Object);

            Assert.Equal(typeof(GetPolicyResponse.Failure), result.GetType());
            VerifyAllServices();
        }

        [Fact]
        public async Task GetPolicyByDeviceSerialNumber_Success()
        {
            var policy = CreatePolicy();

            Orchestrators.SnapshotPolicy.Setup(x => x.GetPolicyByDeviceSerialNumber(serialNumber)).ReturnsAsync(policy);

            var result = await Orchestrator.GetPolicyByDeviceSerialNumber(serialNumber);

            Assert.Equal(typeof(GetPolicyByDeviceSerialNumberResponse.Success), result.GetType());
            ((GetPolicyByDeviceSerialNumberResponse.Success)result).Policy.ShouldDeepEqual(policy);
            VerifyAllServices();
        }

        [Fact]
        public async Task GetPolicyByDeviceSerialNumber_Failure()
        {
            Orchestrators.SnapshotPolicy.Setup(x => x.GetPolicyByDeviceSerialNumber(It.IsAny<string>())).Throws(new Exception());
            Logger.ExpectError();

            var result = await Orchestrator.GetPolicyByDeviceSerialNumber("serialNumber");

            Assert.Equal(typeof(GetPolicyByDeviceSerialNumberResponse.Failure), result.GetType());
            VerifyAllServices();
        }

        [Fact]
        public async Task UpdateMailingAddress_Success()
        {
            Services.Policy.Setup(x => x.UpdateAddress(policyNumber, "contact", "address1", "address2", "city", "state", "zip")).ReturnsAsync(new WcfPolicyService.UpdateAddressResponse { ResponseStatus = WcfPolicyService.ResponseStatus.Success });

            var result = await Orchestrator.UpdateMailingAddress(policyNumber, "contact", "address1", "address2", "city", "state", "zip");

            Assert.Equal(typeof(UpdateMailingAddressResponse.Success), result.GetType());
            VerifyAllServices();
        }

        [Fact]
        public async Task UpdateMailingAddress_Failure()
        {
            Services.Policy.Setup(x => x.UpdateAddress(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Throws(new Exception());
            Logger.ExpectError();

            var result = await Orchestrator.UpdateMailingAddress(policyNumber, "contact", "address1", "address2", "city", "state", "zip");

            Assert.Equal(typeof(UpdateMailingAddressResponse.Failure), result.GetType());
            VerifyAllServices();
        }

        [Fact]
        public async Task UpdateAppAssignment_Success()
        {
            Apis.Policy.Setup(x => x.SetPolicyAppAssignment(policyNumber, "appName")).ReturnsAsync(true);

            var result = await Orchestrator.UpdateAppAssignment(policyNumber, "appName");

            Assert.Equal(typeof(UpdateAppAssignmentResponse.Success), result.GetType());
            VerifyAllServices();
        }

        [Fact]
        public async Task UpdateAppAssignment_PolicyApiFailure()
        {
            Apis.Policy.Setup(x => x.SetPolicyAppAssignment(policyNumber, "appName")).ReturnsAsync(false);
            Logger.ExpectError();

            var result = await Orchestrator.UpdateAppAssignment(policyNumber, "appName");

            Assert.Equal(typeof(UpdateAppAssignmentResponse.Failure), result.GetType());
            VerifyAllServices();
        }

        [Fact]
        public async Task UpdateAppAssignment_UnknownFailure()
        {
            Apis.Policy.Setup(x => x.SetPolicyAppAssignment(It.IsAny<string>(), It.IsAny<string>())).Throws(new Exception());
            Logger.ExpectError();

            var result = await Orchestrator.UpdateAppAssignment(policyNumber, "appName");

            Assert.Equal(typeof(UpdateAppAssignmentResponse.Failure), result.GetType());
            VerifyAllServices();
        }

        [Fact]
        public async Task GetParticipantsEligibleForTransfer_Success()
        {
            var policy = CreatePolicy(2);

            Orchestrators.SnapshotPolicy.Setup(x => x.GetParticipantsEligibleForTransfer(policyNumber, "newPolicyNumber")).ReturnsAsync(policy.Participants);

            var result = await Orchestrator.GetParticipantsEligibleForTransfer(policyNumber, "newPolicyNumber");

            Assert.Equal(typeof(GetEligibleTransferParticipantsResponse.Success), result.GetType());
            ((GetEligibleTransferParticipantsResponse.Success)result).EligibleParticipants.ShouldDeepEqual(policy.Participants);
            VerifyAllServices();
        }

        [Fact]
        public async Task GetParticipantsEligibleForTransfer_Failure()
        {
            Orchestrators.SnapshotPolicy.Setup(x => x.GetParticipantsEligibleForTransfer(It.IsAny<string>(), It.IsAny<string>())).Throws(new Exception());
            Logger.ExpectError();

            var result = await Orchestrator.GetParticipantsEligibleForTransfer(policyNumber, "newPolicyNumber");

            Assert.Equal(typeof(GetEligibleTransferParticipantsResponse.Failure), result.GetType());
            VerifyAllServices();
        }

        [Fact]
        public async Task GetParticipantByTelematicsId_Success()
        {
            var snapshotPolicy = CreatePolicy();
            var arePolicy = CreatePolicy(2);
            var registrations = CreateRegistrations(2);

            Orchestrators.SnapshotPolicy.Setup(x => x.GetPolicySummary(policyNumber, null, null)).ReturnsAsync(snapshotPolicy);
            Orchestrators.ArePolicy.Setup(x => x.GetPolicySummary(policyNumber)).ReturnsAsync(arePolicy);
            Orchestrators.Registration.Setup(x => x.GetRegistrations(It.IsAny<List<string>>(), Services.RolloutHelper.Object, It.IsAny<bool>())).ReturnsAsync(new GetRegistrationResponse.Success { Registrations = registrations });

            var result = await Orchestrator.GetParticipantByTelematicsId(policyNumber, "telematicsId0", Services.RolloutHelper.Object);

            var expected = snapshotPolicy.Participants.First();
            expected.RegistrationDetails = registrations.First();

            Assert.Equal(typeof(GetParticipantResponse.Success), result.GetType());
            ((GetParticipantResponse.Success)result).Participant.ShouldDeepEqual(expected);
            VerifyAllServices();
        }

        [Fact]
        public async Task GetParticipantByTelematicsId_GetPolicyFailure()
        {
            var policy = CreatePolicy();

            Orchestrators.SnapshotPolicy.Setup(x => x.GetPolicySummary(policyNumber, null, null)).ReturnsAsync(policy);
            Orchestrators.ArePolicy.Setup(x => x.GetPolicySummary(policyNumber)).ReturnsAsync(() => null);
            Orchestrators.Registration.Setup(x => x.GetRegistrations(new List<string> { policy.Participants.First().TelematicsId }, Services.RolloutHelper.Object, It.IsAny<bool>())).ReturnsAsync(new GetRegistrationResponse.Failure());

            var result = await Orchestrator.GetParticipantByTelematicsId(policyNumber, "telematicsId", Services.RolloutHelper.Object);

            Assert.Equal(typeof(GetParticipantResponse.Failure), result.GetType());
            VerifyAllServices();
        }

        [Fact]
        public async Task GetParticipantByTelematicsId_UnknownFailure()
        {
            Orchestrators.SnapshotPolicy.Setup(x => x.GetPolicySummary(It.IsAny<string>(), null, null)).Throws(new Exception());
            Logger.ExpectError();

            var result = await Orchestrator.GetParticipantByTelematicsId(policyNumber, "telematicsId", Services.RolloutHelper.Object);

            Assert.Equal(typeof(GetParticipantResponse.Failure), result.GetType());
            VerifyAllServices();
        }

        [Fact]
        public async Task GetParticipantBySeqId_Success()
        {
            var snapshotPolicy = CreatePolicy();
            var arePolicy = CreatePolicy(2);
            var registrations = CreateRegistrations(2);

            Orchestrators.SnapshotPolicy.Setup(x => x.GetPolicySummary(policyNumber, null, null)).ReturnsAsync(snapshotPolicy);
            Orchestrators.ArePolicy.Setup(x => x.GetPolicySummary(policyNumber)).ReturnsAsync(arePolicy);
            Orchestrators.Registration.Setup(x => x.GetRegistrations(It.IsAny<List<string>>(), Services.RolloutHelper.Object, It.IsAny<bool>())).ReturnsAsync(new GetRegistrationResponse.Success { Registrations = registrations });

            var result = await Orchestrator.GetParticipantBySeqId(policyNumber, 1, Services.RolloutHelper.Object);

            var expected = snapshotPolicy.Participants.First();
            expected.RegistrationDetails = registrations.First();

            Assert.Equal(typeof(GetParticipantResponse.Success), result.GetType());
            ((GetParticipantResponse.Success)result).Participant.ShouldDeepEqual(expected);
            VerifyAllServices();
        }

        [Fact]
        public async Task GetParticipantBySeqId_GetPolicyFailure()
        {
            var policy = CreatePolicy();

            Orchestrators.SnapshotPolicy.Setup(x => x.GetPolicySummary(policyNumber, null, null)).ReturnsAsync(policy);
            Orchestrators.ArePolicy.Setup(x => x.GetPolicySummary(policyNumber)).ReturnsAsync(() => null);
            Orchestrators.Registration.Setup(x => x.GetRegistrations(new List<string> { policy.Participants.First().TelematicsId }, Services.RolloutHelper.Object, It.IsAny<bool>())).ReturnsAsync(new GetRegistrationResponse.Failure());

            var result = await Orchestrator.GetParticipantBySeqId(policyNumber, 1, Services.RolloutHelper.Object);

            Assert.Equal(typeof(GetParticipantResponse.Failure), result.GetType());
            VerifyAllServices();
        }

        [Fact]
        public async Task GetParticipantBySeqId_UnknownFailure()
        {
            Orchestrators.SnapshotPolicy.Setup(x => x.GetPolicySummary(It.IsAny<string>(), null, null)).Throws(new Exception());
            Logger.ExpectError();

            var result = await Orchestrator.GetParticipantBySeqId(policyNumber, 1, Services.RolloutHelper.Object);

            Assert.Equal(typeof(GetParticipantResponse.Failure), result.GetType());
            VerifyAllServices();
        }

        private Policy CreatePolicy(int participants = 1)
        {
            var policy = new Policy
            {
                PolicyNumber = "policyNumber",
                Participants = new List<Participant>()
            };

            for (int i = 0; i < participants; i++)
            {
                policy.Participants.Add(new Participant
                {
                    TelematicsId = $"telematicsId{i}",
                    SnapshotDetails = new SnapshotParticipantDetails
                    {
                        ParticipantSeqId = i + 1
                    },
                    MobileDeviceDetails = new MobileDevice
                    {
                        MobileDeviceAliasName = "Nickname"
                    }
                });
            }

            return policy;
        }

        private List<Registration> CreateRegistrations(int count = 1)
        {
            var registrations = new List<Registration>();
            for (int i = 0; i < count; i++)
            {
                registrations.Add(new Registration
                {
                    ParticipantExternalId = $"telematicsId{i}",
                    StatusSummary = StatusSummary.New,
                    PolicyParticipant = new PolicyDriverData
                    {
                        PolicyNumber = policyNumber,
                        DriverFirstName = $"FirstName{i}",
                        DriverLastName = $"LastName{i}",
                        PJStatus = $"Status{i}"
                    }
                });
            }
            return registrations;
        }
    }
}
