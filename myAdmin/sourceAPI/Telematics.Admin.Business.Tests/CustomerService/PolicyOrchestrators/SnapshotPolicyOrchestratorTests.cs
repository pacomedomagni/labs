using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using Progressive.FeatureFlags;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService.Flagr;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Business.Resources.Resources.Snapshot;
using Progressive.Telematics.Admin.Services.Models.ClaimsRegistrationApi;
using Xunit;

namespace Progressive.Telematics.Admin.Business.Tests.CustomerService.PolicyOrchestrators
{
    public class SnapshotPolicyOrchestratorTests : TestBase<SnapshotPolicyOrchestrator, ISnapshotPolicyOrchestrator>
    {
        private readonly string policyNumber = "policyNumber";
        private readonly string phoneNumber = "phoneNumber";
        private readonly string serialNumber = "serialNumber";
        public SnapshotPolicyOrchestratorTests() : base()
        {
            Orchestrator = new SnapshotPolicyOrchestrator(
                Apis.Common.Object,
                Apis.Device.Object,
                Apis.PolicyDevice.Object,
                Services.Policy.Object,
                Orchestrators.Mobile.Object,
                Orchestrators.Plugin.Object,
                Databases.Policy.Object,
                Logger.Object,
                Mapper,
                Orchestrators.ScoringAlgorithmOrchestrator.Object,
                Apis.ClaimsRegistration.Object
                );
        }

        [Fact]
        public async Task GetPolicyByPolicyNumber_PolicyFound()
        {
            var policy = CreatePolicy();
            var registrations = CreateLegacyRegistrations();

            Services.Policy.Setup(x => x.GetPolicy(policyNumber, null, null, "")).ReturnsAsync(new WcfPolicyService.GetPolicyResponse { ResponseStatus = WcfPolicyService.ResponseStatus.Success, Policy = policy });
            Orchestrators.Mobile.Setup(x => x.GetMobileRegistrationData(policy.GroupExternalId)).ReturnsAsync(registrations);

            var result = await Orchestrator.GetPolicySummary(policyNumber);

            Assert.NotNull(result);
            VerifyAllServices();
        }

        [Theory]
        [InlineData(WcfPolicyService.ResponseStatus.Success)]
        [InlineData(WcfPolicyService.ResponseStatus.Failure)]
        public async Task GetPolicyByPolicyNumber_PolicyNotFound(WcfPolicyService.ResponseStatus responseStatus)
        {
            Services.Policy.Setup(x => x.GetPolicy(policyNumber, null, null, "")).ReturnsAsync(new WcfPolicyService.GetPolicyResponse { ResponseStatus = responseStatus });

            var result = await Orchestrator.GetPolicySummary(policyNumber);

            Assert.Null(result);
            VerifyAllServices();
        }

        [Fact]
        public async Task GetPolicyByDeviceSerialNumber_PolicyFound()
        {
            var policy = CreatePolicy();
            var registrations = CreateLegacyRegistrations();

            Services.Policy.Setup(x => x.GetPolicy("", null, null, serialNumber)).ReturnsAsync(new WcfPolicyService.GetPolicyResponse { ResponseStatus = WcfPolicyService.ResponseStatus.Success, Policy = policy });
            Orchestrators.Mobile.Setup(x => x.GetMobileRegistrationData(policy.GroupExternalId)).ReturnsAsync(registrations);

            var result = await Orchestrator.GetPolicyByDeviceSerialNumber(serialNumber);

            Assert.NotNull(result);
            VerifyAllServices();
        }

        [Theory]
        [InlineData(WcfPolicyService.ResponseStatus.Success)]
        [InlineData(WcfPolicyService.ResponseStatus.Failure)]
        public async Task GetPolicyByDeviceSerialNumber_PolicyNotFound(WcfPolicyService.ResponseStatus responseStatus)
        {
            Services.Policy.Setup(x => x.GetPolicy("", null, null, serialNumber)).ReturnsAsync(new WcfPolicyService.GetPolicyResponse { ResponseStatus = responseStatus });

            var result = await Orchestrator.GetPolicyByDeviceSerialNumber(serialNumber);

            Assert.Null(result);
            VerifyAllServices();
        }

        [Fact]
        public async Task GetSnapshotPoliciesByMobileRegistrations_SinglePolicyTest()
        {
            var policy = CreatePolicy();
            var (registrations, participantsInfo) = CreateRegistrations();
            var mobileRegistrations = new MobileRegistrationsModel
            {
                ActiveRegistration = registrations.First()
            }.GetAllRegistrations();

            Databases.Policy.Setup(x => x.GetDriverDataByParticipantExternalId(registrations.First().TelematicsId)).ReturnsAsync(participantsInfo.First());

            Services.Policy.Setup(x => x.GetPolicy(policyNumber, null, null, "")).ReturnsAsync(new WcfPolicyService.GetPolicyResponse { ResponseStatus = WcfPolicyService.ResponseStatus.Success, Policy = policy });

            var result = await Orchestrator.GetSnapshotPoliciesByMobileRegistrations(mobileRegistrations);

            Assert.NotNull(result);
            VerifyAllServices();
        }

        [Fact]
        public async Task GetSnapshotPoliciesByMobileRegistrations_MultiPolicyTest()
        {
            var registrationCount = 3;
            var policy = CreatePolicy();
            var (registrations, participantsInfo) = CreateRegistrations(registrationCount);
            var getParticipantInfoCallIndex = 0;
            var mobileRegistrations = new MobileRegistrationsModel
            {
                ActiveRegistration = registrations.First(),
                OtherRegistrations = registrations.Skip(1)
            }.GetAllRegistrations();

            Databases.Policy.Setup(x => x.GetDriverDataByParticipantExternalId(It.IsAny<string>())).ReturnsAsync(() => participantsInfo[getParticipantInfoCallIndex++]);

            var results = await Orchestrator.GetSnapshotPoliciesByMobileRegistrations(mobileRegistrations);

            Assert.Equal(registrationCount, results.Count);
            for (int i = 0; i < results.Count; i++)
            {
                var result = results.ElementAt(i);
                Assert.Equal($"FirstName{i} LastName{i}", result.Extenders["DriverName"]);
                Assert.Equal($"Status{i}", result.Extenders["ParticipantStatus"]);
                Assert.Equal(StatusSummary.PendingResolution.ToString(), result.Extenders["StatusSummary"].ToString());
            }
            VerifyAllServices();
        }

        [Fact]
        public async Task GetSnapshotPoliciesByMobileRegistrations_PolicyNotFoundTest()
        {
            var results = await Orchestrator.GetSnapshotPoliciesByMobileRegistrations(null);
            Assert.Null(results);
            VerifyAllServices();
        }

        [Fact]
        public async Task GetSnapshotPoliciesByMobileRegistrations_SomeParticipantInfoNull_ReturnsOnlyNonNullPolicies()
        {
            // Arrange
            var registrationCount = 2;
            var policy = CreatePolicy();
            var (registrations, participantsInfo) = CreateRegistrations(registrationCount);
            var mobileRegistrations = new MobileRegistrationsModel
            {
                ActiveRegistration = registrations.First(),
                OtherRegistrations = registrations.Skip(1)
            }.GetAllRegistrations();

            Databases.Policy.Setup(x => x.GetDriverDataByParticipantExternalId("TelematicsId0"))
                .ReturnsAsync(new SnapshotMobileParticipant
                {
                    PolicyNumber = "PN2",
                    Status = "Active",
                    DriverFirstName = "John",
                    DriverLastName = "Doe"
                });
            Databases.Policy.Setup(x => x.GetDriverDataByParticipantExternalId("TelematicsId1"))
                .ReturnsAsync((SnapshotMobileParticipant)null);

            Services.Policy.Setup(x => x.GetPolicy("PN2", null, null, "")).ReturnsAsync(new WcfPolicyService.GetPolicyResponse { ResponseStatus = WcfPolicyService.ResponseStatus.Success, Policy = policy });

            // Act
            var result = await Orchestrator.GetSnapshotPoliciesByMobileRegistrations(mobileRegistrations);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            VerifyAllServices();
        }

        [Fact]
        public async Task GetSnapshotPoliciesByMobileRegistrations_AllParticipantInfoNull_ReturnsNull()
        {
            // Arrange
            var registrationCount = 2;
            var policy = CreatePolicy();
            var (registrations, participantsInfo) = CreateRegistrations(registrationCount);
            var mobileRegistrations = new MobileRegistrationsModel
            {
                ActiveRegistration = registrations.First(),
                OtherRegistrations = registrations.Skip(1)
            }.GetAllRegistrations();

            Databases.Policy.Setup(x => x.GetDriverDataByParticipantExternalId(It.IsAny<string>()))
                .ReturnsAsync((SnapshotMobileParticipant)null);

            // Act
            var result = await Orchestrator.GetSnapshotPoliciesByMobileRegistrations(mobileRegistrations);

            // Assert
            Assert.Null(result);
            VerifyAllServices();
        }

        private List<Registration> CreateLegacyRegistrations(int count = 1)
        {
            var registrations = new List<Registration>();
            for (int i = 0; i < count; i++)
            {
                registrations.Add(new Registration
                {
                    StatusSummary = StatusSummary.New,
                    PolicyParticipant = new PolicyDriverData
                    {
                        PolicyNumber = i > 0 ? policyNumber + i : policyNumber,
                        DriverFirstName = $"FirstName{i}",
                        DriverLastName = $"LastName{i}",
                        PJStatus = $"Status{i}"
                    }
                });
            }
            return registrations;
        }

        private (List<RegistrationsModel>, List<SnapshotMobileParticipant>) CreateRegistrations(int count = 1)
        {
            var random = new Random();
            var registrations = new List<RegistrationsModel>();
            var participantsInfo = new List<SnapshotMobileParticipant>();
            for (int i = 0; i < count; i++)
            {
                registrations.Add(new RegistrationsModel
                {
                    TelematicsId = $"TelematicsId{i}",
                    StatusSummary = "Pending Resolution"
                });

                participantsInfo.Add(new SnapshotMobileParticipant
                {
                    PolicyNumber = i > 1 ? policyNumber + i : policyNumber,
                    Status = $"Status{i}",
                    DriverFirstName = $"FirstName{i}",
                    DriverLastName = $"LastName{i}",
                });
            }
            return (registrations, participantsInfo);
        }

        private WcfPolicyService.Policy CreatePolicy()
        {
            return new WcfPolicyService.Policy
            {
                PolicyNumber = policyNumber,
                GroupExternalId = "groupExternalId",
                IsMaxPolicyPeriodFlag = false,
                IsMigratedFromTrial = true
            };
        }
    }
}
