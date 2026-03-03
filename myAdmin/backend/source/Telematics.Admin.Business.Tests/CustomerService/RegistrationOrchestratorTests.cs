using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using NSubstitute.ReturnsExtensions;
using Progressive.FeatureFlags.Common;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService.Flagr;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService.Helpers;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Business.ResponseModels.CustomerService.Registration;
using Progressive.Telematics.Admin.Services.Api;
using Progressive.Telematics.Admin.Services.Database;
using Progressive.Telematics.Admin.Services.Models;
using Progressive.Telematics.Admin.Services.Wcf;
using Progressive.Telematics.Admin.Shared;
using Xunit;

namespace Progressive.Telematics.Admin.Business.Tests.CustomerService
{
    public class RegistrationOrchestratorTests
    {
        private readonly IDeviceApi _deviceApi;
        private readonly IPolicyApi _policyApi;
        private readonly IPolicyDeviceApi _policyDeviceApi;
        private readonly IHomebaseDAL _homebaseDAL;
        private readonly ILogger<RegistrationOrchestrator> _logger;
        private readonly IUnlockRegistrationHelper _unlockHelper;
        private readonly IUpdateRegistrationCodeHelper _updateRegCodeHelper;
        private readonly IClaimsRegistrationApi _claimsRegistrationApi;
        private readonly ITransactionAuditLogService _auditLog;
        private readonly IHttpContextAccessor _contextAccessor;
        private readonly IRegistrationConflictService _registrationConflictService;
        private readonly RegistrationOrchestrator _sut;
        private readonly IRolloutHelper _rolloutHelper;
        private readonly IUbiApi _ubiApi;
        private readonly IHomebaseParticipantManagementApi _homebaseParticipantManagementApi;

        public RegistrationOrchestratorTests()
        {
            _deviceApi = Substitute.For<IDeviceApi>();
            _policyApi = Substitute.For<IPolicyApi>();
            _policyDeviceApi = Substitute.For<IPolicyDeviceApi>();
            _homebaseDAL = Substitute.For<IHomebaseDAL>();
            _logger = Substitute.For<ILogger<RegistrationOrchestrator>>();
            _unlockHelper = Substitute.For<IUnlockRegistrationHelper>();
            _updateRegCodeHelper = Substitute.For<IUpdateRegistrationCodeHelper>();
            _claimsRegistrationApi = Substitute.For<IClaimsRegistrationApi>();
            _auditLog = Substitute.For<ITransactionAuditLogService>();
            _contextAccessor = Substitute.For<IHttpContextAccessor>();
            _registrationConflictService = Substitute.For<IRegistrationConflictService>();
            _rolloutHelper = Substitute.For<IRolloutHelper>();
            _ubiApi = Substitute.For<IUbiApi>();
            _homebaseParticipantManagementApi = Substitute.For<IHomebaseParticipantManagementApi>();

            _sut = new RegistrationOrchestrator(
                _deviceApi,
                _policyApi,
                _policyDeviceApi,
                Substitute.For<IClaimsParticipantManagementApi>(),
                _homebaseParticipantManagementApi,
                _auditLog,
                _unlockHelper,
                _updateRegCodeHelper,
                _homebaseDAL,
                _contextAccessor,
                _logger,
                _claimsRegistrationApi,
                _registrationConflictService,
                _ubiApi
            );

            var registrations1 = new List<Registration> {
                 new Registration { MobileRegistrationCode = "code1", StatusSummary = StatusSummary.PendingResolution, ParticipantExternalId="tmx1" },
            };
            var registrations2 = new List<Registration> {
                 new Registration { MobileRegistrationCode = "code2", StatusSummary = StatusSummary.PendingResolution, ParticipantExternalId="tmx2"  },
            };
            _deviceApi.GetRegistrations("tmx1").Returns(registrations1);
            _deviceApi.GetRegistrations("tmx2").Returns(registrations2);
            _claimsRegistrationApi.GetRegistrations("tmx1", true).Returns(registrations1);
            _claimsRegistrationApi.GetRegistrations("tmx2", true).Returns(registrations2);

            _ubiApi.GetParticipantSnapshotSummary("tmx1").Returns(new SnapshotParticipant { DriverFirstName = "John1", DriverLastName = "Doe1" });
            _ubiApi.GetParticipantSnapshotSummary("tmx2").Returns(new SnapshotParticipant { DriverFirstName = "John2", DriverLastName = "Doe2" });

        }

        private Participant CreateParticipant(string telematicsId = "tmxId", string mobileRegCode = "currentCode")
        {
            return new Participant
            {
                TelematicsId = telematicsId,
                RegistrationDetails = new Registration
                {
                    MobileRegistrationCode = mobileRegCode
                }
            };
        }

        [Fact]
        public async Task UpdateRegistrationCode_Ready_CallsLegacyUpdateHappyPath()
        {
            Participant participant = CreateParticipant();
            List<int> conflictingIds = new List<int> { 1, 2 };
            List<Registration> unfilteredRegsFromDeviceApi = new List<Registration>() { new Registration() { MobileRegistrationSeqId = 1 } };
            UpdateRegistrationCodeResponse expectedResponse = new UpdateRegistrationCodeResponse.Success();

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CmdrTmxAdminUpdateRegCodeFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.Ready);
            _deviceApi.UpdateRegistration(Arg.Any<string>(), Arg.Any<int>(), Arg.Any<MobileRegistrationStatus>())
                .Returns(true);
            _deviceApi.GetUnfilteredRegistrations("newCode")
                .Returns(unfilteredRegsFromDeviceApi);
            _updateRegCodeHelper.DetermineMobileNumberStatus(unfilteredRegsFromDeviceApi, conflictingIds)
                .Returns(MobileNumberStatus.Unassigned);
            _updateRegCodeHelper.DetermineRegistrationStatusForRegistrationCodeChange(participant, MobileNumberStatus.Unassigned)
                .Returns((MobileRegistrationStatus.RegistrationComplete, null));


            var result = await _sut.UpdateRegistrationCode("policy", "newCode", participant, conflictingIds, _rolloutHelper);

            Assert.IsType<UpdateRegistrationCodeResponse.Success>(result);
            await _deviceApi.Received(1).GetUnfilteredRegistrations("newCode");
            await _deviceApi.Received(1).UpdateRegistration("newCode", participant.RegistrationDetails.MobileRegistrationSeqId, MobileRegistrationStatus.RegistrationComplete);
            await _updateRegCodeHelper.Received(1).DetermineMobileNumberStatus(unfilteredRegsFromDeviceApi, conflictingIds);
            await _updateRegCodeHelper.Received(1).DetermineRegistrationStatusForRegistrationCodeChange(participant, MobileNumberStatus.Unassigned);
            await _claimsRegistrationApi.Received(0)
                .UpdateMobileRegistrationCode(participant.RegistrationDetails.MobileRegistrationCode, "newCode", participant.TelematicsId);
        }

        [Fact]
        public async Task UpdateRegistrationCode_InProcess_CallsClaimsRegApiUpdate()
        {
            Participant participant = CreateParticipant();
            List<int> conflictingIds = new List<int> { 1, 2 };

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CmdrTmxAdminUpdateRegCodeFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.InProcess);

            _claimsRegistrationApi.UpdateMobileRegistrationCode(
                Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>())
                .Returns(Task.FromResult((true, string.Empty)));

            var result = await _sut.UpdateRegistrationCode("policy", "newCode", participant, conflictingIds, _rolloutHelper);

            Assert.IsType<UpdateRegistrationCodeResponse.Success>(result);
            await _claimsRegistrationApi.Received(1)
                    .UpdateMobileRegistrationCode(participant.RegistrationDetails.MobileRegistrationCode, "newCode", participant.TelematicsId);
            // Ensure no legacy dependencies were called. 
            await _deviceApi.Received(0).GetUnfilteredRegistrations("newCode");
            await _deviceApi.Received(0).UpdateRegistration("newCode", participant.RegistrationDetails.MobileRegistrationSeqId, MobileRegistrationStatus.RegistrationComplete);
            await _updateRegCodeHelper.Received(0).DetermineMobileNumberStatus(Arg.Any<List<Registration>>(), conflictingIds);
            await _updateRegCodeHelper.Received(0).DetermineRegistrationStatusForRegistrationCodeChange(participant, MobileNumberStatus.Unassigned);
        }

        [Fact]
        public async Task UpdateRegistrationCode_InProcess_FailedClaimsApiUpdate_FallbacksToLegacy()
        {
            Participant participant = CreateParticipant();
            List<int> conflictingIds = new List<int> { 1, 2 };
            List<Registration> unfilteredRegsFromDeviceApi = new List<Registration>() { new Registration() { MobileRegistrationSeqId = 1 } };
            UpdateRegistrationCodeResponse expectedLegacyResponse = new UpdateRegistrationCodeResponse.Success();

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CmdrTmxAdminUpdateRegCodeFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.InProcess);
            _deviceApi.UpdateRegistration(Arg.Any<string>(), Arg.Any<int>(), Arg.Any<MobileRegistrationStatus>())
                .Returns(true);
            _deviceApi.GetUnfilteredRegistrations("newCode")
                .Returns(unfilteredRegsFromDeviceApi);
            _updateRegCodeHelper.DetermineMobileNumberStatus(unfilteredRegsFromDeviceApi, conflictingIds)
                .Returns(MobileNumberStatus.Unassigned);
            _updateRegCodeHelper.DetermineRegistrationStatusForRegistrationCodeChange(participant, MobileNumberStatus.Unassigned)
                .Returns((MobileRegistrationStatus.RegistrationComplete, null));

            _claimsRegistrationApi.UpdateMobileRegistrationCode(
                Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>())
                .Throws(new Exception("Claims API update failed"));

            var result = await _sut.UpdateRegistrationCode("policy", "newCode", participant, conflictingIds, _rolloutHelper);

            Assert.IsType<UpdateRegistrationCodeResponse.Success>(result);
            await _claimsRegistrationApi.Received(1)
                .UpdateMobileRegistrationCode(participant.RegistrationDetails.MobileRegistrationCode, "newCode", participant.TelematicsId);
            // Confirm calls to legacy dependencies 
            await _deviceApi.Received(1).GetUnfilteredRegistrations("newCode");
            await _deviceApi.Received(1).UpdateRegistration("newCode", participant.RegistrationDetails.MobileRegistrationSeqId, MobileRegistrationStatus.RegistrationComplete);
            await _updateRegCodeHelper.Received(1).DetermineMobileNumberStatus(unfilteredRegsFromDeviceApi, conflictingIds);
            await _updateRegCodeHelper.Received(1).DetermineRegistrationStatusForRegistrationCodeChange(participant, MobileNumberStatus.Unassigned);
        }

        [Fact]
        public async Task UpdateRegistrationCode_Complete_SuccessfulClaimsUpdate()
        {
            Participant participant = CreateParticipant();
            List<int> conflictingIds = new List<int> { 1, 2 };

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CmdrTmxAdminUpdateRegCodeFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.Complete);

            _claimsRegistrationApi.UpdateMobileRegistrationCode(
                Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>())
                .Returns(Task.FromResult((true, string.Empty)));

            var result = await _sut.UpdateRegistrationCode("policy", "newCode", participant, conflictingIds, _rolloutHelper);

            Assert.IsType<UpdateRegistrationCodeResponse.Success>(result);

            await _claimsRegistrationApi.Received(1)
                .UpdateMobileRegistrationCode(participant.RegistrationDetails.MobileRegistrationCode, "newCode", participant.TelematicsId);
            // Ensure no legacy dependencies were called. 
            await _deviceApi.Received(0).GetUnfilteredRegistrations("newCode");
            await _deviceApi.Received(0).UpdateRegistration("newCode", participant.RegistrationDetails.MobileRegistrationSeqId, MobileRegistrationStatus.RegistrationComplete);
            await _updateRegCodeHelper.Received(0).DetermineMobileNumberStatus(Arg.Any<List<Registration>>(), conflictingIds);
            await _updateRegCodeHelper.Received(0).DetermineRegistrationStatusForRegistrationCodeChange(participant, MobileNumberStatus.Unassigned);
        }

        [Fact]
        public async Task UpdateRegistrationCode_Complete_FailedClaimsUpdate_ReturnsFailure()
        {
            Participant participant = CreateParticipant();
            List<int> conflictingIds = new List<int> { 1, 2 };

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CmdrTmxAdminUpdateRegCodeFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.Complete);

            _claimsRegistrationApi.UpdateMobileRegistrationCode(
                Arg.Any<string>(), Arg.Any<string>(), Arg.Any<string>())
                .Returns(Task.FromResult((false, "error")));

            var result = await _sut.UpdateRegistrationCode("policy", "newCode", participant, conflictingIds, _rolloutHelper);

            Assert.IsType<UpdateRegistrationCodeResponse.Failure>(result);
            Assert.Equal("error", ((UpdateRegistrationCodeResponse.Failure)result).DeveloperMessage);
        }

        [Fact]
        public async Task LegacyUpdateRegistrationCode_Calls_To_Update_ConflictingRegistrations_Success()
        {
            Participant participant = CreateParticipant();
            List<int> conflictingIds = new List<int> { 1, 2 };
            List<Registration> unfilteredRegsFromDeviceApi = new List<Registration>() { new Registration() { MobileRegistrationSeqId = 1 } };
            UpdateRegistrationCodeResponse expectedResponse = new UpdateRegistrationCodeResponse.Success();

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CmdrTmxAdminUpdateRegCodeFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.Ready);
            _deviceApi.UpdateRegistration(Arg.Any<string>(), Arg.Any<int>(), Arg.Any<MobileRegistrationStatus>())
                .Returns(true);
            _deviceApi.GetUnfilteredRegistrations("newCode")
                .Returns(unfilteredRegsFromDeviceApi);
            _updateRegCodeHelper.DetermineMobileNumberStatus(unfilteredRegsFromDeviceApi, conflictingIds)
                .Returns(MobileNumberStatus.Unassigned);
            _updateRegCodeHelper.DetermineRegistrationStatusForRegistrationCodeChange(participant, MobileNumberStatus.Unassigned)
                .Returns((MobileRegistrationStatus.RegistrationComplete, MobileRegistrationStatus.Inactive));


            var result = await _sut.UpdateRegistrationCode("policy", "newCode", participant, conflictingIds, _rolloutHelper);

            Assert.IsType<UpdateRegistrationCodeResponse.Success>(result);
            await _deviceApi.Received(1).GetUnfilteredRegistrations("newCode");
            await _deviceApi.Received(1).UpdateRegistration("newCode", participant.RegistrationDetails.MobileRegistrationSeqId, MobileRegistrationStatus.RegistrationComplete);
            await _deviceApi.Received(1).UpdateRegistration("newCode", 1, MobileRegistrationStatus.Inactive);
            await _deviceApi.Received(1).UpdateRegistration("newCode", 2, MobileRegistrationStatus.Inactive);
            await _updateRegCodeHelper.Received(1).DetermineMobileNumberStatus(unfilteredRegsFromDeviceApi, conflictingIds);
            await _updateRegCodeHelper.Received(1).DetermineRegistrationStatusForRegistrationCodeChange(participant, MobileNumberStatus.Unassigned);
            await _claimsRegistrationApi.Received(0)
                .UpdateMobileRegistrationCode(participant.RegistrationDetails.MobileRegistrationCode, "newCode", participant.TelematicsId);
        }

        [Fact]
        public async Task LegacyUpdateRegistrationCode_Calls_To_Update_ConflictingRegistrations_Failure()
        {
            Participant participant = CreateParticipant();
            List<int> conflictingIds = new List<int> { 1, 2 };
            List<Registration> unfilteredRegsFromDeviceApi = new List<Registration>() { new Registration() { MobileRegistrationSeqId = 1 } };
            UpdateRegistrationCodeResponse expectedResponse = new UpdateRegistrationCodeResponse.Success();

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CmdrTmxAdminUpdateRegCodeFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.Ready);
            _deviceApi.UpdateRegistration("newCode", 1, MobileRegistrationStatus.Inactive)
                .Returns(true);
            _deviceApi.GetUnfilteredRegistrations("newCode")
                .Returns(unfilteredRegsFromDeviceApi);
            _updateRegCodeHelper.DetermineMobileNumberStatus(unfilteredRegsFromDeviceApi, conflictingIds)
                .Returns(MobileNumberStatus.Unassigned);
            _updateRegCodeHelper.DetermineRegistrationStatusForRegistrationCodeChange(participant, MobileNumberStatus.Unassigned)
                .Returns((MobileRegistrationStatus.RegistrationComplete, MobileRegistrationStatus.Inactive));


            var result = await _sut.UpdateRegistrationCode("policy", "newCode", participant, conflictingIds, _rolloutHelper);

            Assert.IsType<UpdateRegistrationCodeResponse.FailureUpdatingConflictingRegistration>(result);
            await _deviceApi.Received(1).GetUnfilteredRegistrations("newCode");
            await _deviceApi.Received(0).UpdateRegistration("newCode", participant.RegistrationDetails.MobileRegistrationSeqId, MobileRegistrationStatus.RegistrationComplete);
            await _deviceApi.Received(1).UpdateRegistration("newCode", 1, MobileRegistrationStatus.Inactive);
            await _deviceApi.Received(1).UpdateRegistration("newCode", 2, MobileRegistrationStatus.Inactive);
            await _updateRegCodeHelper.Received(1).DetermineMobileNumberStatus(unfilteredRegsFromDeviceApi, conflictingIds);
            await _updateRegCodeHelper.Received(1).DetermineRegistrationStatusForRegistrationCodeChange(participant, MobileNumberStatus.Unassigned);
            await _claimsRegistrationApi.Received(0)
                .UpdateMobileRegistrationCode(participant.RegistrationDetails.MobileRegistrationCode, "newCode", participant.TelematicsId);
        }

        [Fact]
        public async Task LegacyUpdateRegistrationCode_Primary_Update_Fails()
        {
            Participant participant = CreateParticipant();
            List<int> conflictingIds = new List<int> { 1, 2 };
            List<Registration> unfilteredRegsFromDeviceApi = new List<Registration>() { new Registration() { MobileRegistrationSeqId = 1 } };
            UpdateRegistrationCodeResponse expectedResponse = new UpdateRegistrationCodeResponse.Success();

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CmdrTmxAdminUpdateRegCodeFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.Ready);
            _deviceApi.UpdateRegistration("newCode", 1, MobileRegistrationStatus.Inactive)
                .Returns(true);
            _deviceApi.UpdateRegistration("newCode", 2, MobileRegistrationStatus.Inactive)
                .Returns(true);
            _deviceApi.UpdateRegistration("newCode", 0, MobileRegistrationStatus.RegistrationComplete)
                .Returns(false);
            _deviceApi.GetUnfilteredRegistrations("newCode")
                .Returns(unfilteredRegsFromDeviceApi);
            _updateRegCodeHelper.DetermineMobileNumberStatus(unfilteredRegsFromDeviceApi, conflictingIds)
                .Returns(MobileNumberStatus.Unassigned);
            _updateRegCodeHelper.DetermineRegistrationStatusForRegistrationCodeChange(participant, MobileNumberStatus.Unassigned)
                .Returns((MobileRegistrationStatus.RegistrationComplete, MobileRegistrationStatus.Inactive));


            var result = await _sut.UpdateRegistrationCode("policy", "newCode", participant, conflictingIds, _rolloutHelper);

            Assert.IsType<UpdateRegistrationCodeResponse.FailureUpdatingRegistration>(result);
            await _deviceApi.Received(1).GetUnfilteredRegistrations("newCode");
            await _deviceApi.Received(1).UpdateRegistration("newCode", participant.RegistrationDetails.MobileRegistrationSeqId, MobileRegistrationStatus.RegistrationComplete);
            await _deviceApi.Received(1).UpdateRegistration("newCode", 1, MobileRegistrationStatus.Inactive);
            await _deviceApi.Received(1).UpdateRegistration("newCode", 2, MobileRegistrationStatus.Inactive);
            await _updateRegCodeHelper.Received(1).DetermineMobileNumberStatus(unfilteredRegsFromDeviceApi, conflictingIds);
            await _updateRegCodeHelper.Received(1).DetermineRegistrationStatusForRegistrationCodeChange(participant, MobileNumberStatus.Unassigned);
            await _claimsRegistrationApi.Received(0)
                .UpdateMobileRegistrationCode(participant.RegistrationDetails.MobileRegistrationCode, "newCode", participant.TelematicsId);
        }

        [Fact]
        public async Task LegacyUpdateRegistrationCode_Thrown_Exception_Returns_Failure()
        {
            Participant participant = CreateParticipant();
            List<int> conflictingIds = new List<int> { 1, 2 };
            List<Registration> unfilteredRegsFromDeviceApi = new List<Registration>() { new Registration() { MobileRegistrationSeqId = 1 } };
            UpdateRegistrationCodeResponse expectedResponse = new UpdateRegistrationCodeResponse.Success();

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CmdrTmxAdminUpdateRegCodeFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.Ready);
            _deviceApi.GetUnfilteredRegistrations("newCode")
                .ThrowsAsync(new Exception());


            var result = await _sut.UpdateRegistrationCode("policy", "newCode", participant, conflictingIds, _rolloutHelper);

            Assert.IsType<UpdateRegistrationCodeResponse.Failure>(result);
            await _deviceApi.Received(1).GetUnfilteredRegistrations("newCode");
            await _deviceApi.Received(0).UpdateRegistration("newCode", participant.RegistrationDetails.MobileRegistrationSeqId, MobileRegistrationStatus.RegistrationComplete);
            await _deviceApi.Received(0).UpdateRegistration("newCode", 1, MobileRegistrationStatus.Inactive);
            await _deviceApi.Received(0).UpdateRegistration("newCode", 2, MobileRegistrationStatus.Inactive);
            await _updateRegCodeHelper.Received(0).DetermineMobileNumberStatus(unfilteredRegsFromDeviceApi, conflictingIds);
            await _updateRegCodeHelper.Received(0).DetermineRegistrationStatusForRegistrationCodeChange(participant, MobileNumberStatus.Unassigned);
            await _claimsRegistrationApi.Received(0)
                .UpdateMobileRegistrationCode(participant.RegistrationDetails.MobileRegistrationCode, "newCode", participant.TelematicsId);
        }

        [Fact]
        public async Task UpdateRegistrationCode_TelematicsIdNullOrEmpty_ReturnsFailure()
        {
            Participant participant = new Participant { TelematicsId = null }; // or string.Empty
            List<int> conflictingIds = new List<int> { 1, 2 };

            UpdateRegistrationCodeResponse result = await _sut.UpdateRegistrationCode("policy", "newCode", participant, conflictingIds, _rolloutHelper);

            var failure = Assert.IsType<UpdateRegistrationCodeResponse.Failure>(result);
            Assert.Equal("TelematicsId must be provided.", failure.DeveloperMessage);
        }

        [Fact]
        public async Task GetRegistrations_Ready_CallsLegacyDeviceApi()
        {
            var telematicsIds = new List<string> { "tmx1" };
            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminStatusDisplayFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.Ready);

            var result = await _sut.GetRegistrations(telematicsIds, _rolloutHelper);

            var success = Assert.IsType<GetRegistrationResponse.Success>(result);

            Assert.Single(success.Registrations);
            Assert.Equal("code1", success.Registrations[0].MobileRegistrationCode);

            await _claimsRegistrationApi.Received(0).GetRegistrations(Arg.Any<string>(), Arg.Any<bool>());
            await _deviceApi.Received(1).GetRegistrations("tmx1");
        }

        [Fact]
        public async Task GetRegistrations_Complete_CallsModernRegistrationApi()
        {
            var telematicsIds = new List<string> { "tmx1", "tmx2" };

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminStatusDisplayFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.Complete);

            var result = await _sut.GetRegistrations(telematicsIds, _rolloutHelper);

            var success = Assert.IsType<GetRegistrationResponse.Success>(result);

            Assert.True(success.Registrations.Count == 2);
            Assert.Equal("code2", success.Registrations[1].MobileRegistrationCode);
            Assert.Equal("John2", success.Registrations[1].DriverFirstName);
            Assert.Equal("Doe2", success.Registrations[1].DriverLastName);

            await _claimsRegistrationApi.Received(2).GetRegistrations(Arg.Any<string>(), Arg.Any<bool>());
            await _deviceApi.Received(0).GetRegistrations(Arg.Any<string>());
        }

        [Fact]
        public async Task GetRegistrations_Complete_CallsModernRegistrationApi_SomeNotFound()
        {
            var telematicsIds = new List<string> { "tmx1", "tmx3" };

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminStatusDisplayFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.Complete);

            var result = await _sut.GetRegistrations(telematicsIds, _rolloutHelper);

            Assert.IsType<GetRegistrationResponse.NoRegistration>(result);

            await _claimsRegistrationApi.Received(2).GetRegistrations(Arg.Any<string>(), Arg.Any<bool>());
            await _deviceApi.Received(0).GetRegistrations(Arg.Any<string>());
        }

        [Fact]
        public async Task GetRegistrations_Complete_CallsModernRegistrationApi_AllNotFound()
        {
            var telematicsIds = new List<string> { "tmx3", "tmx4" };

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminStatusDisplayFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.Complete);

            var result = await _sut.GetRegistrations(telematicsIds, _rolloutHelper);

            Assert.IsType<GetRegistrationResponse.NoRegistration>(result);

            await _claimsRegistrationApi.Received(2).GetRegistrations(Arg.Any<string>(), Arg.Any<bool>());
            await _deviceApi.Received(0).GetRegistrations(Arg.Any<string>());
        }

        [Fact]
        public async Task GetRegistrations_Complete_SnapshotSummaryFound_NameIsSet()
        {
            var telematicsIds = new List<string> { "tmx1" };

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminStatusDisplayFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.Complete);

            var result = await _sut.GetRegistrations(telematicsIds, _rolloutHelper);

            var success = Assert.IsType<GetRegistrationResponse.Success>(result);

            Assert.Single(success.Registrations);
            Assert.Equal("code1", success.Registrations[0].MobileRegistrationCode);
            Assert.Equal("John1", success.Registrations[0].DriverFirstName);
            Assert.Equal("Doe1", success.Registrations[0].DriverLastName);

            await _claimsRegistrationApi.Received(1).GetRegistrations(Arg.Any<string>(), Arg.Any<bool>());
            await _deviceApi.Received(0).GetRegistrations(Arg.Any<string>());
        }

        [Fact]
        public async Task GetRegistrations_Complete_SnapshotSummaryNotFound_NameNotSet()
        {
            var telematicsIds = new List<string> { "tmx1" };

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminStatusDisplayFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.Complete);

            _ubiApi.GetParticipantSnapshotSummary("tmx1").Returns((SnapshotParticipant)null);

            var result = await _sut.GetRegistrations(telematicsIds, _rolloutHelper);

            var success = Assert.IsType<GetRegistrationResponse.Success>(result);

            Assert.Single(success.Registrations);
            Assert.Equal("code1", success.Registrations[0].MobileRegistrationCode);
            Assert.Null(success.Registrations[0].DriverFirstName);
            Assert.Null(success.Registrations[0].DriverLastName);


            await _claimsRegistrationApi.Received(1).GetRegistrations(Arg.Any<string>(), Arg.Any<bool>());
            await _deviceApi.Received(0).GetRegistrations(Arg.Any<string>());
        }

        [Fact]
        public async Task GetRegistrations_InProcess_CallsModernRegistrationApi()
        {
            var telematicsIds = new List<string> { "tmx1", "tmx2" };

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminStatusDisplayFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.InProcess);

            var result = await _sut.GetRegistrations(telematicsIds, _rolloutHelper);

            var success = Assert.IsType<GetRegistrationResponse.Success>(result);

            Assert.True(success.Registrations.Count == 2);
            Assert.Equal("code2", success.Registrations[1].MobileRegistrationCode);
            Assert.Equal("John2", success.Registrations[1].DriverFirstName);
            Assert.Equal("Doe2", success.Registrations[1].DriverLastName);

            await _claimsRegistrationApi.Received(2).GetRegistrations(Arg.Any<string>(), Arg.Any<bool>());
            await _deviceApi.Received(0).GetRegistrations(Arg.Any<string>());
        }

        [Fact]
        public async Task GetRegistrations_InProcess_FallbackToLegacy_Found()
        {
            var telematicsIds = new List<string> { "tmx1" };

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminStatusDisplayFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.InProcess);

            _claimsRegistrationApi.GetRegistrations("tmx1", true).Returns((List<Registration>)null);

            var result = await _sut.GetRegistrations(telematicsIds, _rolloutHelper);

            var success = Assert.IsType<GetRegistrationResponse.Success>(result);

            Assert.Single(success.Registrations);

            Assert.Equal("code1", success.Registrations[0].MobileRegistrationCode);

            await _claimsRegistrationApi.Received(1).GetRegistrations(Arg.Any<string>(), Arg.Any<bool>());
            await _deviceApi.Received(1).GetRegistrations(Arg.Any<string>());
        }

        [Fact]
        public async Task GetRegistrations_InProcess_FallbackToLegacy_NotFound()
        {
            var telematicsIds = new List<string> { "tmx4" };

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminStatusDisplayFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.InProcess);


            var result = await _sut.GetRegistrations(telematicsIds, _rolloutHelper);

            Assert.IsType<GetRegistrationResponse.NoRegistration>(result);

            await _claimsRegistrationApi.Received(1).GetRegistrations(Arg.Any<string>(), Arg.Any<bool>());
            await _deviceApi.Received(1).GetRegistrations(Arg.Any<string>());
        }

        [Fact]
        public async Task GetRegistrationsByPolicy_RolloutStatusReady_CallsLegacyFunctionality()
        {
            var policyNumber = "policyNumber";

            var legacyRegistrations = new List<Registration>
            {
                new Registration
                {
                    ParticipantExternalId = "legacyTmxId",
                    MobileRegistrationCode = "legacyMobileRegCode"
                }
            };

            _policyApi.GetMobileParticipantRegistrationInfo(policyNumber).Returns(legacyRegistrations);

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminPolicySearchFeatureSwitchProduct>(Arg.Any<PolicyNumberEntity>())
                .Returns(RolloutStatus.Ready);

            var result = await _sut.GetRegistrationsByPolicy(policyNumber, _rolloutHelper);

            Assert.IsType<GetRegistrationResponse.Success>(result);
            await _policyApi.Received(1).GetMobileParticipantRegistrationInfo(policyNumber);
        }

        [Fact]
        public async Task GetRegistrationsByPolicy_RolloutStatusInProcess_WhenModernAndLegacyNull_ReturnsNoRegistration()
        {
            var policyNumber = "policyNumber";

            _policyApi.GetMobileParticipantRegistrationInfo(Arg.Any<string>()).ReturnsNull();
            _claimsRegistrationApi.GetRegistrationsByPolicyNumber(Arg.Any<string>()).ReturnsNull();

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminPolicySearchFeatureSwitchProduct>(Arg.Any<PolicyNumberEntity>())
                .Returns(RolloutStatus.InProcess);

            var result = await _sut.GetRegistrationsByPolicy(policyNumber, _rolloutHelper);

            Assert.IsType<GetRegistrationResponse.NoRegistration>(result);
            await _policyApi.Received(1).GetMobileParticipantRegistrationInfo(policyNumber);
            await _claimsRegistrationApi.Received(1).GetRegistrationsByPolicyNumber(policyNumber);
        }

        [Fact]
        public async Task GetRegistrationsByPolicy_RolloutStatusInProcess_ModernReturnsNull_LegacyReturnsData_ReturnsLegacyData()
        {
            var policyNumber = "policyNumber";
            var legacyTmxId = "legacyTmxId";

            var legacyRegistrations = new List<Registration>
            {
                new Registration
                {
                    ParticipantExternalId = legacyTmxId
                }
            };

            _policyApi.GetMobileParticipantRegistrationInfo(Arg.Any<string>()).Returns(legacyRegistrations);
            _claimsRegistrationApi.GetRegistrationsByPolicyNumber(Arg.Any<string>()).ReturnsNull();

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminPolicySearchFeatureSwitchProduct>(Arg.Any<PolicyNumberEntity>())
                .Returns(RolloutStatus.InProcess);

            var result = await _sut.GetRegistrationsByPolicy(policyNumber, _rolloutHelper);

            await _policyApi.Received(1).GetMobileParticipantRegistrationInfo(policyNumber);
            await _claimsRegistrationApi.Received(1).GetRegistrationsByPolicyNumber(policyNumber);

            Assert.IsType<GetRegistrationResponse.Success>(result);
            Assert.Equal(((GetRegistrationResponse.Success)result).Registrations[0].ParticipantExternalId, legacyTmxId);
        }

        [Fact]
        public async Task GetRegistrationsByPolicy_RolloutStatusInProcess_ModernSucceeds_LegacyFails_ReturnsModernData()
        {
            var policyNumber = "policyNumber";
            var modernTmxId = "modernTmxId";

            var modernRegistrations = new List<Registration>
            {
                new Registration
                {
                    ParticipantExternalId = modernTmxId,
                }
            };

            _policyApi.GetMobileParticipantRegistrationInfo(Arg.Any<string>()).ReturnsNull();
            _claimsRegistrationApi.GetRegistrationsByPolicyNumber(Arg.Any<string>()).Returns(modernRegistrations);

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminPolicySearchFeatureSwitchProduct>(Arg.Any<PolicyNumberEntity>())
                .Returns(RolloutStatus.InProcess);

            var result = await _sut.GetRegistrationsByPolicy(policyNumber, _rolloutHelper);

            await _policyApi.Received(1).GetMobileParticipantRegistrationInfo(policyNumber);
            await _claimsRegistrationApi.Received(1).GetRegistrationsByPolicyNumber(policyNumber);

            Assert.IsType<GetRegistrationResponse.Success>(result);
            Assert.Equal(((GetRegistrationResponse.Success)result).Registrations[0].ParticipantExternalId, modernTmxId);
        }

        [Fact]
        public async Task GetRegistrationsByPolicy_RolloutStatusInProcess_CallsModernAndLegacyFunctionality()
        {
            var policyNumber = "policyNumber";
            var tmxId = "tmxId";

            var legacyRegistrations = new List<Registration>
            {
                new Registration
                {
                    ParticipantExternalId = tmxId
                }
            };

            var modernRegistrations = new List<Registration>
            {
                new Registration
                {
                    ParticipantExternalId = tmxId,
                }
            };

            _policyApi.GetMobileParticipantRegistrationInfo(Arg.Any<string>()).Returns(legacyRegistrations);
            _claimsRegistrationApi.GetRegistrationsByPolicyNumber(Arg.Any<string>()).Returns(modernRegistrations);

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminPolicySearchFeatureSwitchProduct>(Arg.Any<PolicyNumberEntity>())
                .Returns(RolloutStatus.InProcess);

            var result = await _sut.GetRegistrationsByPolicy(policyNumber, _rolloutHelper);

            await _policyApi.Received(1).GetMobileParticipantRegistrationInfo(policyNumber);
            await _claimsRegistrationApi.Received(1).GetRegistrationsByPolicyNumber(policyNumber);

            Assert.IsType<GetRegistrationResponse.Success>(result);
            Assert.Equal(((GetRegistrationResponse.Success)result).Registrations[0].ParticipantExternalId, tmxId);
        }

        [Fact]
        public async Task GetRegistrationsByPolicy_RolloutStatusInProcess_WhenModernAndLegacyMismatch_ReturnsLegacyData()
        {
            var policyNumber = "policyNumber";
            var legacyTmxId = "legacyTmxId";
            var modernTmxId = "modernTmxId";

            var legacyRegistrations = new List<Registration>
            {
                new Registration
                {
                    ParticipantExternalId = legacyTmxId
                }
            };

            var modernRegistrations = new List<Registration>
            {
                new Registration
                {
                    ParticipantExternalId = modernTmxId,
                }
            };

            _policyApi.GetMobileParticipantRegistrationInfo(Arg.Any<string>()).Returns(legacyRegistrations);
            _claimsRegistrationApi.GetRegistrationsByPolicyNumber(Arg.Any<string>()).Returns(modernRegistrations);

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminPolicySearchFeatureSwitchProduct>(Arg.Any<PolicyNumberEntity>())
                .Returns(RolloutStatus.InProcess);

            var result = await _sut.GetRegistrationsByPolicy(policyNumber, _rolloutHelper);

            await _policyApi.Received(1).GetMobileParticipantRegistrationInfo(policyNumber);
            await _claimsRegistrationApi.Received(1).GetRegistrationsByPolicyNumber(policyNumber);

            Assert.IsType<GetRegistrationResponse.Success>(result);
            Assert.Equal(((GetRegistrationResponse.Success)result).Registrations[0].ParticipantExternalId, legacyTmxId);
        }

        [Fact]
        public async Task GetRegistrationsByPolicy_RolloutStatusComplete_CallsModernFunctionality()
        {
            var policyNumber = "policyNumber";
            var modernTmxId = "modernTmxId";

            var modernRegistrations = new List<Registration>
            {
                new Registration
                {
                    ParticipantExternalId = modernTmxId,
                }
            };

            _claimsRegistrationApi.GetRegistrationsByPolicyNumber(Arg.Any<string>()).Returns(modernRegistrations);

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminPolicySearchFeatureSwitchProduct>(Arg.Any<PolicyNumberEntity>())
                .Returns(RolloutStatus.Complete);

            var result = await _sut.GetRegistrationsByPolicy(policyNumber, _rolloutHelper);

            await _claimsRegistrationApi.Received(1).GetRegistrationsByPolicyNumber(policyNumber);

            Assert.IsType<GetRegistrationResponse.Success>(result);
            Assert.Equal(((GetRegistrationResponse.Success)result).Registrations[0].ParticipantExternalId, modernTmxId);
        }

        [Fact]
        public async Task UnlockRegistration_Ready_WithParticipantExternalId_CallsLegacyUpdate_Success()
        {
            
            var registration = new Registration 
            { 
                MobileRegistrationCode = "code1", 
                ParticipantExternalId = "tmx1",
                ChallengeExpirationDateTime = DateTime.Now.AddDays(-1),
                ChallengeRequestCount = 5,
                MobileChallengeCode = "123456",
                MobileApiTokenId = "token123",
                MobileLastRegistrationDateTime = DateTime.Now.AddDays(-10),
                VehicleExternalId = "vehicle123"
            };

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminUnlockFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.Ready);

            _homebaseDAL.GetMobileRegistrationSeqIdAsync("tmx1").Returns(5);
            _homebaseDAL.UpdateMobileRegistration(Arg.Any<Registration>()).Returns(true);

            
            var result = await _sut.UnlockRegistration(registration, _rolloutHelper);

            
            Assert.IsType<UnlockRegistrationResponse.Success>(result);
            await _homebaseDAL.Received(1).UpdateMobileRegistration(Arg.Is<Registration>(r => 
                r.MobileRegistrationCode == "code1" && 
                r.ChallengeExpirationDateTime == null && 
                r.ChallengeRequestCount == 0 && 
                r.MobileChallengeCode == null &&
                r.MobileApiTokenId == "token123" &&
                r.VehicleExternalId == "vehicle123" &&
                r.MobileRegistrationSeqId == 5));
            await _claimsRegistrationApi.Received(0).UnlockRegistration(Arg.Any<string>());
            await _homebaseDAL.Received(1).GetMobileRegistrationSeqIdAsync(Arg.Any<string>());
        }

        [Fact]
        public async Task UnlockRegistration_Ready_WithMobileRegistrationSeqId_CallsLegacyUpdate_Success_DoesNotCall_()
        {

            var registration = new Registration
            {
                MobileRegistrationCode = "code1",
                ParticipantExternalId = "tmx1",
                MobileRegistrationSeqId = 10,
                ChallengeExpirationDateTime = DateTime.Now.AddDays(-1),
                ChallengeRequestCount = 5,
                MobileChallengeCode = "123456",
                MobileApiTokenId = "token123",
                MobileLastRegistrationDateTime = DateTime.Now.AddDays(-10),
                VehicleExternalId = "vehicle123"
            };

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminUnlockFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.Ready);

            _homebaseDAL.UpdateMobileRegistration(Arg.Any<Registration>()).Returns(true);


            var result = await _sut.UnlockRegistration(registration, _rolloutHelper);


            Assert.IsType<UnlockRegistrationResponse.Success>(result);
            await _homebaseDAL.Received(1).UpdateMobileRegistration(Arg.Is<Registration>(r =>
                r.MobileRegistrationCode == "code1" &&
                r.ChallengeExpirationDateTime == null &&
                r.ChallengeRequestCount == 0 &&
                r.MobileChallengeCode == null &&
                r.MobileApiTokenId == "token123" &&
                r.VehicleExternalId == "vehicle123" &&
                r.MobileRegistrationSeqId == 10));
            await _claimsRegistrationApi.Received(0).UnlockRegistration(Arg.Any<string>());
            await _homebaseDAL.Received(0).GetMobileRegistrationSeqIdAsync(Arg.Any<string>());
        }

        [Fact]
        public async Task UnlockRegistration_Ready_MobileRegistrationSeqIdNotFound_ReturnsFailure()
        {
            
            var registration = new Registration 
            { 
                MobileRegistrationCode = "code1", 
                ParticipantExternalId = "tmx1" 
            };

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminUnlockFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.Ready);

            _homebaseDAL.GetMobileRegistrationSeqIdAsync("tmx1").Returns((int?)null);
            _homebaseDAL.UpdateMobileRegistration(Arg.Any<Registration>()).Returns(false);

            
            var result = await _sut.UnlockRegistration(registration, _rolloutHelper);

            
            Assert.IsType<UnlockRegistrationResponse.Failure>(result);
            await _homebaseDAL.Received(0).UpdateMobileRegistration(Arg.Any<Registration>());
            await _claimsRegistrationApi.Received(0).UnlockRegistration(Arg.Any<string>());
            await _homebaseDAL.Received(1).GetMobileRegistrationSeqIdAsync(Arg.Any<string>());
        }

        [Fact]
        public async Task UnlockRegistration_Ready_HomebaseDalUpdateFails_ReturnsFailure()
        {

            var registration = new Registration
            {
                MobileRegistrationCode = "code1",
                ParticipantExternalId = "tmx1"
            };

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminUnlockFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.Ready);

            _homebaseDAL.GetMobileRegistrationSeqIdAsync("tmx1").Returns(5);
            _homebaseDAL.UpdateMobileRegistration(Arg.Any<Registration>()).Returns(false);


            var result = await _sut.UnlockRegistration(registration, _rolloutHelper);


            Assert.IsType<UnlockRegistrationResponse.Failure>(result);
            await _homebaseDAL.Received(1).UpdateMobileRegistration(Arg.Any<Registration>());
            await _claimsRegistrationApi.Received(0).UnlockRegistration(Arg.Any<string>());
        }

        [Fact]
        public async Task UnlockRegistration_Complete_CallsRegistrationApi_Success()
        {
            
            var registration = new Registration 
            { 
                MobileRegistrationCode = "code1", 
                ParticipantExternalId = "tmx1" 
            };

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminUnlockFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.Complete);

            // ClaimsRegistrationApi should return success
            _claimsRegistrationApi.UnlockRegistration("tmx1").Returns((true, string.Empty));

            
            var result = await _sut.UnlockRegistration(registration, _rolloutHelper);

            
            Assert.IsType<UnlockRegistrationResponse.Success>(result);
            await _homebaseDAL.Received(0).UpdateMobileRegistration(Arg.Any<Registration>());
            await _claimsRegistrationApi.Received(1).UnlockRegistration("tmx1");
        }

        [Fact]
        public async Task UnlockRegistration_Complete_CallsRegistrationApi_ReturnsFailure()
        {
            
            var registration = new Registration 
            { 
                MobileRegistrationCode = "code1", 
                ParticipantExternalId = "tmx1" 
            };

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminUnlockFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.Complete);

            _claimsRegistrationApi.UnlockRegistration("tmx1").Returns((false, "API failure"));

            
            var result = await _sut.UnlockRegistration(registration, _rolloutHelper);

            
            Assert.IsType<UnlockRegistrationResponse.Failure>(result);
            await _homebaseDAL.Received(0).UpdateMobileRegistration(Arg.Any<Registration>());
            await _claimsRegistrationApi.Received(1).UnlockRegistration("tmx1");
        }

        [Fact]
        public async Task UnlockRegistration_InProcess_CallsRegistrationApi_Success()
        {
            
            var registration = new Registration 
            { 
                MobileRegistrationCode = "code1", 
                ParticipantExternalId = "tmx1" 
            };

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminUnlockFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.InProcess);

            // ClaimsRegistrationApi should return success
            _claimsRegistrationApi.UnlockRegistration("tmx1").Returns((true, string.Empty));

            
            var result = await _sut.UnlockRegistration(registration, _rolloutHelper);

            
            Assert.IsType<UnlockRegistrationResponse.Success>(result);
            await _homebaseDAL.Received(0).UpdateMobileRegistration(Arg.Any<Registration>());
            await _claimsRegistrationApi.Received(1).UnlockRegistration("tmx1");
        }

        [Fact]
        public async Task UnlockRegistration_InProcess_RegistrationApiFails_FallsBackToLegacy_Success()
        {
            
            var registration = new Registration 
            { 
                MobileRegistrationCode = "code1", 
                ParticipantExternalId = "tmx1",
                MobileLastRegistrationDateTime = DateTime.Now.AddDays(-5)
            };

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminUnlockFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.InProcess);

            _claimsRegistrationApi.UnlockRegistration("tmx1").Returns((false, "API failure"));

            _homebaseDAL.GetMobileRegistrationSeqIdAsync("tmx1").Returns(5);
            _homebaseDAL.UpdateMobileRegistration(Arg.Any<Registration>()).Returns(true);

            
            var result = await _sut.UnlockRegistration(registration, _rolloutHelper);

            
            Assert.IsType<UnlockRegistrationResponse.Success>(result);
            await _claimsRegistrationApi.Received(1).UnlockRegistration("tmx1");
            await _homebaseDAL.Received(1).UpdateMobileRegistration(Arg.Any<Registration>());
        }

        [Fact]
        public async Task UnlockRegistration_InProcess_RegistrationApiThrowsException_FallsBackToLegacy_Success()
        {            
            var registration = new Registration 
            { 
                MobileRegistrationCode = "code1", 
                ParticipantExternalId = "tmx1" 
            };

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminUnlockFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.InProcess);

            _claimsRegistrationApi.UnlockRegistration("tmx1").Throws(new Exception("API exception"));

            _homebaseDAL.GetMobileRegistrationSeqIdAsync("tmx1").Returns(5);
            _homebaseDAL.UpdateMobileRegistration(Arg.Any<Registration>()).Returns(true);

            
            var result = await _sut.UnlockRegistration(registration, _rolloutHelper);

            
            Assert.IsType<UnlockRegistrationResponse.Success>(result);
            await _claimsRegistrationApi.Received(1).UnlockRegistration("tmx1");
            await _homebaseDAL.Received(1).UpdateMobileRegistration(Arg.Any<Registration>());
        }

        [Fact]
        public async Task UnlockRegistration_InProcess_RegistrationApiAndLegacyBothFail_ReturnsFailure()
        {            
            var registration = new Registration 
            { 
                MobileRegistrationCode = "code1", 
                ParticipantExternalId = "tmx1" 
            };

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminUnlockFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.InProcess);

            _claimsRegistrationApi.UnlockRegistration("tmx1").Returns((false, "API failure"));

            _homebaseDAL.GetMobileRegistrationSeqIdAsync("tmx1").Returns(5);
            _homebaseDAL.UpdateMobileRegistration(Arg.Any<Registration>()).Returns(false);
            
            var result = await _sut.UnlockRegistration(registration, _rolloutHelper);
            
            Assert.IsType<UnlockRegistrationResponse.Failure>(result);
            await _claimsRegistrationApi.Received(1).UnlockRegistration("tmx1");
            await _homebaseDAL.Received(1).UpdateMobileRegistration(Arg.Any<Registration>());
        }

        [Fact]
        public async Task DetermineRegistrationStatusAfterUnlock_Ready_CallsUnlockHelper_ReturnsSuccessWithStatus()
        {
            // Arrange
            var participant = CreateParticipant("tmx1", "code123");
            var expectedStatus = MobileRegistrationStatus.RegistrationComplete;

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminUnlockFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.Ready);
            
            _unlockHelper.DetermineRegistrationStatusAfterUnlock(participant)
                .Returns(expectedStatus);

            // Act
            var result = await _sut.DetermineRegistrationStatusAfterUnlock(participant, _rolloutHelper);

            // Assert
            var success = Assert.IsType<DetermineUnlockRegistrationStatusResponse.Success>(result);
            Assert.Equal(expectedStatus, success.RegistrationStatus);
            await _unlockHelper.Received(1).DetermineRegistrationStatusAfterUnlock(participant);
        }

        [Fact]
        public async Task DetermineRegistrationStatusAfterUnlock_InProcess_DoesNotCallUnlockHelper_ReturnsSuccessWithNullStatus()
        {
            // Arrange
            var participant = CreateParticipant("tmx1", "code123");

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminUnlockFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.InProcess);

            // Act
            var result = await _sut.DetermineRegistrationStatusAfterUnlock(participant, _rolloutHelper);

            // Assert
            var success = Assert.IsType<DetermineUnlockRegistrationStatusResponse.Success>(result);
            Assert.Null(success.RegistrationStatus);
            await _unlockHelper.DidNotReceive().DetermineRegistrationStatusAfterUnlock(Arg.Any<Participant>());
        }

        [Fact]
        public async Task DetermineRegistrationStatusAfterUnlock_Complete_DoesNotCallUnlockHelper_ReturnsSuccessWithNullStatus()
        {
            // Arrange
            var participant = CreateParticipant("tmx1", "code123");

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminUnlockFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Returns(RolloutStatus.Complete);

            // Act
            var result = await _sut.DetermineRegistrationStatusAfterUnlock(participant, _rolloutHelper);

            // Assert
            var success = Assert.IsType<DetermineUnlockRegistrationStatusResponse.Success>(result);
            Assert.Null(success.RegistrationStatus);
            await _unlockHelper.DidNotReceive().DetermineRegistrationStatusAfterUnlock(Arg.Any<Participant>());
        }

        [Fact]
        public async Task DetermineRegistrationStatusAfterUnlock_ExceptionThrown_ReturnsFailure()
        {
            // Arrange
            var participant = CreateParticipant("tmx1", "code123");

            _rolloutHelper.GetRolloutStatusByFeatureSwitch<CMDRTmxAdminUnlockFeatureSwitchProduct>(Arg.Any<TelematicsIdEntity>())
                .Throws(new Exception("Test exception"));

            // Act
            var result = await _sut.DetermineRegistrationStatusAfterUnlock(participant, _rolloutHelper);

            // Assert
            Assert.IsType<DetermineUnlockRegistrationStatusResponse.Failure>(result);
        }

        [Fact]
        public async Task UpdateRegistrationStatusCode_MobileRegistrationSeqIdNotNull_ReturnsSuccess()
        {
            string policyNumber = "policyNumber";
            int mobileRegistrationSeqId = 123;
            RegistrationStatusUpdateAction action = RegistrationStatusUpdateAction.Enable;
            string telematicsId = null;

            Registration registrationResponse = new Registration()
            {
                StatusSummary = StatusSummary.New
            };

            _policyDeviceApi.UpdateMobileRegistration(policyNumber, mobileRegistrationSeqId, action).Returns((true, null));
            _homebaseDAL.GetRegistration(mobileRegistrationSeqId).Returns(registrationResponse);

            var result = await _sut.UpdateRegistrationStatusCode(policyNumber, mobileRegistrationSeqId, action, telematicsId);

            await _policyDeviceApi.Received(1).UpdateMobileRegistration(policyNumber, mobileRegistrationSeqId, action);
            Assert.IsType<UpdateRegistrationStatusCodeResponse.Success>(result);
            Assert.Equal(registrationResponse.MobileRegistrationStatusCode, ((UpdateRegistrationStatusCodeResponse.Success)result).NewRegistrationStatus);
        }

        [Fact]
        public async Task UpdateRegistrationStatusCode_TelematicsIdNotNull_CallsHomeBaseDAL_ReturnsSuccess()
        {
            string policyNumber = "policyNumber";
            int mobileRegistrationSeqId = 0;
            int homebaseDALMobileRegistrationSeqId = 123;
            RegistrationStatusUpdateAction action = RegistrationStatusUpdateAction.Enable;
            string telematicsId = "telematicsId";

            Registration registrationResponse = new Registration()
            {
                StatusSummary = StatusSummary.New
            };

            _homebaseDAL.GetMobileRegistrationSeqIdAsync(telematicsId).Returns(homebaseDALMobileRegistrationSeqId);
            _policyDeviceApi.UpdateMobileRegistration(policyNumber, homebaseDALMobileRegistrationSeqId, action).Returns((true, null));
            _homebaseDAL.GetRegistration(homebaseDALMobileRegistrationSeqId).Returns(registrationResponse);

            var result = await _sut.UpdateRegistrationStatusCode(policyNumber, 123, action, telematicsId);

            await _homebaseDAL.Received(1).GetMobileRegistrationSeqIdAsync(telematicsId);
            await _policyDeviceApi.Received(1).UpdateMobileRegistration(policyNumber, homebaseDALMobileRegistrationSeqId, action);
            await _policyDeviceApi.Received(0).UpdateMobileRegistration(policyNumber, mobileRegistrationSeqId, action);
            Assert.IsType<UpdateRegistrationStatusCodeResponse.Success>(result);
            Assert.Equal(registrationResponse.MobileRegistrationStatusCode, ((UpdateRegistrationStatusCodeResponse.Success)result).NewRegistrationStatus);
        }

        [Fact]
        public async Task UpdateRegistrationStatusCode_PolicyDeviceApiFails_ReturnsFailure()
        {
            string policyNumber = "policyNumber";
            int mobileRegistrationSeqId = 123;
            RegistrationStatusUpdateAction action = RegistrationStatusUpdateAction.Enable;
            string telematicsId = null;
            string errorMessage = "errorMessage";

            Registration registrationResponse = new Registration()
            {
                StatusSummary = StatusSummary.New
            };

            _policyDeviceApi.UpdateMobileRegistration(policyNumber, mobileRegistrationSeqId, action).Returns((false, errorMessage));
            _homebaseDAL.GetRegistration(mobileRegistrationSeqId).Returns(registrationResponse);

            var result = await _sut.UpdateRegistrationStatusCode(policyNumber, mobileRegistrationSeqId, action, telematicsId);

            Assert.IsType<UpdateRegistrationStatusCodeResponse.Failure>(result);
        }

        [Fact]
        public async Task UpdateRegistrationStatusCode_ExceptionThrown_ReturnsFailure()
        {
            string policyNumber = "policyNumber";
            int mobileRegistrationSeqId = 123;
            RegistrationStatusUpdateAction action = RegistrationStatusUpdateAction.Enable;
            string telematicsId = null;

            Registration registrationResponse = new Registration()
            {
                StatusSummary = StatusSummary.New
            };

            _policyDeviceApi.UpdateMobileRegistration(policyNumber, mobileRegistrationSeqId, action).Throws(new Exception());

            var result = await _sut.UpdateRegistrationStatusCode(policyNumber, mobileRegistrationSeqId, action, telematicsId);

            Assert.IsType<UpdateRegistrationStatusCodeResponse.Failure>(result);
        }

    }
}
