using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Moq;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService;
using Progressive.Telematics.Admin.Business.Resources;
using Xunit;

namespace Progressive.Telematics.Admin.Business.Tests.CustomerService
{
    public class MobileActionsOrchestratorTests : TestBase<MobileActionsOrchestrator, IMobileActionsOrchestrator>
    {
        private string policyNumber = "123";
        private int sequenceId = 123;

        public MobileActionsOrchestratorTests() : base()
        {
            Orchestrator = new MobileActionsOrchestrator(Apis.Device.Object, Apis.Policy.Object, Services.Participant.Object, Databases.Policy.Object);
        }

        [Fact]
        public async Task SwitchToOBD()
        {
            Services.Participant.Setup(x => x.SwitchToOBD(policyNumber, sequenceId));

            await Orchestrator.SwitchToOBD(policyNumber, sequenceId);

            Services.Participant.VerifyAll();
        }
        
        [Fact]
        public async Task SwapDriver()
        {
            var src = 123;
            var dest = 456;

            Services.Participant.Setup(x => x.SwapDriver(policyNumber, src, dest));

            await Orchestrator.SwapDriver(policyNumber, src, dest);

            Services.Participant.VerifyAll();
        }

        [Fact]
        public async Task ReturnMobileContexts()
        {

            Databases.Policy.Setup(x => x.GetMobileContexts(1234)).ReturnsAsync(new List<MobileContext>() { new MobileContext { PushEnabledInd = 1, LowPowerModeInd = 0, BatteryLevelAmt = 1, BackgroundAppRefreshInd = 1, GPSLocationServicesInd = 0, GapText = "" } });

            var expectedResult = new MobileContext[] { new MobileContext { PushEnabledInd = 1, LowPowerModeInd = 0, BatteryLevelAmt = 1, BackgroundAppRefreshInd = 1, GPSLocationServicesInd = 0, GapText = "" } };

            var result = await Orchestrator.ReturnMobileContexts(1234);

            Databases.Policy.VerifyAll();
            Assert.Equal(expectedResult[0].BatteryLevelAmt, result[0].BatteryLevelAmt);
            Assert.Equal(expectedResult[0].BackgroundAppRefreshInd, result[0].BackgroundAppRefreshInd);
            Assert.Equal(expectedResult[0].GapText, result[0].GapText);
            Assert.Equal(expectedResult[0].GPSLocationServicesInd, result[0].GPSLocationServicesInd);
            Assert.Equal(expectedResult[0].LowPowerModeInd, result[0].LowPowerModeInd);
            Assert.Equal(expectedResult[0].MobileDeviceContextOffSetDateTime, result[0].MobileDeviceContextOffSetDateTime);
            Assert.Equal(expectedResult[0].PushEnabledInd, result[0].PushEnabledInd);
        }

        [Fact]
        public async Task GetMobileRegistrationData()
        {
            string groupExternalId = "13e5adde-a137-40bc-a8a3-fd2cc3d14e46";

            Apis.Device.Setup(x => x.GetRegistrationsByGroupExternalId(groupExternalId)).ReturnsAsync(new List<Registration> { new Registration { MobileLastRegistrationDateTime = null } });

            var data = await Orchestrator.GetMobileRegistrationData(groupExternalId);

            Apis.Device.VerifyAll();
        }
    }
}
