using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Services;
using Progressive.Telematics.Labs.Services.Wcf;
using WcfXirgoService;
using Xunit;

namespace Progressive.Telematics.Labs.Business.Tests;

public class DeviceValidationServiceTests
{
    private readonly Mock<IXirgoDeviceService> _xirgoDeviceService = new();
    private readonly Mock<ILogger<DeviceValidationService>> _logger = new();
    private readonly DeviceValidationService _subject;

    public DeviceValidationServiceTests()
    {
        _subject = new DeviceValidationService(_xirgoDeviceService.Object, _logger.Object);
    }

    [Fact]
    public async Task ValidateDeviceForFulfillment_WithNullSerialNumber_ReturnsInvalidResult()
    {
        var result = await _subject.ValidateDeviceForFulfillment(null);

        Assert.False(result.IsValid);
        Assert.False(result.IsExistent);
        Assert.False(result.IsAvailable);
        Assert.False(result.IsAssigned);
        Assert.False(result.IsBenchtested);
        Assert.Null(result.DeviceSerialNumber);
    }

    [Fact]
    public async Task ValidateDeviceForFulfillment_WithEmptySerialNumber_ReturnsInvalidResult()
    {
        var result = await _subject.ValidateDeviceForFulfillment("");

        Assert.False(result.IsValid);
        Assert.False(result.IsExistent);
        Assert.False(result.IsAvailable);
        Assert.False(result.IsAssigned);
        Assert.False(result.IsBenchtested);
    }

    [Fact]
    public async Task ValidateDeviceForFulfillment_WithWhitespaceSerialNumber_ReturnsInvalidResult()
    {
        var result = await _subject.ValidateDeviceForFulfillment("   ");

        Assert.False(result.IsValid);
        Assert.False(result.IsExistent);
        Assert.False(result.IsAvailable);
        Assert.False(result.IsAssigned);
        Assert.False(result.IsBenchtested);
    }

    [Fact]
    public async Task ValidateDeviceForFulfillment_WithNonExistentDevice_ReturnsInvalidResult()
    {
        const string serialNumber = "J12345";

        _xirgoDeviceService
            .Setup(x => x.GetDeviceBySerialNumber(serialNumber))
            .ReturnsAsync((GetDeviceBySerialNumberResponse)null);

        var result = await _subject.ValidateDeviceForFulfillment(serialNumber);

        Assert.False(result.IsValid);
        Assert.False(result.IsExistent);
        Assert.False(result.IsAvailable);
        Assert.False(result.IsAssigned);
        Assert.False(result.IsBenchtested);
        Assert.Equal(serialNumber, result.DeviceSerialNumber);
    }

    [Fact]
    public async Task ValidateDeviceForFulfillment_WithResponseWithoutDevice_ReturnsInvalidResult()
    {
        const string serialNumber = "X98765";

        _xirgoDeviceService
            .Setup(x => x.GetDeviceBySerialNumber(serialNumber))
            .ReturnsAsync(new GetDeviceBySerialNumberResponse { Device = null });

        var result = await _subject.ValidateDeviceForFulfillment(serialNumber);

        Assert.False(result.IsValid);
        Assert.False(result.IsExistent);
        Assert.False(result.IsAvailable);
        Assert.False(result.IsAssigned);
        Assert.False(result.IsBenchtested);
        Assert.Equal(serialNumber, result.DeviceSerialNumber);
    }

    [Fact]
    public async Task ValidateDeviceForFulfillment_WithAvailableBenchtestedDevice_ReturnsValidResult()
    {
        const string serialNumber = "J11111";

        var device = new XirgoDevice
        {
            StatusCode = (int)DeviceStatus.Available,
            BenchTestStatusCode = (int)DeviceBenchTestStatus.Completed
        };

        _xirgoDeviceService
            .Setup(x => x.GetDeviceBySerialNumber(serialNumber))
            .ReturnsAsync(new GetDeviceBySerialNumberResponse { Device = device });

        var result = await _subject.ValidateDeviceForFulfillment(serialNumber);

        Assert.True(result.IsValid);
        Assert.True(result.IsExistent);
        Assert.True(result.IsAvailable);
        Assert.False(result.IsAssigned);
        Assert.True(result.IsBenchtested);
        Assert.Equal(serialNumber, result.DeviceSerialNumber);
    }

    [Fact]
    public async Task ValidateDeviceForFulfillment_WithAssignedDevice_ReturnsInvalidResult()
    {
        const string serialNumber = "J22222";

        var device = new XirgoDevice
        {
            StatusCode = (int)DeviceStatus.Assigned,
            BenchTestStatusCode = (int)DeviceBenchTestStatus.Completed
        };

        _xirgoDeviceService
            .Setup(x => x.GetDeviceBySerialNumber(serialNumber))
            .ReturnsAsync(new GetDeviceBySerialNumberResponse { Device = device });

        var result = await _subject.ValidateDeviceForFulfillment(serialNumber);

        Assert.False(result.IsValid);
        Assert.True(result.IsExistent);
        Assert.False(result.IsAvailable);
        Assert.True(result.IsAssigned);
        Assert.True(result.IsBenchtested);
        Assert.Equal(serialNumber, result.DeviceSerialNumber);
    }

    [Fact]
    public async Task ValidateDeviceForFulfillment_WithDeviceNotBenchtested_ReturnsInvalidResult()
    {
        const string serialNumber = "X33333";

        var device = new XirgoDevice
        {
            StatusCode = (int)DeviceStatus.Available,
            BenchTestStatusCode = null
        };

        _xirgoDeviceService
            .Setup(x => x.GetDeviceBySerialNumber(serialNumber))
            .ReturnsAsync(new GetDeviceBySerialNumberResponse { Device = device });

        var result = await _subject.ValidateDeviceForFulfillment(serialNumber);

        Assert.False(result.IsValid);
        Assert.True(result.IsExistent);
        Assert.True(result.IsAvailable);
        Assert.False(result.IsAssigned);
        Assert.False(result.IsBenchtested);
        Assert.Equal(serialNumber, result.DeviceSerialNumber);
    }

    [Fact]
    public async Task ValidateDeviceForFulfillment_WithDeviceBenchTestStarted_ReturnsInvalidResult()
    {
        const string serialNumber = "J44444";

        var device = new XirgoDevice
        {
            StatusCode = (int)DeviceStatus.Available,
            BenchTestStatusCode = (int)DeviceBenchTestStatus.Started
        };

        _xirgoDeviceService
            .Setup(x => x.GetDeviceBySerialNumber(serialNumber))
            .ReturnsAsync(new GetDeviceBySerialNumberResponse { Device = device });

        var result = await _subject.ValidateDeviceForFulfillment(serialNumber);

        Assert.False(result.IsValid);
        Assert.True(result.IsExistent);
        Assert.True(result.IsAvailable);
        Assert.False(result.IsAssigned);
        Assert.False(result.IsBenchtested);
        Assert.Equal(serialNumber, result.DeviceSerialNumber);
    }

    [Fact]
    public async Task ValidateDeviceForFulfillment_WithDefectiveDevice_ReturnsInvalidResult()
    {
        const string serialNumber = "X55555";

        var device = new XirgoDevice
        {
            StatusCode = (int)DeviceStatus.Defective,
            BenchTestStatusCode = (int)DeviceBenchTestStatus.Completed
        };

        _xirgoDeviceService
            .Setup(x => x.GetDeviceBySerialNumber(serialNumber))
            .ReturnsAsync(new GetDeviceBySerialNumberResponse { Device = device });

        var result = await _subject.ValidateDeviceForFulfillment(serialNumber);

        Assert.False(result.IsValid);
        Assert.True(result.IsExistent);
        Assert.False(result.IsAvailable);
        Assert.False(result.IsAssigned);
        Assert.True(result.IsBenchtested);
        Assert.Equal(serialNumber, result.DeviceSerialNumber);
    }

    [Fact]
    public async Task ValidateDeviceForFulfillment_WithDeviceStatusNull_ReturnsInvalidResult()
    {
        const string serialNumber = "J66666";

        var device = new XirgoDevice
        {
            StatusCode = null,
            BenchTestStatusCode = (int)DeviceBenchTestStatus.Completed
        };

        _xirgoDeviceService
            .Setup(x => x.GetDeviceBySerialNumber(serialNumber))
            .ReturnsAsync(new GetDeviceBySerialNumberResponse { Device = device });

        var result = await _subject.ValidateDeviceForFulfillment(serialNumber);

        Assert.False(result.IsValid);
        Assert.True(result.IsExistent);
        Assert.False(result.IsAvailable);
        Assert.False(result.IsAssigned);
        Assert.True(result.IsBenchtested);
        Assert.Equal(serialNumber, result.DeviceSerialNumber);
    }

    [Fact]
    public async Task ValidateDeviceForFulfillment_WithMultipleCalls_ShouldCallServiceEachTime()
    {
        const string serialNumber1 = "J77777";
        const string serialNumber2 = "X88888";

        var device1 = new XirgoDevice
        {
            StatusCode = (int)DeviceStatus.Available,
            BenchTestStatusCode = (int)DeviceBenchTestStatus.Completed
        };

        var device2 = new XirgoDevice
        {
            StatusCode = (int)DeviceStatus.Assigned,
            BenchTestStatusCode = (int)DeviceBenchTestStatus.Completed
        };

        _xirgoDeviceService
            .Setup(x => x.GetDeviceBySerialNumber(serialNumber1))
            .ReturnsAsync(new GetDeviceBySerialNumberResponse { Device = device1 });

        _xirgoDeviceService
            .Setup(x => x.GetDeviceBySerialNumber(serialNumber2))
            .ReturnsAsync(new GetDeviceBySerialNumberResponse { Device = device2 });

        var result1 = await _subject.ValidateDeviceForFulfillment(serialNumber1);
        var result2 = await _subject.ValidateDeviceForFulfillment(serialNumber2);

        Assert.True(result1.IsValid);
        Assert.False(result2.IsValid);
        _xirgoDeviceService.Verify(x => x.GetDeviceBySerialNumber(serialNumber1), Times.Once);
        _xirgoDeviceService.Verify(x => x.GetDeviceBySerialNumber(serialNumber2), Times.Once);
    }
}
