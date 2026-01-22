using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.Device;
using Progressive.Telematics.Labs.Business.Resources.Resources.Participant;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using Progressive.Telematics.Labs.Business.Orchestrators.Device;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Services.Database.Models.DeviceOrder;
using Progressive.Telematics.Labs.Services.Wcf;
using WcfXirgoService;
using Xunit;
using XirgoResponseError = WcfXirgoService.ResponseError;
using XirgoResponseStatus = WcfXirgoService.ResponseStatus;
using BusinessResetDeviceRequest = Progressive.Telematics.Labs.Business.Resources.Resources.Device.ResetDeviceRequest;
using WcfDeviceActivityService;
using ServiceDeviceActivityService = Progressive.Telematics.Labs.Services.Wcf.IDeviceActivityService;

namespace Progressive.Telematics.Labs.Business.Tests;

public class DeviceOrchestratorTests
{
    private readonly Mock<IParticipantDAL> _participantDal = new();
    private readonly Mock<IXirgoDeviceService> _xirgoDeviceService = new();
    private readonly Mock<ILabsMyScoreDeviceDAL> _homebaseDeviceDal = new();
    private readonly Mock<ServiceDeviceActivityService> _deviceActivityService = new();
    private readonly Mock<IDeviceOrderDAL> _deviceOrderDal = new();
    private readonly Mock<IDeviceRecoveryService> _deviceRecoveryService = new();
    private readonly Mock<IAccountDAL> _accountDal = new();
    private readonly DeviceOrchestrator _subject;

    public DeviceOrchestratorTests()
    {
        var logger = Mock.Of<ILogger<DeviceOrchestrator>>();
        _subject = new DeviceOrchestrator(
            logger,
            _participantDal.Object,
            _xirgoDeviceService.Object,
            _deviceActivityService.Object,
            _homebaseDeviceDal.Object,
            _deviceOrderDal.Object,
            _deviceRecoveryService.Object,
            _accountDal.Object);
    }

    [Fact]
    public async Task MarkDefective_WhenSuccessful_UpdatesDeviceStatusAndLocation()
    {
        const int participantSeqId = 42;
        const int vehicleSeqId = 1010;
        const int deviceSeqId = 55;
        const string serialNumber = "DEF123";
        const string sim = "SIM123";

        var participant = new ParticipantInfo
        {
            ParticipantSeqID = participantSeqId,
            VehicleSeqID = vehicleSeqId,
            DeviceSeqID = deviceSeqId,
        };

        _participantDal
            .Setup(dal => dal.GetParticipantBySeqId(participantSeqId))
            .ReturnsAsync(participant);

        _xirgoDeviceService
            .Setup(service => service.GetDeviceBySerialNumber(serialNumber))
            .ReturnsAsync(BuildDeviceResponse(deviceSeqId, serialNumber, sim));

        XirgoDevice? capturedDevice = null;

        _deviceRecoveryService
            .Setup(service => service.RecoverDeviceAsync(
                It.IsAny<XirgoDevice>(),
                It.IsAny<ParticipantInfo>(),
                It.IsAny<Resource>(),
                It.IsAny<int?>()))
            .ReturnsAsync(new DeviceRecoveryResult(true))
            .Callback<XirgoDevice, ParticipantInfo, Resource, int?>((device, _, _, _) => capturedDevice = device);

        var result = await _subject.MarkDefective(new MarkDefectiveRequest
        {
            ParticipantSequenceId = participantSeqId,
            DeviceSerialNumber = serialNumber,
        });

        Assert.Null(result.Messages);
        Assert.NotNull(capturedDevice);
        Assert.Equal((int)DeviceStatus.Defective, capturedDevice!.StatusCode);
        Assert.NotEqual((int)DeviceLocation.Unknown, capturedDevice.LocationCode);
    }

    [Fact]
    public async Task MarkAbandoned_WhenSuccessful_UpdatesDeviceAndCreatesReturn()
    {
        const int participantSeqId = 101;
        const int vehicleSeqId = 202;
        const int deviceSeqId = 303;
        const string serialNumber = "ABC123";
        const string sim = "SIM999";

        var participant = new ParticipantInfo
        {
            ParticipantSeqID = participantSeqId,
            VehicleSeqID = vehicleSeqId,
            DeviceSeqID = deviceSeqId,
        };

        _participantDal
            .Setup(dal => dal.GetParticipantBySeqId(participantSeqId))
            .ReturnsAsync(participant);

        _xirgoDeviceService
            .Setup(service => service.GetDeviceBySerialNumber(serialNumber))
            .ReturnsAsync(BuildDeviceResponse(deviceSeqId, serialNumber, sim));

        XirgoDevice? capturedDevice = null;
        ParticipantInfo? capturedParticipant = null;
        Resource? capturedResponse = null;
        int? capturedReason = null;

        _deviceRecoveryService
            .Setup(service => service.RecoverDeviceAsync(
                It.IsAny<XirgoDevice>(),
                It.IsAny<ParticipantInfo>(),
                It.IsAny<Resource>(),
                It.IsAny<int?>()))
            .ReturnsAsync(new DeviceRecoveryResult(true))
            .Callback<XirgoDevice, ParticipantInfo, Resource, int?>((d, p, r, reason) =>
            {
                capturedDevice = d;
                capturedParticipant = p;
                capturedResponse = r;
                capturedReason = reason;
            });

        var result = await _subject.MarkAbandoned(new MarkAbandonedRequest
        {
            ParticipantSequenceId = participantSeqId,
            DeviceSerialNumber = serialNumber,
        });

        Assert.Null(result.Messages);
        Assert.NotNull(capturedDevice);
        Assert.Equal(deviceSeqId, capturedDevice!.DeviceSeqID);
        Assert.Equal((int)DeviceStatus.Abandoned, capturedDevice.StatusCode);
        Assert.Equal((int)DeviceLocation.Unknown, capturedDevice.LocationCode);
        Assert.Equal(sim, capturedDevice.SIM);
        Assert.NotNull(capturedParticipant);
        Assert.Equal(participantSeqId, capturedParticipant!.ParticipantSeqID);
        Assert.Same(result, capturedResponse);
        Assert.Null(capturedReason);
        _deviceRecoveryService.Verify(service => service.RecoverDeviceAsync(
            It.IsAny<XirgoDevice>(),
            participant,
            It.IsAny<Resource>(),
            null), Times.Once);
    }

    [Fact]
    public async Task MarkAbandoned_WhenParticipantNotFound_DoesNotFetchDevice()
    {
        const int participantSeqId = 707;

        _participantDal
            .Setup(dal => dal.GetParticipantBySeqId(participantSeqId))
            .ReturnsAsync((ParticipantInfo)null);

        var result = await _subject.MarkAbandoned(new MarkAbandonedRequest
        {
            ParticipantSequenceId = participantSeqId,
            DeviceSerialNumber = "IGNORED",
        });

        _xirgoDeviceService.Verify(service => service.GetDeviceBySerialNumber(It.IsAny<string>()), Times.Never);
        _deviceRecoveryService.Verify(service => service.RecoverDeviceAsync(
            It.IsAny<XirgoDevice>(),
            It.IsAny<ParticipantInfo>(),
            It.IsAny<Resource>(),
            It.IsAny<int?>()), Times.Never);
        Assert.Null(result.Messages);
    }

    [Fact]
    public async Task MarkAbandoned_WhenDeviceNotFound_ThrowsInvalidOperationException()
    {
        const int participantSeqId = 808;
        const int vehicleSeqId = 909;

        var participant = new ParticipantInfo
        {
            ParticipantSeqID = participantSeqId,
            VehicleSeqID = vehicleSeqId,
            DeviceSeqID = 1001,
        };

        _participantDal
            .Setup(dal => dal.GetParticipantBySeqId(participantSeqId))
            .ReturnsAsync(participant);

        var response = new GetDeviceBySerialNumberResponse
        {
            Device = null,
            ResponseStatus = XirgoResponseStatus.Success,
            ResponseErrors = Array.Empty<XirgoResponseError>(),
            Version = 1,
        };

        _xirgoDeviceService
            .Setup(service => service.GetDeviceBySerialNumber(It.IsAny<string>()))
            .ReturnsAsync(response);

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _subject.MarkAbandoned(new MarkAbandonedRequest
        {
            ParticipantSequenceId = participantSeqId,
            DeviceSerialNumber = "UNKNOWN",
        }));

        Assert.Contains("Device not found for serial number", exception.Message, StringComparison.Ordinal);
        _xirgoDeviceService.Verify(service => service.UpdateXirgoDevice(It.IsAny<int>(), It.IsAny<DeviceStatus>(), It.IsAny<DeviceLocation>()), Times.Never);
        _deviceRecoveryService.Verify(service => service.RecoverDeviceAsync(
            It.IsAny<XirgoDevice>(),
            It.IsAny<ParticipantInfo>(),
            It.IsAny<Resource>(),
            It.IsAny<int?>()), Times.Never);
    }

    [Fact]
    public async Task GetAudioStatusAWS_WhenSuccessful_ReturnsStatusAndExtender()
    {
        const string serialNumber = "AUD123";

        _xirgoDeviceService
            .Setup(service => service.GetDeviceAudioBySerialNumber(serialNumber))
            .ReturnsAsync(new GetDeviceAudioBySerialNumberResponse
            {
                Device = new XirgoDevice(),
                IsAudioOn = true,
                ResponseStatus = XirgoResponseStatus.Success,
                ResponseErrors = Array.Empty<XirgoResponseError>(),
                Version = 1,
            });

        var result = await _subject.GetAudioStatusAWS(new GetAudioStatusAWSRequest
        {
            DeviceSerialNumber = serialNumber,
        });

        Assert.NotNull(result.Extenders);
        Assert.True((bool)result.Extenders![DeviceResourceExtenderKeys.AudioStatus]);
        Assert.Equal("Device audio is currently On.", result.Messages![MessageCode.StatusDescription]);
    }

    [Fact]
    public async Task GetAudioStatusAWS_WhenServiceFails_AddsErrorMessage()
    {
        const string serialNumber = "AUD_FAIL";

        _xirgoDeviceService
            .Setup(service => service.GetDeviceAudioBySerialNumber(serialNumber))
            .ReturnsAsync(new GetDeviceAudioBySerialNumberResponse
            {
                Device = new XirgoDevice(),
                IsAudioOn = false,
                ResponseStatus = XirgoResponseStatus.Failure,
                ResponseErrors = new[] { new XirgoResponseError { Message = "unable to fetch" } },
                Version = 1,
            });

        var result = await _subject.GetAudioStatusAWS(new GetAudioStatusAWSRequest
        {
            DeviceSerialNumber = serialNumber,
        });

        Assert.NotNull(result.Messages);
        Assert.Equal("GetAudioStatusFailed", result.Messages![MessageCode.ErrorCode]);
        Assert.Equal("unable to fetch", result.Messages![MessageCode.ErrorDetails]);
    }

    [Fact]
    public async Task SetAudioStatusAWS_WhenSuccessful_ReturnsStatusAndExtender()
    {
        const string serialNumber = "SET123";

        _xirgoDeviceService
            .Setup(service => service.UpdateDeviceAudio(serialNumber, true))
            .ReturnsAsync(new UpdateDeviceAudioBySerialNumberResponse
            {
                ResponseStatus = XirgoResponseStatus.Success,
                ResponseErrors = Array.Empty<XirgoResponseError>(),
                Version = 1,
            });

        var result = await _subject.SetAudioStatusAWS(new SetAudioStatusAWSRequest
        {
            DeviceSerialNumber = serialNumber,
            IsAudioOn = true,
        });

        Assert.NotNull(result.Extenders);
        Assert.True((bool)result.Extenders![DeviceResourceExtenderKeys.AudioStatus]);
        Assert.Equal("Device audio set to On.", result.Messages![MessageCode.StatusDescription]);
    }

    [Fact]
    public async Task SetAudioStatusAWS_WhenServiceFails_AddsErrorMessage()
    {
        const string serialNumber = "SET_FAIL";

        _xirgoDeviceService
            .Setup(service => service.UpdateDeviceAudio(serialNumber, false))
            .ReturnsAsync(new UpdateDeviceAudioBySerialNumberResponse
            {
                ResponseStatus = XirgoResponseStatus.Failure,
                ResponseErrors = new[] { new XirgoResponseError { Message = "update failed" } },
                Version = 1,
            });

        var result = await _subject.SetAudioStatusAWS(new SetAudioStatusAWSRequest
        {
            DeviceSerialNumber = serialNumber,
            IsAudioOn = false,
        });

        Assert.NotNull(result.Messages);
        Assert.Equal("SetAudioStatusFailed", result.Messages![MessageCode.ErrorCode]);
        Assert.Equal("update failed", result.Messages![MessageCode.ErrorDetails]);
    }

    [Fact]
    public async Task UpdateAudio_WhenSuccessful_AddsDeviceActivityAndReturnsStatus()
    {
        const string serialNumber = "LEGACY123";
        const int deviceSeqId = 77;

        _homebaseDeviceDal
            .Setup(dal => dal.GetDevicesBySerialNumbers(It.Is<IEnumerable<string>>(numbers => numbers.Single() == serialNumber)))
            .ReturnsAsync(new[]
            {
                new HomebaseDeviceDataModel
                {
                    DeviceSeqID = deviceSeqId,
                    DeviceSerialNumber = serialNumber,
                }
            });

        _xirgoDeviceService
            .Setup(service => service.UpdateDeviceAudio(serialNumber, true))
            .ReturnsAsync(new UpdateDeviceAudioBySerialNumberResponse
            {
                ResponseStatus = XirgoResponseStatus.Success,
                ResponseErrors = Array.Empty<XirgoResponseError>(),
                Version = 1,
            });

        _deviceActivityService
            .Setup(service => service.AddDeviceActivity(deviceSeqId, "Audio Turned On"))
            .ReturnsAsync(new WcfDeviceActivityService.AddDeviceActivityResponse
            {
                ResponseStatus = WcfDeviceActivityService.ResponseStatus.Success,
                ResponseErrors = Array.Empty<WcfDeviceActivityService.ResponseError>(),
                Version = 1,
            });

        var result = await _subject.UpdateAudio(new UpdateAudioRequest
        {
            DeviceSerialNumber = serialNumber,
            IsAudioOn = true,
        });

        Assert.NotNull(result.Extenders);
        Assert.True((bool)result.Extenders![DeviceResourceExtenderKeys.AudioStatus]);
        Assert.Equal("Device audio set to On.", result.Messages![MessageCode.StatusDescription]);
    }

    [Fact]
    public async Task UpdateAudio_WhenDeviceNotFound_AddsErrorMessage()
    {
        _homebaseDeviceDal
            .Setup(dal => dal.GetDevicesBySerialNumbers(It.IsAny<IEnumerable<string>>()))
            .ReturnsAsync(Enumerable.Empty<HomebaseDeviceDataModel>());

        var result = await _subject.UpdateAudio(new UpdateAudioRequest
        {
            DeviceSerialNumber = "MISSING",
            IsAudioOn = false,
        });

        Assert.NotNull(result.Messages);
        Assert.Equal("DeviceNotFound", result.Messages![MessageCode.ErrorCode]);
    }

    [Fact]
    public async Task UpdateAudio_WhenDeviceActivityFails_AddsErrorMessage()
    {
        const string serialNumber = "LEGACY_FAIL";
        const int deviceSeqId = 88;

        _homebaseDeviceDal
            .Setup(dal => dal.GetDevicesBySerialNumbers(It.Is<IEnumerable<string>>(numbers => numbers.Single() == serialNumber)))
            .ReturnsAsync(new[]
            {
                new HomebaseDeviceDataModel
                {
                    DeviceSeqID = deviceSeqId,
                    DeviceSerialNumber = serialNumber,
                }
            });

        _xirgoDeviceService
            .Setup(service => service.UpdateDeviceAudio(serialNumber, false))
            .ReturnsAsync(new UpdateDeviceAudioBySerialNumberResponse
            {
                ResponseStatus = XirgoResponseStatus.Success,
                ResponseErrors = Array.Empty<XirgoResponseError>(),
                Version = 1,
            });

        _deviceActivityService
            .Setup(service => service.AddDeviceActivity(deviceSeqId, "Audio Turned Off"))
            .ReturnsAsync(new WcfDeviceActivityService.AddDeviceActivityResponse
            {
                ResponseStatus = WcfDeviceActivityService.ResponseStatus.Failure,
                ResponseErrors = new[] { new WcfDeviceActivityService.ResponseError { Message = "activity failed" } },
                Version = 1,
            });

        var result = await _subject.UpdateAudio(new UpdateAudioRequest
        {
            DeviceSerialNumber = serialNumber,
            IsAudioOn = false,
        });

        Assert.NotNull(result.Messages);
        Assert.Equal("AddDeviceActivityFailed", result.Messages![MessageCode.ErrorCode]);
        Assert.Equal("activity failed", result.Messages![MessageCode.ErrorDetails]);
    }

    [Fact]
    public async Task UpdateAudio_WhenDeviceAudioUpdateFails_AddsErrorMessage()
    {
        const string serialNumber = "LEGACY_XIRGO_FAIL";
        const int deviceSeqId = 66;

        _homebaseDeviceDal
            .Setup(dal => dal.GetDevicesBySerialNumbers(It.Is<IEnumerable<string>>(numbers => numbers.Single() == serialNumber)))
            .ReturnsAsync(new[]
            {
                new HomebaseDeviceDataModel
                {
                    DeviceSeqID = deviceSeqId,
                    DeviceSerialNumber = serialNumber,
                }
            });

        _xirgoDeviceService
            .Setup(service => service.UpdateDeviceAudio(serialNumber, true))
            .ReturnsAsync(new UpdateDeviceAudioBySerialNumberResponse
            {
                ResponseStatus = XirgoResponseStatus.Failure,
                ResponseErrors = new[] { new XirgoResponseError { Message = "update failed" } },
                Version = 1,
            });

        var result = await _subject.UpdateAudio(new UpdateAudioRequest
        {
            DeviceSerialNumber = serialNumber,
            IsAudioOn = true,
        });

        Assert.NotNull(result.Messages);
        Assert.Equal("UpdateAudioFailed", result.Messages![MessageCode.ErrorCode]);
        Assert.Equal("update failed", result.Messages![MessageCode.ErrorDetails]);
        _deviceActivityService.Verify(service => service.AddDeviceActivity(It.IsAny<int>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task ReplaceDevice_WhenSuccessful_CreatesOrderAndRecoversDevice()
    {
        const int participantSeqId = 1111;
        const int participantGroupSeqId = 2222;
        const int vehicleSeqId = 3333;
        const int deviceSeqId = 4444;
        const string serialNumber = "SER123";
        const string sim = "SIM321";
        const string vin = "1ABC2345DEF678901";
        const string make = "Honda";
        const string modelName = "Civic";
        const int year = 2021;

        var participant = new ParticipantInfo
        {
            ParticipantSeqID = participantSeqId,
            ParticipantGroupSeqID = participantGroupSeqId,
            VehicleSeqID = vehicleSeqId,
            DeviceSeqID = deviceSeqId
        };

        _participantDal
            .Setup(dal => dal.GetParticipantBySeqId(participantSeqId))
            .ReturnsAsync(participant);

        _accountDal
            .Setup(dal => dal.GetAccountByParticipantSeqId(participantSeqId))
            .ReturnsAsync(new AccountDataModel
            {
                ParticipantSeqID = participantSeqId,
                VIN = vin,
                Year = year,
                Make = make,
                Model = modelName
            });

        _homebaseDeviceDal
            .Setup(dal => dal.GetDevicesBySeqIds(It.Is<IEnumerable<int>>(ids => ids.Single() == deviceSeqId)))
            .ReturnsAsync(new[]
            {
                new HomebaseDeviceDataModel
                {
                    DeviceSeqID = deviceSeqId,
                    DeviceSerialNumber = serialNumber,
                    SIM = sim
                }
            });

        _xirgoDeviceService
            .Setup(service => service.GetDeviceBySerialNumber(serialNumber))
            .ReturnsAsync(BuildDeviceResponse(deviceSeqId, serialNumber, sim));

        _deviceOrderDal
            .Setup(dal => dal.CreateReplacementOrder(It.IsAny<CreateReplacementDeviceOrderModel>()))
            .ReturnsAsync(new DeviceOrderCreationResult { DeviceOrderSeqId = 9876 });

        int? capturedReason = null;

        _deviceRecoveryService
            .Setup(service => service.RecoverDeviceAsync(
                It.IsAny<XirgoDevice>(),
                participant,
                It.IsAny<Resource>(),
                It.IsAny<int?>()))
            .ReturnsAsync(new DeviceRecoveryResult(true))
            .Callback<XirgoDevice, ParticipantInfo, Resource, int?>((_, _, _, reason) => capturedReason = reason);

        var result = await _subject.ReplaceDevice(new ReplaceDeviceRequest
        {
            ParticipantSequenceId = participantSeqId
        });

        _deviceOrderDal.Verify(dal => dal.CreateReplacementOrder(It.Is<CreateReplacementDeviceOrderModel>(model =>
            model.ParticipantGroupSeqId == participantGroupSeqId &&
            model.ParticipantSeqId == participantSeqId &&
            model.VehicleSeqId == vehicleSeqId &&
            model.DeviceSeqId == deviceSeqId &&
            model.Vin == vin &&
            model.Year == (short)year &&
            model.Make == make &&
            model.Model == modelName)), Times.Once);

        Assert.NotNull(result.Messages);
        Assert.Equal("Device replacement initiated", result.Messages[MessageCode.StatusDescription]);
        _deviceRecoveryService.Verify(service => service.RecoverDeviceAsync(
            It.Is<XirgoDevice>(device =>
                device.DeviceSeqID == deviceSeqId &&
                device.StatusCode == (int)DeviceStatus.Assigned &&
                device.LocationCode != (int)DeviceLocation.Unknown),
            participant,
            result,
            (int)DeviceReturnReasonCode.DeviceReplaced), Times.Once);
        Assert.Equal((int)DeviceReturnReasonCode.DeviceReplaced, capturedReason);
    }

    [Fact]
    public async Task ReplaceDevice_WhenParticipantMissingDevice_AddsErrorMessage()
    {
        const int participantSeqId = 1212;

        var participant = new ParticipantInfo
        {
            ParticipantSeqID = participantSeqId,
            ParticipantGroupSeqID = 99,
            VehicleSeqID = 88,
            DeviceSeqID = null
        };

        _participantDal
            .Setup(dal => dal.GetParticipantBySeqId(participantSeqId))
            .ReturnsAsync(participant);

        var result = await _subject.ReplaceDevice(new ReplaceDeviceRequest
        {
            ParticipantSequenceId = participantSeqId
        });

        Assert.NotNull(result.Messages);
        Assert.Equal("ParticipantDeviceNotFound", result.Messages[MessageCode.ErrorCode]);
        _deviceOrderDal.Verify(dal => dal.CreateReplacementOrder(It.IsAny<CreateReplacementDeviceOrderModel>()), Times.Never);
    }

    [Fact]
    public async Task ReplaceDevice_WhenDeviceLookupFails_ThrowsInvalidOperationException()
    {
        const int participantSeqId = 1313;
        const int deviceSeqId = 1414;

        var participant = new ParticipantInfo
        {
            ParticipantSeqID = participantSeqId,
            ParticipantGroupSeqID = 55,
            VehicleSeqID = 44,
            DeviceSeqID = deviceSeqId
        };

        _participantDal
            .Setup(dal => dal.GetParticipantBySeqId(participantSeqId))
            .ReturnsAsync(participant);

        _homebaseDeviceDal
            .Setup(dal => dal.GetDevicesBySeqIds(It.IsAny<IEnumerable<int>>()))
            .ReturnsAsync(Array.Empty<HomebaseDeviceDataModel>());

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => _subject.ReplaceDevice(new ReplaceDeviceRequest
        {
            ParticipantSequenceId = participantSeqId
        }));

        Assert.Contains($"Device not found for DeviceSeqID {deviceSeqId}", exception.Message, StringComparison.Ordinal);
        _deviceOrderDal.Verify(dal => dal.CreateReplacementOrder(It.IsAny<CreateReplacementDeviceOrderModel>()), Times.Never);
        _deviceRecoveryService.Verify(service => service.RecoverDeviceAsync(
            It.IsAny<XirgoDevice>(),
            It.IsAny<ParticipantInfo>(),
            It.IsAny<Resource>(),
            It.IsAny<int?>()), Times.Never);
    }

    [Fact]
    public async Task ReplaceDevice_WhenRecoveryFails_DoesNotCommitAndReturnsError()
    {
        const int participantSeqId = 5151;
        const int participantGroupSeqId = 5252;
        const int vehicleSeqId = 5353;
        const int deviceSeqId = 5454;
        const string serialNumber = "SER987";

        var participant = new ParticipantInfo
        {
            ParticipantSeqID = participantSeqId,
            ParticipantGroupSeqID = participantGroupSeqId,
            VehicleSeqID = vehicleSeqId,
            DeviceSeqID = deviceSeqId
        };

        _participantDal
            .Setup(dal => dal.GetParticipantBySeqId(participantSeqId))
            .ReturnsAsync(participant);

        _homebaseDeviceDal
            .Setup(dal => dal.GetDevicesBySeqIds(It.IsAny<IEnumerable<int>>()))
            .ReturnsAsync(new[]
            {
                new HomebaseDeviceDataModel
                {
                    DeviceSeqID = deviceSeqId,
                    DeviceSerialNumber = serialNumber,
                    SIM = "SIMFAIL"
                }
            });

        _xirgoDeviceService
            .Setup(service => service.GetDeviceBySerialNumber(serialNumber))
            .ReturnsAsync(BuildDeviceResponse(deviceSeqId, serialNumber, "SIMFAIL"));

        _deviceOrderDal
            .Setup(dal => dal.CreateReplacementOrder(It.IsAny<CreateReplacementDeviceOrderModel>()))
            .ReturnsAsync(new DeviceOrderCreationResult { DeviceOrderSeqId = 1234 });

        var responseWithError = new Resource();
        _deviceRecoveryService
            .Setup(service => service.RecoverDeviceAsync(
                It.IsAny<XirgoDevice>(),
                participant,
                It.IsAny<Resource>(),
                It.IsAny<int?>()))
            .Callback<XirgoDevice, ParticipantInfo, Resource, int?>((_, _, res, _) =>
            {
                res.AddMessage(MessageCode.ErrorCode, "FailedToDeactivateSim");
            })
            .ReturnsAsync(new DeviceRecoveryResult(false));

        var result = await _subject.ReplaceDevice(new ReplaceDeviceRequest
        {
            ParticipantSequenceId = participantSeqId
        });

        Assert.NotNull(result.Messages);
        Assert.Equal("FailedToDeactivateSim", result.Messages[MessageCode.ErrorCode]);
        Assert.False(result.Messages.ContainsKey(MessageCode.StatusDescription));
        _deviceRecoveryService.Verify(service => service.RecoverDeviceAsync(
            It.IsAny<XirgoDevice>(),
            participant,
            result,
            (int)DeviceReturnReasonCode.DeviceReplaced), Times.Once);
    }

    private static GetDeviceBySerialNumberResponse BuildDeviceResponse(int deviceSeqId, string serialNumber, string sim)
    {
        return new GetDeviceBySerialNumberResponse
        {
            Device = new XirgoDevice
            {
                DeviceSeqID = deviceSeqId,
                DeviceSerialNumber = serialNumber,
                StatusCode = (int)DeviceStatus.Assigned,
                LocationCode = (int)DeviceLocation.InVehicle,
                SIM = sim,
            },
            ResponseStatus = XirgoResponseStatus.Success,
            ResponseErrors = Array.Empty<XirgoResponseError>(),
            Version = 1,
        };
    }

    [Fact]
    public async Task SwapDevice_WhenSuccessful_UpdatesParticipantsAndReturnsSuccess()
    {
        const int sourceParticipantSeqId = 1001;
        const int destinationParticipantSeqId = 1002;
        const int participantGroupSeqId = 5000;
        const int sourceDeviceSeqId = 3001;
        const int destinationDeviceSeqId = 3002;
        const int sourceVehicleSeqId = 4001;
        const int destinationVehicleSeqId = 4002;
        const string sourceNickname = "Alpha";
        const string destinationNickname = "Bravo";

        var sourceAccount = new AccountDataModel
        {
            ParticipantSeqID = sourceParticipantSeqId,
            ParticipantGroupSeqID = participantGroupSeqId,
            DeviceSeqID = sourceDeviceSeqId,
            VehicleSeqID = sourceVehicleSeqId,
            Nickname = sourceNickname,
            ParticipantStatusCode = 1,
            DeviceExperienceTypeCode = (int)DeviceExperience.Device,
            DeviceStatusCode = (int)DeviceStatus.Assigned,
        };

        var destinationAccount = new AccountDataModel
        {
            ParticipantSeqID = destinationParticipantSeqId,
            ParticipantGroupSeqID = participantGroupSeqId,
            DeviceSeqID = destinationDeviceSeqId,
            VehicleSeqID = destinationVehicleSeqId,
            Nickname = destinationNickname,
            ParticipantStatusCode = 1,
            DeviceExperienceTypeCode = (int)DeviceExperience.Device,
            DeviceStatusCode = (int)DeviceStatus.Assigned,
        };

        var sourceParticipant = new ParticipantInfo
        {
            ParticipantSeqID = sourceParticipantSeqId,
            ParticipantGroupSeqID = participantGroupSeqId,
        };

        var destinationParticipant = new ParticipantInfo
        {
            ParticipantSeqID = destinationParticipantSeqId,
            ParticipantGroupSeqID = participantGroupSeqId,
        };

        _participantDal
            .Setup(dal => dal.GetParticipantBySeqId(sourceParticipantSeqId))
            .ReturnsAsync(sourceParticipant);

        _participantDal
            .Setup(dal => dal.GetParticipantBySeqId(destinationParticipantSeqId))
            .ReturnsAsync(destinationParticipant);

        _accountDal
            .Setup(dal => dal.GetAccountByParticipantSeqId(sourceParticipantSeqId))
            .ReturnsAsync(sourceAccount);

        _accountDal
            .Setup(dal => dal.GetAccountByParticipantSeqId(destinationParticipantSeqId))
            .ReturnsAsync(destinationAccount);

        _accountDal
            .Setup(dal => dal.GetAccountsByParticipantGroupSeqId(participantGroupSeqId))
            .ReturnsAsync(new[] { sourceAccount, destinationAccount });

        _homebaseDeviceDal
            .Setup(dal => dal.GetDevicesBySeqIds(It.Is<IEnumerable<int>>(ids => ids.Contains(sourceDeviceSeqId) && ids.Contains(destinationDeviceSeqId))))
            .ReturnsAsync(new[]
            {
                new HomebaseDeviceDataModel
                {
                    DeviceSeqID = sourceDeviceSeqId,
                    DeviceStatusCode = (int)DeviceStatus.Assigned,
                    DeviceSerialNumber = "SRC123",
                    DeviceLocationCode = (int)DeviceLocation.InVehicle,
                },
                new HomebaseDeviceDataModel
                {
                    DeviceSeqID = destinationDeviceSeqId,
                    DeviceStatusCode = (int)DeviceStatus.Assigned,
                    DeviceSerialNumber = "DST456",
                    DeviceLocationCode = (int)DeviceLocation.InVehicle,
                },
            });

        _participantDal
            .Setup(dal => dal.SwapParticipantAssignments(
                sourceParticipantSeqId,
                destinationParticipantSeqId,
                sourceDeviceSeqId,
                destinationDeviceSeqId,
                sourceVehicleSeqId,
                destinationVehicleSeqId,
                sourceNickname,
                destinationNickname))
            .Returns(Task.CompletedTask)
            .Verifiable();

        var result = await _subject.SwapDevice(new SwapDeviceRequest
        {
            SourceParticipantSequenceId = sourceParticipantSeqId,
            DestinationParticipantSequenceId = destinationParticipantSeqId,
        });

        _participantDal.Verify();
        Assert.NotNull(result.Messages);
        Assert.Equal("Swap Devices Successful", result.Messages[MessageCode.StatusDescription]);
    }

    [Fact]
    public async Task SwapDevice_WhenParticipantsAreSame_AddsHandledError()
    {
        var result = await _subject.SwapDevice(new SwapDeviceRequest
        {
            SourceParticipantSequenceId = 777,
            DestinationParticipantSequenceId = 777,
        });

        Assert.NotNull(result.Messages);
        Assert.Equal("SwapDeviceParticipantsMustDiffer", result.Messages[MessageCode.ErrorCode]);
        Assert.True(result.Messages.TryGetValue(MessageCode.Handled, out var handled));
        Assert.Equal("True", handled?.ToString());
        _participantDal.Verify(dal => dal.SwapParticipantAssignments(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task ResetDevice_WhenSuccessful_AddsStatusMessage()
    {
        const int participantSeqId = 4444;
        const string serialNumber = "RESET123";

        _participantDal
            .Setup(dal => dal.GetParticipantBySeqId(participantSeqId))
            .ReturnsAsync(new ParticipantInfo { ParticipantSeqID = participantSeqId });

        _xirgoDeviceService
            .Setup(service => service.ResetDevice(serialNumber))
            .ReturnsAsync(new ResetDeviceResponse
            {
                ResponseStatus = XirgoResponseStatus.Success,
                ResponseErrors = Array.Empty<XirgoResponseError>(),
                Version = 1,
            });

        var result = await _subject.ResetDevice(new BusinessResetDeviceRequest
        {
            ParticipantSequenceId = participantSeqId,
            DeviceSerialNumber = serialNumber,
        });

        Assert.NotNull(result.Messages);
        Assert.Equal("Reset Device request submitted", result.Messages[MessageCode.StatusDescription]);
        Assert.False(result.Messages.ContainsKey(MessageCode.ErrorCode));
    }

    [Fact]
    public async Task ResetDevice_WhenServiceReturnsFailure_AddsErrorMessage()
    {
        const int participantSeqId = 5555;
        const string serialNumber = "FAIL123";

        _participantDal
            .Setup(dal => dal.GetParticipantBySeqId(participantSeqId))
            .ReturnsAsync(new ParticipantInfo { ParticipantSeqID = participantSeqId });

        _xirgoDeviceService
            .Setup(service => service.ResetDevice(serialNumber))
            .ReturnsAsync(new ResetDeviceResponse
            {
                ResponseStatus = XirgoResponseStatus.Failure,
                ResponseErrors = new[]
                {
                    new XirgoResponseError { Message = "Unable to reset" },
                },
                Version = 1,
            });

        var result = await _subject.ResetDevice(new BusinessResetDeviceRequest
        {
            ParticipantSequenceId = participantSeqId,
            DeviceSerialNumber = serialNumber,
        });

        Assert.NotNull(result.Messages);
        Assert.Equal("ResetDeviceFailed", result.Messages[MessageCode.ErrorCode]);
        Assert.True(result.Messages.ContainsKey(MessageCode.ErrorDetails));
    }
}
