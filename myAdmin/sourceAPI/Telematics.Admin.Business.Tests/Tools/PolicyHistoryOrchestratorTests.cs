using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using Progressive.Telematics.Admin.Business.Orchestrators.Tools;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Progressive.Telematics.Admin.Services;
using Progressive.Telematics.Admin.Services.Models;
using Progressive.Telematics.Admin.Services.Models.UbiDTO;
using Xunit;

namespace Progressive.Telematics.Admin.Business.Tests.Tools
{
    public class PolicyHistoryOrchestratorTests
        : TestBase<PolicyHistoryOrchestrator, IPolicyHistoryOrchestrator>
    {
        string _policyNumber = "123";
        int _seqId = 123;

        public PolicyHistoryOrchestratorTests()
        {
            Orchestrator = new PolicyHistoryOrchestrator(
                Logger.Object,
                Apis.Device.Object,
                Apis.PolicyTrip.Object,
                Services.Device.Object,
                Services.ValueCalculator.Object,
                Databases.Policy.Object,
                Databases.TripDetails.Object,
                Mapper,
                Orchestrators.ScoringAlgorithmOrchestrator.Object
            );
        }

        [Theory]
        [InlineData(1)]
        [InlineData(0)]
        public async Task GetPolicyData_Tests(int responseCount)
        {
            var policy = responseCount.Equals(1) ? new PolicyDTO() : null;

            Databases.Policy.Setup(x => x.GetSupportPolicyData(_policyNumber)).ReturnsAsync(policy);

            if (responseCount.Equals(0))
                await Assert.ThrowsAsync<TelematicsApiException>(
                    () => Orchestrator.GetPolicyData(_policyNumber)
                );
            else
                await Orchestrator.GetPolicyData(_policyNumber);

            Databases.Policy.VerifyAll();
        }

        [Fact]
        public async Task GetAuditLogs_Tests()
        {
            Databases.Policy.Setup(x => x.GetTransactionAuditLogs(_policyNumber));

            await Orchestrator.GetAuditLogs(_policyNumber);

            Databases.Policy.VerifyAll();
        }

        [Fact]
        public async Task GetDeviceInfo_Tests()
        {
            var serialNumber = "123";
            var deviceInfo = new WcfDevice.Device
            {
                CreateDate = "CreateDate",
                FirstContactDateTime = "FirstContactDateTime",
                LastContactDateTime = "LastContactDateTime",
                LastUploadDateTime = "LastUploadDateTime",
                ImportStatus = "ImportStatus",
                LotID = "LotID",
                InputCalcVersion = "CalculatorVersion"
            };

            Services.Device
                .Setup(x => x.DeviceInformation(serialNumber))
                .ReturnsAsync(new WcfDevice.GetDeviceDetailsResponse { Device = deviceInfo });

            var model = await Orchestrator.GetDeviceInfo(serialNumber);

            Services.Device.VerifyAll();
            model.Extenders.Keys
                .ToList()
                .ForEach(x =>
                {
                    Equals(model.Extenders[x], x);
                });
        }

        [Fact]
        public async Task GetMobileDeviceInfo_Tests()
        {
            Apis.Device.Setup(x => x.GetDevice(_seqId));

            await Orchestrator.GetMobileDeviceInfo(_seqId);

            Apis.Device.VerifyAll();
        }

        [Fact]
        public async Task GetTripRegularity_Tests()
        {
            Services.ValueCalculator
                .Setup(x => x.GetCalculatedValues(_seqId))
                .ReturnsAsync(new WcfValueCalculator.GetValueCalculatorValuesResponse { });

            await Orchestrator.GetTripRegularity(_seqId);

            Services.ValueCalculator.VerifyAll();
        }

        [Theory]
        [InlineData(DeviceExperience.Mobile, 3)]
        [InlineData(DeviceExperience.Device, 2)]
        public async Task GetTripSummary_byParticipantId_Tests(DeviceExperience experience, int algorithm)
        {
            string id = Guid.NewGuid().ToString();

            Apis.PolicyTrip
                .Setup(x => x.GetTrips(id))
                .ReturnsAsync(new TripsGetResponse { Trips = new List<Trip>() });

            await Orchestrator.GetTripSummary(id, _seqId, experience, algorithm);

            VerifyAllServices();
        }

        [Theory]
        [InlineData(DeviceExperience.Mobile, 1)]
        [InlineData(DeviceExperience.Device, 4)]
        public async Task GetTripSummary_bySeqId_Tests(DeviceExperience experience, int algorithm)
        {
            string id = Guid.NewGuid().ToString();

            Databases.Policy
                .Setup(x => x.GetTripSummary(_seqId))
                .ReturnsAsync(new List<TripSummaryDTO>() { new TripSummaryDTO { } });

            await Orchestrator.GetTripSummary(id, _seqId, experience, algorithm);

            VerifyAllServices();
        }

        [Fact]
        public async Task GetTripSummarySeqId_Tests()
        {
            Databases.Policy
                .Setup(x => x.GetTripSummary(_seqId))
                .ReturnsAsync(new List<TripSummaryDTO>() { new TripSummaryDTO { } });

            await Orchestrator.GetTripSummary(_seqId);

            Databases.Policy.VerifyAll();
        }

        [Fact]
        public async Task GetTripSummaryGuid_Tests()
        {
            var id = Guid.NewGuid().ToString();

            Apis.PolicyTrip
                .Setup(x => x.GetTrips(id))
                .ReturnsAsync(new TripsGetResponse { Trips = new List<Trip>() });
            ;

            await Orchestrator.GetTripSummary(id);

            Apis.PolicyTrip.VerifyAll();
        }

        [Fact]
        public async Task GetParticipantDeviceEvents_Tests()
        {
            Databases.Policy
                .Setup(x => x.GetParticipantDeviceEvents(_seqId))
                .ReturnsAsync(new List<EventDTO> { });

            await Orchestrator.GetParticipantDeviceEvents(_seqId);

            Databases.Policy.VerifyAll();
        }


        [Theory]
        [InlineData(DeviceExperience.Device)]
        public async Task GetDeviceTripDetails_Tests(DeviceExperience experience)
        {
            var algorithm = 2;
            var start = DateTime.Now;

            Databases.TripDetails
                    .Setup(x => x.GetTripDetails(_seqId, start,0,10, string.Empty))
                    .ReturnsAsync(
                        new Admin.Services.Models.UbiDTO.GetTDByTripSeqIDResponse
                        {
                            TripEventList = new List<TripEventDTO> { },
                            TotalRecordCount = 0
                        }
                    );

            await Orchestrator.GetTripDetails(_seqId, start, algorithm, experience, 0, 10);

            Databases.TripDetails.VerifyAll();
        }
    }
}
