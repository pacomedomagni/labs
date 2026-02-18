using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Progressive.Telematics.Labs.Business.Orchestrators.Account;
using Progressive.Telematics.Labs.Business.Resources.Resources.Account;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Services.Database.Models.DeviceReturn;
using Progressive.Telematics.Labs.Services.Wcf;
using Xunit;

namespace Progressive.Telematics.Labs.Business.Tests.Orchestrators.Account;

public class AccountOrchestratorTests
{
    private readonly Mock<IAccountDAL> _accountDal = new();
    private readonly Mock<IDeviceReturnDAL> _deviceReturnDal = new();
    private readonly Mock<ILabsMyScoreDeviceDAL> _homebaseDeviceDal = new();
    private readonly Mock<IDeviceOrderDAL> _deviceOrderDal = new();
    private readonly Mock<IXirgoDeviceService> _xirgoDeviceService = new();
    private readonly AccountOrchestrator _subject;

    public AccountOrchestratorTests()
    {
        var logger = Mock.Of<ILogger<AccountOrchestrator>>();
        _subject = new AccountOrchestrator(
            _accountDal.Object,
            _deviceReturnDal.Object,
            _homebaseDeviceDal.Object,
            logger,
            _deviceOrderDal.Object,
            _xirgoDeviceService.Object);
    }

    [Fact]
    public async Task GetAccountsByParticipantGroupSeqId_HydratesDeviceDetails()
    {
        const int participantGroupSeqId = 42;
        const int deviceSeqId = 99;
        var baseAccount = new AccountDataModel
        {
            ParticipantSeqID = 10,
            ParticipantGroupSeqID = participantGroupSeqId,
            DeviceSeqID = deviceSeqId,
            ParticipantStatusCode = 7,
            ParticipantExternalID = "external-123",
            ParticipantId = "participant-123",
            VIN = "VIN123",
            Year = 2024,
            Make = "HONDA",
            Model = "CR-V",
            DeviceExperienceTypeCode = 5,
            LastUpdateDateTime = new DateTime(2024, 4, 10, 8, 30, 0, DateTimeKind.Utc)
        };

        _accountDal
            .Setup(dal => dal.GetAccountsByParticipantGroupSeqId(participantGroupSeqId))
            .ReturnsAsync(new[] { baseAccount });

        var deviceReturn = new DeviceReturnByDeviceModel
        {
            DeviceSeqID = deviceSeqId,
            DeviceReturnReasonCode = 12,
            DeviceReceivedDateTime = new DateTime(2024, 5, 1, 12, 0, 0, DateTimeKind.Utc),
            DeviceAbandonedDateTime = new DateTime(2024, 5, 15, 17, 45, 0, DateTimeKind.Utc)
        };

        _deviceReturnDal
            .Setup(dal => dal.GetLatestByDeviceSeqIds(It.Is<IEnumerable<int>>(ids => ids.Single() == deviceSeqId)))
            .ReturnsAsync(new[] { deviceReturn });

        var homebaseDevice = new HomebaseDeviceDataModel
        {
            DeviceSeqID = deviceSeqId,
            DeviceSerialNumber = "SN-0001",
            SIM = "SIM-0001",
            DeviceStatusCode = 3,
            DeviceLocationCode = 5,
            DeviceManufacturer = "Xirgo",
            DeviceTypeDescription = "Wireless",
            ReportedVIN = "HBVIN456",
            DeviceShipDateTime = new DateTime(2024, 4, 12, 9, 0, 0, DateTimeKind.Utc),
            FirstContactDateTime = new DateTime(2024, 4, 13, 10, 0, 0, DateTimeKind.Utc),
            LastContactDateTime = new DateTime(2024, 5, 20, 11, 0, 0, DateTimeKind.Utc),
            LastUploadDateTime = new DateTime(2024, 5, 25, 12, 0, 0, DateTimeKind.Utc)
        };

        _homebaseDeviceDal
            .Setup(dal => dal.GetDevicesBySeqIds(It.Is<IEnumerable<int>>(ids => ids.Single() == deviceSeqId)))
            .ReturnsAsync(new[] { homebaseDevice });

        var response = await _subject.GetAccountsByParticipantGroupSeqId(participantGroupSeqId);

        Assert.Equal(1, response.RecordCount);
        var account = Assert.Single(response.Accounts);
        Assert.Equal("participant-123", account.Participant.ParticipantId);
        Assert.Equal(deviceSeqId, account.Device.DeviceSeqID);
        Assert.Equal("SN-0001", account.Device.DeviceSerialNumber);
        Assert.Equal("SIM-0001", account.Device.SIM);
        Assert.Equal(3, account.Device.DeviceStatusCode);
        Assert.Equal(5, account.Device.DeviceLocationCode);
        Assert.Equal("Xirgo", account.Device.DeviceManufacturer);
        Assert.Equal("Wireless", account.Device.DeviceTypeDescription);
        Assert.Equal("HBVIN456", account.Device.ReportedVIN);
        Assert.Equal(deviceReturn.DeviceReturnReasonCode, account.Device.DeviceReturnReasonCode);
        Assert.Equal(deviceReturn.DeviceReceivedDateTime, account.Device.DeviceReceivedDateTime);
        Assert.Equal(deviceReturn.DeviceAbandonedDateTime, account.Device.DeviceAbandonedDateTime);
        Assert.Equal(homebaseDevice.DeviceShipDateTime, account.Device.DeviceShipDateTime);
        Assert.Equal(homebaseDevice.FirstContactDateTime, account.Device.FirstContactDateTime);
        Assert.Equal(homebaseDevice.LastContactDateTime, account.Device.LastContactDateTime);
        Assert.Equal(homebaseDevice.LastUploadDateTime, account.Device.LastUploadDateTime);
    }

    [Fact]
    public async Task GetAccountsByParticipantGroupSeqId_SurfacesStoredDeviceDetailsWhenHydrationUnavailable()
    {
        const int participantGroupSeqId = 7;

        var accountRecord = new AccountDataModel
        {
            ParticipantSeqID = 51,
            ParticipantGroupSeqID = participantGroupSeqId,
            DeviceSeqID = null,
            DeviceExperienceTypeCode = 3,
            DeviceSerialNumber = "SN-9999",
            SIM = "SIM-1234",
            DeviceStatusCode = 4,
            DeviceLocationCode = 8,
            DeviceManufacturer = "Xirgo",
            DeviceTypeDescription = "Wireless H",
            ReportedVIN = "1HGCM82633A004352",
            DeviceShipDateTime = new DateTime(2024, 8, 4, 12, 0, 0, DateTimeKind.Utc),
            FirstContactDateTime = new DateTime(2024, 8, 10, 9, 30, 0, DateTimeKind.Utc),
            LastContactDateTime = new DateTime(2024, 8, 20, 9, 30, 0, DateTimeKind.Utc),
            LastUploadDateTime = new DateTime(2024, 8, 21, 9, 30, 0, DateTimeKind.Utc)
        };

        _accountDal
            .Setup(dal => dal.GetAccountsByParticipantGroupSeqId(participantGroupSeqId))
            .ReturnsAsync(new[] { accountRecord });

        _deviceReturnDal
            .Setup(dal => dal.GetLatestByDeviceSeqIds(It.IsAny<IEnumerable<int>>()))
            .ReturnsAsync(Array.Empty<DeviceReturnByDeviceModel>());

        _homebaseDeviceDal
            .Setup(dal => dal.GetDevicesBySeqIds(It.IsAny<IEnumerable<int>>()))
            .ReturnsAsync(Array.Empty<HomebaseDeviceDataModel>());

        var response = await _subject.GetAccountsByParticipantGroupSeqId(participantGroupSeqId);

        Assert.Equal(1, response.RecordCount);
        var account = Assert.Single(response.Accounts);
        Assert.Equal("SN-9999", account.Device.DeviceSerialNumber);
        Assert.Equal("SIM-1234", account.Device.SIM);
        Assert.Equal(4, account.Device.DeviceStatusCode);
        Assert.Equal(8, account.Device.DeviceLocationCode);
        Assert.Equal("Xirgo", account.Device.DeviceManufacturer);
        Assert.Equal("Wireless H", account.Device.DeviceTypeDescription);
        Assert.Equal("1HGCM82633A004352", account.Device.ReportedVIN);
        Assert.Equal(accountRecord.DeviceShipDateTime, account.Device.DeviceShipDateTime);
        Assert.Equal(accountRecord.FirstContactDateTime, account.Device.FirstContactDateTime);
        Assert.Equal(accountRecord.LastContactDateTime, account.Device.LastContactDateTime);
        Assert.Equal(accountRecord.LastUploadDateTime, account.Device.LastUploadDateTime);
    }
}
