using System.Collections.Generic;
using System.Threading.Tasks;
using Moq;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService;
using Progressive.Telematics.Admin.Services.Models;
using Xunit;

namespace Progressive.Telematics.Admin.Business.Tests.CustomerService
{
    public class CrossAppOrchestratorTests : TestBase<CrossAppOrchestrator, ICrossAppOrchestrator>
    {
        public CrossAppOrchestratorTests() : base()
        {
            Orchestrator = new CrossAppOrchestrator(Apis.HomebaseParticipantManagement.Object, Apis.UbiApi.Object);
        }

        [Theory]
        [InlineData(false, false)]
        [InlineData(false, true)]
        [InlineData(true, false)]
        [InlineData(true, true)]
        public async Task GetPolicyEnrolledFeatures_Tests(bool adEnrolled, bool snapshotEnrolled)
        {
            Apis.HomebaseParticipantManagement.Setup(x => x.GetPolicySummary(It.IsAny<string>())).ReturnsAsync(GenerateResponse(adEnrolled, snapshotEnrolled));
            Apis.UbiApi.Setup(x => x.GetPolicySummary(It.IsAny<string>())).ReturnsAsync(GenerateSnapshotSummaryResponse(adEnrolled, snapshotEnrolled));
            var result = await Orchestrator.GetPolicyEnrolledFeatures(It.IsAny<string>());

            Assert.Equal(adEnrolled, result.IsEnrolledInAre);
            Assert.Equal(snapshotEnrolled, result.IsEnrolledInSnapshot);
        }

        private HomebasePolicySummaryResponse GenerateResponse(bool adEnrolled, bool snapshotEnrolled)
        {
            return new HomebasePolicySummaryResponse
            {
                Participants = new List<HomebaseParticipantSummaryResponse>
                {
                    new HomebaseParticipantSummaryResponse(),
                    new HomebaseParticipantSummaryResponse { ADEnrolled = adEnrolled, UBIEnrolled = snapshotEnrolled }
                }
            };
        }

        private SnapshotSummaryResponse GenerateSnapshotSummaryResponse(bool adEnrolled, bool snapshotEnrolled)
        {
            return new SnapshotSummaryResponse
            {
                Participants = new List<SnapshotParticipant>
                {
                    new SnapshotParticipant(),
                    new SnapshotParticipant { ADEnrolled = adEnrolled, UBIEnrolled = snapshotEnrolled }
                }
            };
        }
    }
}
