using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Progressive.Telematics.Admin.Business.Orchestrators.CustomerService;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using Xunit;

namespace Progressive.Telematics.Admin.Business.Tests.CustomerService
{
    public class PluginActionsOrchestratorTests : TestBase<PluginActionsOrchestrator, IPluginActionsOrchestrator>
    {
        public PluginActionsOrchestratorTests()
        {
            Orchestrator = new PluginActionsOrchestrator(Databases.Policy.Object, Services.Device.Object, Services.Participant.Object, Services.XirgoDevice.Object, Services.XirgoSession.Object, Orchestrators.Participant.Object, Services.ValueCalculator.Object, Apis.Device.Object, Databases.Homebase.Object, Mapper);
        }

        [Fact]
        public async Task MarkDeviceAbandoned_Tests()
        {
            string polNbr = "123", serialNumber = "456";
            int partSeqId = 123;
            short? polSuffix = 0, expYear = null;
            Services.Device.Setup(x => x.MarkDeviceAbandoned(polNbr, partSeqId, serialNumber, polSuffix, expYear));
            await Orchestrator.MarkDeviceAbandoned(polNbr, partSeqId, serialNumber, polSuffix, expYear);
            Services.Device.VerifyAll();
        }

        [Fact]
        public async Task UpdateSuspensionInfo_Tests()
        {
            var serialNumbers = new List<int>() { 456, 123 };
            Services.Participant.Setup(x => x.UpdateSuspensionInfo(serialNumbers));
            await Orchestrator.UpdateSuspensionInfo(serialNumbers);
            Services.Participant.VerifyAll();
        }

        [Fact]
        public async Task ReplaceDevice_Tests()
        {
            var polNbr = "123";
            var partSeqId = 123;
            Services.Device.Setup(x => x.ReplaceDevice(polNbr, partSeqId));
            await Orchestrator.ReplaceDevice(polNbr, partSeqId);
            Services.Device.VerifyAll();
        }

        [Fact]
        public async Task CancelDeviceReplacement_Tests()
        {
            var polNbr = "123";
            var partSeqId = 123;
            Services.Device.Setup(x => x.CancelDeviceReplacement(polNbr, partSeqId));
            await Orchestrator.CancelDeviceReplacement(polNbr, partSeqId);
            Services.Device.VerifyAll();
        }

        [Fact]
        public async Task MarkDeviceDefective_Tests()
        {
            string polNbr = "123", serialNumber = "456";
            Services.Device.Setup(x => x.MarkDeviceDefective(polNbr, serialNumber));
            await Orchestrator.MarkDeviceDefective(polNbr, serialNumber);
            Services.Device.VerifyAll();
        }

        [Fact]
        public async Task SetAudioStatus_Tests()
        {
            bool isAudioOn = true;
            string serialNumber = "456";
            Apis.Device.Setup(x => x.SetAudioStatus(serialNumber, isAudioOn));
            await Orchestrator.SetAudioStatus(isAudioOn, serialNumber);
            Apis.Device.VerifyAll();
        }

        [Fact]
        public async Task GetAudioStatus_Tests()
        {
            string serialNumber = "456";
            Apis.Device.Setup(x => x.GetAudioStatus(serialNumber));
            await Orchestrator.GetAudioStatus(serialNumber);
            Apis.Device.VerifyAll();
        }

        [Theory]
        [InlineData(StopShipmentMethod.SetMonitoringComplete)]
        [InlineData(StopShipmentMethod.OptOut)]
        public async Task StopShipment_Tests(StopShipmentMethod method)
        {
            string polNbr = "123";
            int participantSeqId = 123, policyPeriodSeqId = 123;

            if (method == StopShipmentMethod.SetMonitoringComplete)
                Orchestrators.Participant.Setup(x => x.SetToMonitoringComplete(polNbr, participantSeqId, policyPeriodSeqId));
            else
                Orchestrators.Participant.Setup(x => x.OptOut(polNbr, participantSeqId));

            await Orchestrator.StopDeviceShipment(polNbr, participantSeqId, policyPeriodSeqId, method);

            Orchestrators.Participant.VerifyAll();
        }

        [Fact]
        public async Task FeeReversal_Tests()
        {
            string deviceSerialNumber = "8888", policyNumber = "123";
            short expirationYear = 1, policySuffix = 0;
            int participantSeqId = 456;

            Services.Device.Setup(x => x.FeeReversal(deviceSerialNumber, expirationYear, participantSeqId, policyNumber, policySuffix));

            await Orchestrator.FeeReversal(deviceSerialNumber, expirationYear, participantSeqId, policyNumber, policySuffix);

            Services.Device.VerifyAll();
        }

        [Fact]
        public async Task MobileReEnroll_Tests()
        {
            var policyNumber = "123";
            var partId = Guid.NewGuid().ToString();
            var mobileId = "8675309";

            Databases.Policy.Setup(x => x.ReEnrollInMobile(policyNumber, partId, mobileId));

            await Orchestrator.MobileReEnroll(policyNumber, partId, mobileId);

            Databases.Policy.VerifyAll();
        }
    }
}
