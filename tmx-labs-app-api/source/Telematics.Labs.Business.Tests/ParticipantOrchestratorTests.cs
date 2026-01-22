using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Progressive.Telematics.Labs.Business.Orchestrators.Device;
using Progressive.Telematics.Labs.Business.Orchestrators.Vehicle;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.Participant;
using Progressive.Telematics.Labs.Business.Resources.Resources.Vehicle;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Services.Wcf;
using WcfXirgoService;
using Xunit;

namespace Progressive.Telematics.Labs.Business.Tests;

public class ParticipantOrchestratorTests
{

    private readonly Mock<IParticipantDAL> _participantDal = new();
    private readonly Mock<IAccountDAL> _accountDal = new();
    private readonly Mock<IXirgoDeviceService> _deviceService = new();
    private readonly Mock<IDeviceRecoveryService> _deviceRecoveryService = new();
    private readonly ParticipantOrchestrator _subject;

    public ParticipantOrchestratorTests()
    {
        _subject = new ParticipantOrchestrator(
            _participantDal.Object,
            _accountDal.Object,
            _deviceService.Object,
            _deviceRecoveryService.Object,
            Mock.Of<ILogger<ParticipantOrchestrator>>());
    }

    [Fact]
    public async Task OptOut_WhenSuccessful_ReturnsStatusDescription()
    {
        const int participantSeqId = 1010;
        const string serialNumber = "SERIAL123";

        var participant = new ParticipantInfo
        {
            ParticipantSeqID = participantSeqId,
            ParticipantGroupSeqID = 99,
            DeviceSeqID = 2020,
        };

        var account = new AccountDataModel
        {
            ParticipantSeqID = participantSeqId,
            DeviceExperienceTypeCode = (int)DeviceExperience.Device,
            DeviceSerialNumber = serialNumber,
            ParticipantStatusCode = 0,
        };

        _participantDal
            .Setup(dal => dal.GetParticipantBySeqId(participantSeqId))
            .ReturnsAsync(participant);

        _accountDal
            .Setup(dal => dal.GetAccountsByParticipantGroupSeqId(participant.ParticipantGroupSeqID))
            .ReturnsAsync(new[] { account }.AsEnumerable());

        _participantDal
            .Setup(dal => dal.UpdateParticipantStatus(participantSeqId, (int)ParticipantStatus.OptOut))
            .Returns(Task.CompletedTask);

        _participantDal
            .Setup(dal => dal.CancelPendingDeviceOrders(participantSeqId, DeviceOrderStatus.New, DeviceOrderStatus.Cancelled))
            .Returns(Task.CompletedTask);

        _deviceService
            .Setup(service => service.GetDeviceBySerialNumber(serialNumber))
            .ReturnsAsync(new GetDeviceBySerialNumberResponse
            {
                Device = new XirgoDevice
                {
                    DeviceSeqID = participant.DeviceSeqID,
                    DeviceSerialNumber = serialNumber,
                    SIM = "SIM123",
                    StatusCode = (int)DeviceStatus.Assigned,
                    LocationCode = (int)DeviceLocation.InVehicle,
                },
                ResponseStatus = WcfXirgoService.ResponseStatus.Success,
                ResponseErrors = Array.Empty<WcfXirgoService.ResponseError>(),
            });

        _deviceRecoveryService
            .Setup(service => service.RecoverDeviceAsync(
                It.IsAny<XirgoDevice>(),
                participant,
                It.IsAny<Resource>(),
                (int)DeviceReturnReasonCode.OptOut))
            .ReturnsAsync(new DeviceRecoveryResult(true));

        var result = await _subject.OptOut(new OptOutParticipantRequest
        {
            ParticipantSequenceId = participantSeqId,
            DeviceSerialNumber = serialNumber,
        });

        _participantDal.Verify(dal => dal.UpdateParticipantStatus(participantSeqId, (int)ParticipantStatus.OptOut), Times.Once);
        _participantDal.Verify(dal => dal.CancelPendingDeviceOrders(participantSeqId, DeviceOrderStatus.New, DeviceOrderStatus.Cancelled), Times.Once);
        _deviceRecoveryService.Verify(service => service.RecoverDeviceAsync(
            It.Is<XirgoDevice>(device => device.DeviceSerialNumber == serialNumber && device.StatusCode == (int)DeviceStatus.CustomerReturn),
            participant,
            result,
            (int)DeviceReturnReasonCode.OptOut), Times.Once);

        Assert.NotNull(result.Messages);
        Assert.Equal("Opt Out Successful", result.Messages[MessageCode.StatusDescription]);
    }

    [Fact]
    public async Task OptOut_WhenParticipantUpdateFails_ReturnsError()
    {
        const int participantSeqId = 2020;

        var participant = new ParticipantInfo
        {
            ParticipantSeqID = participantSeqId,
            ParticipantGroupSeqID = 77,
        };

        var account = new AccountDataModel
        {
            ParticipantSeqID = participantSeqId,
            ParticipantGroupSeqID = participant.ParticipantGroupSeqID,
            DeviceExperienceTypeCode = (int)DeviceExperience.Mobile,
            ParticipantStatusCode = 0,
        };

        _participantDal
            .Setup(dal => dal.GetParticipantBySeqId(participantSeqId))
            .ReturnsAsync(participant);

        _accountDal
            .Setup(dal => dal.GetAccountsByParticipantGroupSeqId(participant.ParticipantGroupSeqID))
            .ReturnsAsync(new[] { account }.AsEnumerable());

        _participantDal
            .Setup(dal => dal.UpdateParticipantStatus(participantSeqId, (int)ParticipantStatus.OptOut))
            .ThrowsAsync(new InvalidOperationException("update failed"));

        _participantDal
            .Setup(dal => dal.CancelPendingDeviceOrders(participantSeqId, DeviceOrderStatus.New, DeviceOrderStatus.Cancelled))
            .Returns(Task.CompletedTask);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _subject.OptOut(new OptOutParticipantRequest
        {
            ParticipantSequenceId = participantSeqId,
        }));

        _deviceService.Verify(service => service.GetDeviceBySerialNumber(It.IsAny<string>()), Times.Never);
        _deviceRecoveryService.Verify(service => service.RecoverDeviceAsync(
            It.IsAny<XirgoDevice>(),
            It.IsAny<ParticipantInfo>(),
            It.IsAny<Resource>(),
            It.IsAny<int?>()), Times.Never);
    }

    [Fact]
    public async Task OptOut_WhenParticipantAlreadyOptedOut_ReturnsHandledMessage()
    {
        const int participantSeqId = 3030;

        var participant = new ParticipantInfo
        {
            ParticipantSeqID = participantSeqId,
            ParticipantGroupSeqID = 55,
        };

        var account = new AccountDataModel
        {
            ParticipantSeqID = participantSeqId,
            ParticipantGroupSeqID = participant.ParticipantGroupSeqID,
            ParticipantStatusCode = (int)ParticipantStatus.OptOut,
        };

        _participantDal
            .Setup(dal => dal.GetParticipantBySeqId(participantSeqId))
            .ReturnsAsync(participant);

        _accountDal
            .Setup(dal => dal.GetAccountsByParticipantGroupSeqId(participant.ParticipantGroupSeqID))
            .ReturnsAsync(new[] { account }.AsEnumerable());

        var result = await _subject.OptOut(new OptOutParticipantRequest
        {
            ParticipantSequenceId = participantSeqId,
        });

        Assert.NotNull(result.Messages);
        Assert.True((bool)result.Messages[MessageCode.Handled]);
        Assert.Equal("Participant already opted out", result.Messages[MessageCode.StatusDescription]);

        _participantDal.Verify(dal => dal.UpdateParticipantStatus(It.IsAny<int>(), It.IsAny<int>()), Times.Never);
        _participantDal.Verify(dal => dal.CancelPendingDeviceOrders(It.IsAny<int>(), It.IsAny<DeviceOrderStatus>(), It.IsAny<DeviceOrderStatus>()), Times.Never);
        _deviceService.Verify(service => service.GetDeviceBySerialNumber(It.IsAny<string>()), Times.Never);
        _deviceRecoveryService.Verify(service => service.RecoverDeviceAsync(
            It.IsAny<XirgoDevice>(),
            It.IsAny<ParticipantInfo>(),
            It.IsAny<Resource>(),
            It.IsAny<int?>()), Times.Never);
    }
}
