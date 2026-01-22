using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Progressive.Telematics.Labs.Business.Orchestrators.Device;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.Participant;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Database.Models.DeviceReturn;
using Progressive.Telematics.Labs.Services.Wcf;
using WcfSimManagementService;
using WcfXirgoService;
using Xunit;
using ISimManagementService = Progressive.Telematics.Labs.Services.Wcf.ISimManagementService;
using SimResponseError = WcfSimManagementService.ResponseError;
using SimResponseStatus = WcfSimManagementService.ResponseStatus;
using XirgoResponseError = WcfXirgoService.ResponseError;
using XirgoResponseStatus = WcfXirgoService.ResponseStatus;

namespace Progressive.Telematics.Labs.Business.Tests;

public class DeviceRecoveryServiceTests
{
    private readonly Mock<IXirgoDeviceService> _xirgoDeviceService = new();
    private readonly Mock<ISimManagementService> _simManagementService = new();
    private readonly Mock<IDeviceReturnDAL> _deviceReturnDal = new();
    private readonly DeviceRecoveryService _subject;

    public DeviceRecoveryServiceTests()
    {
        var logger = Mock.Of<ILogger<DeviceRecoveryService>>();
        _subject = new DeviceRecoveryService(
            _xirgoDeviceService.Object,
            _simManagementService.Object,
            _deviceReturnDal.Object,
            logger);
    }

    [Fact]
    public async Task RecoverDeviceAsync_WhenNoExistingReturn_AddsDeviceReturn()
    {
        const int participantSeqId = 11;
        const int deviceSeqId = 22;
        const int vehicleSeqId = 33;
        const string sim = "SIM-1";

        var participant = BuildParticipant(participantSeqId, deviceSeqId, vehicleSeqId);
        var device = BuildDevice(deviceSeqId, DeviceStatus.Abandoned, DeviceLocation.Unknown, sim);
        var resource = new Resource();

        _xirgoDeviceService
            .Setup(service => service.UpdateXirgoDevice(deviceSeqId, DeviceStatus.Abandoned, DeviceLocation.Unknown))
            .ReturnsAsync(BuildUpdateResponse(success: true));

        _simManagementService
            .Setup(service => service.Add(It.IsAny<AddSimManagementRequest>()))
            .ReturnsAsync(BuildSimManagementResponse(success: true));

        _deviceReturnDal
            .Setup(dal => dal.GetDeviceReturn(It.IsAny<GetDeviceReturnModel>()))
            .ReturnsAsync((DeviceReturnModel)null);

        DeviceReturnModel? capturedReturn = null;

        _deviceReturnDal
            .Setup(dal => dal.AddDeviceReturn(It.IsAny<AddDeviceReturnModel>()))
            .Returns(Task.CompletedTask)
            .Callback<AddDeviceReturnModel>(model => capturedReturn = model.DeviceReturn);

        await _subject.RecoverDeviceAsync(device, participant, resource);

        Assert.NotNull(capturedReturn);
        Assert.Equal(deviceSeqId, capturedReturn!.DeviceSeqID);
        Assert.Equal(participantSeqId, capturedReturn.ParticipantSeqID);
        Assert.Equal(vehicleSeqId, capturedReturn.VehicleSeqID);
        Assert.Equal((int)DeviceReturnReasonCode.Abandoned, capturedReturn.DeviceReturnReasonCode);
        Assert.True(capturedReturn.DeviceAbandonedDateTime.HasValue);
        Assert.Null(resource.Messages);
    }

    [Fact]
    public async Task RecoverDeviceAsync_WhenReturnExists_UpdatesDeviceReturn()
    {
        const int participantSeqId = 44;
        const int deviceSeqId = 55;
        const int vehicleSeqId = 66;

        var participant = BuildParticipant(participantSeqId, deviceSeqId, vehicleSeqId);
        var device = BuildDevice(deviceSeqId, DeviceStatus.Defective, DeviceLocation.InVehicle, sim: "SIM-2");
        var resource = new Resource();

        var existingReturn = new DeviceReturnModel
        {
            DeviceSeqID = deviceSeqId,
            ParticipantSeqID = participantSeqId,
            VehicleSeqID = vehicleSeqId,
            DeviceReturnReasonCode = (int)DeviceReturnReasonCode.Abandoned
        };

        _xirgoDeviceService
            .Setup(service => service.UpdateXirgoDevice(deviceSeqId, DeviceStatus.Defective, DeviceLocation.InVehicle))
            .ReturnsAsync(BuildUpdateResponse(success: true));

        _simManagementService
            .Setup(service => service.Add(It.IsAny<AddSimManagementRequest>()))
            .ReturnsAsync(BuildSimManagementResponse(success: true));

        _deviceReturnDal
            .Setup(dal => dal.GetDeviceReturn(It.IsAny<GetDeviceReturnModel>()))
            .ReturnsAsync(existingReturn);

        DeviceReturnModel? capturedReturn = null;

        _deviceReturnDal
            .Setup(dal => dal.UpdateDeviceReturn(It.IsAny<UpdateDeviceReturnModel>()))
            .Returns(Task.CompletedTask)
            .Callback<UpdateDeviceReturnModel>(model => capturedReturn = model.DeviceReturn);

        await _subject.RecoverDeviceAsync(device, participant, resource);

        Assert.NotNull(capturedReturn);
        Assert.Equal((int)DeviceReturnReasonCode.DeviceProblem, capturedReturn!.DeviceReturnReasonCode);
        Assert.False(capturedReturn.DeviceAbandonedDateTime.HasValue);
    }

    [Fact]
    public async Task RecoverDeviceAsync_WhenUpdateFails_AddsErrorMessages()
    {
        const int participantSeqId = 77;
        const int deviceSeqId = 88;

        var participant = BuildParticipant(participantSeqId, deviceSeqId, vehicleSeqId: 99);
        var device = BuildDevice(deviceSeqId, DeviceStatus.Assigned, DeviceLocation.Unknown, sim: "SIM-3");
        var resource = new Resource();

        _xirgoDeviceService
            .Setup(service => service.UpdateXirgoDevice(deviceSeqId, DeviceStatus.Assigned, DeviceLocation.Unknown))
            .ReturnsAsync(BuildUpdateResponse(success: false));

        _simManagementService
            .Setup(service => service.Add(It.IsAny<AddSimManagementRequest>()))
            .ReturnsAsync(BuildSimManagementResponse(success: true));

        _deviceReturnDal
            .Setup(dal => dal.GetDeviceReturn(It.IsAny<GetDeviceReturnModel>()))
            .ReturnsAsync((DeviceReturnModel)null);

        await _subject.RecoverDeviceAsync(device, participant, resource, (int)DeviceReturnReasonCode.DeviceReplaced);

        Assert.NotNull(resource.Messages);
        Assert.Equal("FailedToUpdateDevice", resource.Messages[MessageCode.ErrorCode]);
        var errorDetails = Assert.IsType<string>(resource.Messages[MessageCode.ErrorDetails]);
        Assert.NotEmpty(errorDetails);
    }

    [Fact]
    public async Task RecoverDeviceAsync_WhenReasonProvided_DoesNotSetAbandonedDate()
    {
        const int participantSeqId = 101;
        const int deviceSeqId = 202;

        var participant = BuildParticipant(participantSeqId, deviceSeqId, vehicleSeqId: 303);
        var device = BuildDevice(deviceSeqId, DeviceStatus.Assigned, DeviceLocation.Unknown, sim: "SIM-4");
        var resource = new Resource();

        _xirgoDeviceService
            .Setup(service => service.UpdateXirgoDevice(deviceSeqId, DeviceStatus.Assigned, DeviceLocation.Unknown))
            .ReturnsAsync(BuildUpdateResponse(success: true));

        _simManagementService
            .Setup(service => service.Add(It.IsAny<AddSimManagementRequest>()))
            .ReturnsAsync(BuildSimManagementResponse(success: true));

        _deviceReturnDal
            .Setup(dal => dal.GetDeviceReturn(It.IsAny<GetDeviceReturnModel>()))
            .ReturnsAsync((DeviceReturnModel)null);

        DeviceReturnModel? capturedReturn = null;

        _deviceReturnDal
            .Setup(dal => dal.AddDeviceReturn(It.IsAny<AddDeviceReturnModel>()))
            .Returns(Task.CompletedTask)
            .Callback<AddDeviceReturnModel>(model => capturedReturn = model.DeviceReturn);

        await _subject.RecoverDeviceAsync(device, participant, resource, (int)DeviceReturnReasonCode.DeviceReplaced);

        Assert.NotNull(capturedReturn);
        Assert.Equal((int)DeviceReturnReasonCode.DeviceReplaced, capturedReturn!.DeviceReturnReasonCode);
        Assert.Null(capturedReturn.DeviceAbandonedDateTime);
    }

    private static ParticipantInfo BuildParticipant(int participantSeqId, int deviceSeqId, int vehicleSeqId)
    {
        return new ParticipantInfo
        {
            ParticipantSeqID = participantSeqId,
            DeviceSeqID = deviceSeqId,
            VehicleSeqID = vehicleSeqId
        };
    }

    private static XirgoDevice BuildDevice(int deviceSeqId, DeviceStatus status, DeviceLocation location, string sim)
    {
        return new XirgoDevice
        {
            DeviceSeqID = deviceSeqId,
            StatusCode = (int)status,
            LocationCode = (int)location,
            SIM = sim,
        };
    }

    private static UpdateDeviceResponse BuildUpdateResponse(bool success)
    {
        return new UpdateDeviceResponse
        {
            ResponseStatus = success ? XirgoResponseStatus.Success : XirgoResponseStatus.Failure,
            ResponseErrors = success
                ? Array.Empty<XirgoResponseError>()
                : new[] { new XirgoResponseError { Message = "Something went wrong" } },
            Version = 1
        };
    }

    private static AddSimManagementResponse BuildSimManagementResponse(bool success)
    {
        return new AddSimManagementResponse
        {
            ResponseStatus = success ? SimResponseStatus.Success : SimResponseStatus.Failure,
            ResponseErrors = success
                ? Array.Empty<SimResponseError>()
                : new[] { new SimResponseError { Message = "Deactivate failed" } },
            Version = 1
        };
    }
}
