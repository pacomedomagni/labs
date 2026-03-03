using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Moq;
using Progressive.Telematics.Admin.Business.Commands;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService;
using Progressive.Telematics.Admin.Business.Orchestrators.Tools;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Services.Api;
using Progressive.Telematics.Admin.Services.Models;
using Xunit;

namespace Progressive.Telematics.Admin.Business.Tests.IncidentResolution
{
    public class UnenrollSnapshotMobileParticipantCommandHandlerTests : TestBase<IncidentResolutionOrchestrator, IIncidentResolutionOrchestrator>
    {
        UnenrollSnapshotMobileParticipantCommandHandler _unenrollSnapshotParticipantCommandHandler;
        private Mock<ITmxPolicyApi> _tmxPolicyApi;
        private Mock<IPolicyServicingApi> _policyServicingApi;
        private Mock<IUbiApi> _ubiApi;
        private const string ParticipantId = "7ECCE80E-38A8-41B7-AA59-87E6EBD58E55";

        private readonly UnenrollSnapshotMobileParticipantCommand _request = new UnenrollSnapshotMobileParticipantCommand(
            new SPParameter[]
            {
                new SPParameter
                {
                    Name = "PolicyNumber",
                    Value = "PolicyNumber"
                },
                new SPParameter
                {
                    Name = "ParticipantId",
                    Value = ParticipantId
                }
            });

        public UnenrollSnapshotMobileParticipantCommandHandlerTests()
        {
            _tmxPolicyApi = new Mock<ITmxPolicyApi>();
            _policyServicingApi = new Mock<IPolicyServicingApi>();
            _ubiApi = new Mock<IUbiApi>();
            _unenrollSnapshotParticipantCommandHandler = new UnenrollSnapshotMobileParticipantCommandHandler(_tmxPolicyApi.Object, _policyServicingApi.Object, _ubiApi.Object);
        }

        [Fact]
        public async Task Success()
        {

            _policyServicingApi.Setup(x => x.GetPolicy("PolicyNumber")).ReturnsAsync(CreatePolicyServicingPolicy("DriverRefId", ParticipantId.ToLower()));
            _ubiApi.Setup(x => x.GetPolicySummary("PolicyNumber")).ReturnsAsync(CreateSnapshotSummaryResponse("ParticipantExternalId", ParticipantId.ToLower()));
            _tmxPolicyApi.Setup(x => x.UnenrollSnapshotParticipant("PolicyNumber", "ParticipantExternalId", "DriverRefId", "Mobile", "MNA", "Unenrolled",
                "InsuredRequest")).ReturnsAsync(true);

            var response = await _unenrollSnapshotParticipantCommandHandler.Handle(_request, default);

            Assert.Equal(ResponseStatus.Success, response.ResponseStatus);
            _tmxPolicyApi.VerifyAll();
        }

        [Fact]
        public async Task Failure()
        {
            _policyServicingApi.Setup(x => x.GetPolicy("PolicyNumber")).ReturnsAsync(CreatePolicyServicingPolicy("DriverRefId", ParticipantId.ToLower()));
            _ubiApi.Setup(x => x.GetPolicySummary("PolicyNumber")).ReturnsAsync(CreateSnapshotSummaryResponse("ParticipantExternalId", ParticipantId.ToLower()));

            _tmxPolicyApi.Setup(x => x.UnenrollSnapshotParticipant("PolicyNumber", "ParticipantExternalId", "DriverRefId", "Mobile", "MNA", "Unenrolled", "InsuredRequest")).ReturnsAsync(false);

            var response = await _unenrollSnapshotParticipantCommandHandler.Handle(_request, default);

            Assert.Equal(ResponseStatus.Failure, response.ResponseStatus);
            _tmxPolicyApi.VerifyAll();
            _ubiApi.VerifyAll();
            _policyServicingApi.VerifyAll();
        }


        [Fact]
        public async Task Failure_No_PolicyServicingPolicy()
        {
            _policyServicingApi.Setup(x => x.GetPolicy("PolicyNumber")).ReturnsAsync(() => null);

            var response = await _unenrollSnapshotParticipantCommandHandler.Handle(_request, default);

            Assert.Equal(ResponseStatus.Failure, response.ResponseStatus);

            _policyServicingApi.VerifyAll();
        }

        [Fact]
        public async Task Failure_No_SnapsotSummary()
        {
            _policyServicingApi.Setup(x => x.GetPolicy("PolicyNumber")).ReturnsAsync(CreatePolicyServicingPolicy("DriverRefId", ParticipantId.ToLower()));
            _ubiApi.Setup(x => x.GetPolicySummary("PolicyNumber")).ReturnsAsync(() => null);

            var response = await _unenrollSnapshotParticipantCommandHandler.Handle(_request, default);

            Assert.Equal(ResponseStatus.Failure, response.ResponseStatus);

            _policyServicingApi.VerifyAll();
            _ubiApi.VerifyAll();
        }

        [Fact]
        public async Task Failure_No_Matching_PolicyServicingPolicy_Participant()
        {
            _policyServicingApi.Setup(x => x.GetPolicy("PolicyNumber")).ReturnsAsync(CreatePolicyServicingPolicy("DriverRefId", "8fcce80e-38a8-41b7-aa59-87e6ebd58e44"));

            var response = await _unenrollSnapshotParticipantCommandHandler.Handle(_request, default);

            Assert.Equal(ResponseStatus.Failure, response.ResponseStatus);

            _policyServicingApi.VerifyAll();
        }

        [Fact]
        public async Task Failure_No_Matching_SnapsotSummary_Participant()
        {
            _policyServicingApi.Setup(x => x.GetPolicy("PolicyNumber")).ReturnsAsync(CreatePolicyServicingPolicy("DriverRefId", ParticipantId.ToLower()));
            _ubiApi.Setup(x => x.GetPolicySummary("PolicyNumber")).ReturnsAsync(CreateSnapshotSummaryResponse("ParticipantExternalId", "8fcce80e-38a8-41b7-aa59-87e6ebd58e44"));

            var response = await _unenrollSnapshotParticipantCommandHandler.Handle(_request, default);

            Assert.Equal(ResponseStatus.Failure, response.ResponseStatus);

            _policyServicingApi.VerifyAll();
            _ubiApi.VerifyAll();
        }


        private static PolicyServicingPolicy CreatePolicyServicingPolicy(string driverId, string participantId)
        {
            return new Admin.Services.Models.PolicyServicingPolicy
            {
                CorePolicyDetails = new Admin.Services.Models.CorePolicyDetails
                {
                    Drivers = new Admin.Services.Models.PolicyServicingDriver[] {
                        new Admin.Services.Models.PolicyServicingDriver { DriverId = driverId, DriverUbiParticipantId = participantId} }
                }
            };
        }

        private static SnapshotSummaryResponse CreateSnapshotSummaryResponse(string participantExternalId, string participantId)
        {
            return new Admin.Services.Models.SnapshotSummaryResponse
            {
                Participants = new List<Admin.Services.Models.SnapshotParticipant> {
                    new Admin.Services.Models.SnapshotParticipant {
                        ParticipantId = participantId,
                        ParticipantExternalId = participantExternalId } }
            };
        }
    }
}
