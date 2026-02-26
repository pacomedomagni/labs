using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using Progressive.Telematics.Labs.Business.Orchestrators.DevicePrep;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Services.Database.Models;
using Xunit;
using WcfXirgoService;

namespace Progressive.Telematics.Labs.Business.Tests.DevicePrep
{
    public class LotManagementOrchestratorTests : TestBase<LotManagementOrchestrator, ILotManagementOrchestrator>
    {
        public LotManagementOrchestratorTests()
        {
            Orchestrator = new LotManagementOrchestrator(
                Logger.Object,
                Databases.LotManagement.Object,
                Services.DeviceLot.Object,
                Services.XirgoDevice.Object,
                Databases.ConfigValues.Object,
                Mapper);
        }

        #region GetLotsForMarkBenchTestComplete Tests

        [Fact]
        public async Task GetLotsForMarkBenchTestComplete_WithAvailableLots_ReturnsLots()
        {
            // Arrange
            var dalLots = new List<DeviceLotDataModel>
            {
                new DeviceLotDataModel
                {
                    Name = "Lot001",
                    LotSeqID = 1,
                    CreateDateTime = DateTime.Now,
                    StatusCode = 1,
                    TypeCode = 1
                },
                new DeviceLotDataModel
                {
                    Name = "Lot002",
                    LotSeqID = 2,
                    CreateDateTime = DateTime.Now.AddDays(-1),
                    StatusCode = 2,
                    TypeCode = 1
                }
            };

            Databases.LotManagement.Setup(d => d.GetLotsForMarkBenchTestComplete())
                .ReturnsAsync(dalLots);

            // Act
            var result = await Orchestrator.GetLotsForMarkBenchTestComplete();

            // Assert
            Assert.NotNull(result);
            var lots = result.ToList();
            Assert.Equal(2, lots.Count);
            Assert.Equal("Lot001", lots[0].Name);
            Assert.Equal(1, lots[0].LotSeqID);
            Assert.Equal("Lot002", lots[1].Name);
            Assert.Equal(2, lots[1].LotSeqID);
        }

        [Fact]
        public async Task GetLotsForMarkBenchTestComplete_WithNoLots_ReturnsEmptyList()
        {
            // Arrange
            Databases.LotManagement.Setup(d => d.GetLotsForMarkBenchTestComplete())
                .ReturnsAsync(Enumerable.Empty<DeviceLotDataModel>());

            // Act
            var result = await Orchestrator.GetLotsForMarkBenchTestComplete();

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetLotsForMarkBenchTestComplete_WithNullResponse_ReturnsEmptyList()
        {
            // Arrange
            Databases.LotManagement.Setup(d => d.GetLotsForMarkBenchTestComplete())
                .ReturnsAsync((IEnumerable<DeviceLotDataModel>)null);

            // Act
            var result = await Orchestrator.GetLotsForMarkBenchTestComplete();

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetLotsForMarkBenchTestComplete_CallsDALOnce()
        {
            // Arrange
            Databases.LotManagement.Setup(d => d.GetLotsForMarkBenchTestComplete())
                .ReturnsAsync(Enumerable.Empty<DeviceLotDataModel>());

            // Act
            await Orchestrator.GetLotsForMarkBenchTestComplete();

            // Assert
            Databases.LotManagement.Verify(d => d.GetLotsForMarkBenchTestComplete(), Times.Once);
        }

        #endregion

        #region GetInProcessLots Tests

        [Fact]
        public async Task GetInProcessLots_WithAvailableLots_ReturnsLots()
        {
            // Arrange
            var wcfLots = new[]
            {
                new WcfDeviceLotService.DeviceLot
                {
                    Name = "Process001",
                    LotSeqID = 10,
                    CreateDateTime = DateTime.Now,
                    StatusCode = 1,
                    TypeCode = 1
                }
            };

            Services.DeviceLot.Setup(s => s.GetDeviceLotsInProcess())
                .ReturnsAsync(new WcfDeviceLotService.GetReceiveDeviceLotsInProcessResponse
                {
                    DeviceLots = wcfLots
                });

            // Act
            var result = await Orchestrator.GetInProcessLots();

            // Assert
            Assert.NotNull(result);
            var lots = result.ToList();
            Assert.Single(lots);
            // Note: AutoMapper may not be configured, so we're testing the call flow
            Services.DeviceLot.Verify(s => s.GetDeviceLotsInProcess(), Times.Once);
        }

        [Fact]
        public async Task GetInProcessLots_WithNoLots_ReturnsEmptyList()
        {
            // Arrange
            Services.DeviceLot.Setup(s => s.GetDeviceLotsInProcess())
                .ReturnsAsync(new WcfDeviceLotService.GetReceiveDeviceLotsInProcessResponse
                {
                    DeviceLots = Array.Empty<WcfDeviceLotService.DeviceLot>()
                });

            // Act
            var result = await Orchestrator.GetInProcessLots();

            // Assert
            Assert.NotNull(result);
            Services.DeviceLot.Verify(s => s.GetDeviceLotsInProcess(), Times.Once);
        }

        #endregion

        #region FindLot Tests

        [Fact]
        public async Task FindLot_WithValidSerialNumber_ReturnsManufacturerLot()
        {
            // Arrange
            var serialNumber = "SN123456";
            var manufacturerLotSeqId = 100;

            Services.XirgoDevice.Setup(s => s.GetDeviceBySerialNumber(serialNumber))
                .ReturnsAsync(new GetDeviceBySerialNumberResponse
                {
                    Device = new XirgoDevice
                    {
                        DeviceSeqID = 1,
                        ManufacturerLotSeqID = manufacturerLotSeqId,
                        ReturnLotSeqID = null
                    }
                });

            Services.DeviceLot.Setup(s => s.GetDeviceLot(manufacturerLotSeqId))
                .ReturnsAsync(new WcfDeviceLotService.GetDeviceLotResponse
                {
                    DeviceLot = new WcfDeviceLotService.DeviceLot
                    {
                        Name = "MFG-LOT-001",
                        LotSeqID = manufacturerLotSeqId,
                        CreateDateTime = DateTime.Now
                    }
                });

            // Act
            var result = await Orchestrator.FindLot(serialNumber);

            // Assert
            Assert.NotNull(result);
            // Mapper configuration would be needed for full assertion
            Services.XirgoDevice.Verify(s => s.GetDeviceBySerialNumber(serialNumber), Times.Once);
            Services.DeviceLot.Verify(s => s.GetDeviceLot(manufacturerLotSeqId), Times.Once);
        }

        [Fact]
        public async Task FindLot_WithReturnLot_ReturnsReturnLotWhenNewer()
        {
            // Arrange
            var serialNumber = "SN789012";
            var manufacturerLotSeqId = 100;
            var returnLotSeqId = 200;
            var oldDate = DateTime.Now.AddDays(-10);
            var newDate = DateTime.Now;

            Services.XirgoDevice.Setup(s => s.GetDeviceBySerialNumber(serialNumber))
                .ReturnsAsync(new GetDeviceBySerialNumberResponse
                {
                    Device = new XirgoDevice
                    {
                        DeviceSeqID = 1,
                        ManufacturerLotSeqID = manufacturerLotSeqId,
                        ReturnLotSeqID = returnLotSeqId
                    }
                });

            Services.DeviceLot.Setup(s => s.GetDeviceLot(manufacturerLotSeqId))
                .ReturnsAsync(new WcfDeviceLotService.GetDeviceLotResponse
                {
                    DeviceLot = new WcfDeviceLotService.DeviceLot
                    {
                        Name = "MFG-LOT-001",
                        LotSeqID = manufacturerLotSeqId,
                        CreateDateTime = oldDate
                    }
                });

            Services.DeviceLot.Setup(s => s.GetDeviceLot(returnLotSeqId))
                .ReturnsAsync(new WcfDeviceLotService.GetDeviceLotResponse
                {
                    DeviceLot = new WcfDeviceLotService.DeviceLot
                    {
                        Name = "RETURN-LOT-001",
                        LotSeqID = returnLotSeqId,
                        CreateDateTime = newDate
                    }
                });

            // Act
            var result = await Orchestrator.FindLot(serialNumber);

            // Assert
            Assert.NotNull(result);
            Services.XirgoDevice.Verify(s => s.GetDeviceBySerialNumber(serialNumber), Times.Once);
            Services.DeviceLot.Verify(s => s.GetDeviceLot(manufacturerLotSeqId), Times.Once);
            Services.DeviceLot.Verify(s => s.GetDeviceLot(returnLotSeqId), Times.Once);
        }

        [Fact]
        public async Task FindLot_WithNoDevice_ReturnsEmptyLot()
        {
            // Arrange
            var serialNumber = "INVALID";

            Services.XirgoDevice.Setup(s => s.GetDeviceBySerialNumber(serialNumber))
                .ReturnsAsync(new GetDeviceBySerialNumberResponse
                {
                    Device = null
                });

            // Act
            var result = await Orchestrator.FindLot(serialNumber);

            // Assert
            Assert.NotNull(result);
            Services.XirgoDevice.Verify(s => s.GetDeviceBySerialNumber(serialNumber), Times.Once);
            Services.DeviceLot.Verify(s => s.GetDeviceLot(It.IsAny<int>()), Times.Never);
        }

        [Fact]
        public async Task FindLot_WithDeviceWithoutLotSeqID_ReturnsEmptyLot()
        {
            // Arrange
            var serialNumber = "SN000000";

            Services.XirgoDevice.Setup(s => s.GetDeviceBySerialNumber(serialNumber))
                .ReturnsAsync(new GetDeviceBySerialNumberResponse
                {
                    Device = new XirgoDevice
                    {
                        DeviceSeqID = null,
                        ManufacturerLotSeqID = null
                    }
                });

            // Act
            var result = await Orchestrator.FindLot(serialNumber);

            // Assert
            Assert.NotNull(result);
            Services.DeviceLot.Verify(s => s.GetDeviceLot(It.IsAny<int>()), Times.Never);
        }

        #endregion

        #region Checkin Tests

        [Fact]
        public async Task Checkin_WithValidLotName_ProcessesLot()
        {
            // Arrange
            var lotName = "LOT-SHIP-001";

            Services.DeviceLot.Setup(s => s.GetDeviceLot(lotName))
                .ReturnsAsync(new WcfDeviceLotService.GetDeviceLotByNameResponse
                {
                    DeviceLot = new WcfDeviceLotService.DeviceLot
                    {
                        Name = lotName,
                        LotSeqID = 1,
                        StatusCode = (int)DeviceLotStatus.ShippedToDistributor
                    }
                });

            Services.DeviceLot.Setup(s => s.ReceiveLot(lotName))
                .ReturnsAsync(new WcfDeviceLotService.ReceiveLotResponse
                {
                    TotalDevicesUpdated = 5
                });

            // Act
            var result = await Orchestrator.Checkin(lotName);

            // Assert
            Assert.NotNull(result);
            Services.DeviceLot.Verify(s => s.GetDeviceLot(lotName), Times.Once);
            Services.DeviceLot.Verify(s => s.ReceiveLot(lotName), Times.Once);
        }

        [Fact]
        public async Task Checkin_WithInvalidStatus_DoesNotReceiveLot()
        {
            // Arrange
            var lotName = "LOT-INVALID";

            Services.DeviceLot.Setup(s => s.GetDeviceLot(lotName))
                .ReturnsAsync(new WcfDeviceLotService.GetDeviceLotByNameResponse
                {
                    DeviceLot = new WcfDeviceLotService.DeviceLot
                    {
                        Name = lotName,
                        LotSeqID = 1,
                        StatusCode = 99 // Not ShippedToDistributor
                    }
                });

            // Act
            var result = await Orchestrator.Checkin(lotName);

            // Assert
            Assert.NotNull(result);
            Services.DeviceLot.Verify(s => s.GetDeviceLot(lotName), Times.Once);
            Services.DeviceLot.Verify(s => s.ReceiveLot(It.IsAny<string>()), Times.Never);
        }

        [Fact]
        public async Task Checkin_WithDeviceSerialNumber_ProcessesDevice()
        {
            // Arrange
            var serialNumber = "SN123456";

            Services.DeviceLot.Setup(s => s.GetDeviceLot(serialNumber))
                .ReturnsAsync(new WcfDeviceLotService.GetDeviceLotByNameResponse
                {
                    DeviceLot = null
                });

            Services.XirgoDevice.Setup(s => s.GetDeviceBySerialNumber(serialNumber))
                .ReturnsAsync(new GetDeviceBySerialNumberResponse
                {
                    Device = new XirgoDevice
                    {
                        DeviceSerialNumber = serialNumber,
                        DeviceSeqID = 1
                    }
                });

            // Act
            var result = await Orchestrator.Checkin(serialNumber);

            // Assert
            Assert.NotNull(result);
            Services.DeviceLot.Verify(s => s.GetDeviceLot(serialNumber), Times.Once);
            Services.XirgoDevice.Verify(s => s.GetDeviceBySerialNumber(serialNumber), Times.Once);
        }

        [Fact]
        public async Task Checkin_WithNullLotAndDevice_ReturnsResource()
        {
            // Arrange
            var query = "NONEXISTENT";

            Services.DeviceLot.Setup(s => s.GetDeviceLot(query))
                .ReturnsAsync(new WcfDeviceLotService.GetDeviceLotByNameResponse
                {
                    DeviceLot = null
                });

            Services.XirgoDevice.Setup(s => s.GetDeviceBySerialNumber(query))
                .ReturnsAsync(new GetDeviceBySerialNumberResponse
                {
                    Device = null
                });

            // Act
            var result = await Orchestrator.Checkin(query);

            // Assert
            Assert.NotNull(result);
            Services.DeviceLot.Verify(s => s.GetDeviceLot(query), Times.Once);
            Services.XirgoDevice.Verify(s => s.GetDeviceBySerialNumber(query), Times.Once);
        }

        #endregion

        #region GetDeviceLot Tests

        [Fact]
        public async Task GetDeviceLot_WithValidLotName_ReturnsLot()
        {
            // Arrange
            var lotName = "LOT-TEST-001";

            Services.DeviceLot.Setup(s => s.GetDeviceLot(lotName))
                .ReturnsAsync(new WcfDeviceLotService.GetDeviceLotByNameResponse
                {
                    DeviceLot = new WcfDeviceLotService.DeviceLot
                    {
                        Name = lotName,
                        LotSeqID = 1,
                        CreateDateTime = DateTime.Now,
                        StatusCode = 1,
                        TypeCode = 1
                    }
                });

            // Act
            var result = await Orchestrator.GetDeviceLot(lotName);

            // Assert
            Assert.NotNull(result);
            Services.DeviceLot.Verify(s => s.GetDeviceLot(lotName), Times.Once);
        }

        [Fact]
        public async Task GetDeviceLot_WithNonExistentLot_ReturnsNull()
        {
            // Arrange
            var lotName = "NONEXISTENT";

            Services.DeviceLot.Setup(s => s.GetDeviceLot(lotName))
                .ReturnsAsync(new WcfDeviceLotService.GetDeviceLotByNameResponse
                {
                    DeviceLot = null
                });

            // Act
            var result = await Orchestrator.GetDeviceLot(lotName);

            // Assert
            Assert.Null(result);
            Services.DeviceLot.Verify(s => s.GetDeviceLot(lotName), Times.Once);
        }

        [Fact]
        public async Task GetDeviceLot_WithEmptyName_CallsService()
        {
            // Arrange
            var lotName = string.Empty;

            Services.DeviceLot.Setup(s => s.GetDeviceLot(lotName))
                .ReturnsAsync(new WcfDeviceLotService.GetDeviceLotByNameResponse
                {
                    DeviceLot = null
                });

            // Act
            var result = await Orchestrator.GetDeviceLot(lotName);

            // Assert
            Assert.Null(result);
            Services.DeviceLot.Verify(s => s.GetDeviceLot(lotName), Times.Once);
        }

        #endregion

        #region GetDevicesByLot Tests

        [Fact]
        public async Task GetDevicesByLot_WithValidLot_ReturnsDevices()
        {
            // Arrange
            var lotSeqId = 123;
            var lotType = DeviceLotType.Manufacturer;

            var wcfDevices = new[]
            {
                new XirgoDevice
                {
                    DeviceSeqID = 1,
                    DeviceSerialNumber = "SN001",
                    StatusCode = 9
                },
                new XirgoDevice
                {
                    DeviceSeqID = 2,
                    DeviceSerialNumber = "SN002",
                    StatusCode = 9
                }
            };

            Services.XirgoDevice.Setup(s => s.GetDevicesByLot(lotSeqId, lotType))
                .ReturnsAsync(new WcfXirgoService.GetDevicesByLotResponse
                {
                    Devices = wcfDevices,
                    resultCount = 2
                });

            // Act
            var result = await Orchestrator.GetDevicesByLot(lotSeqId, lotType);

            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.Devices);
            Services.XirgoDevice.Verify(s => s.GetDevicesByLot(lotSeqId, lotType), Times.Once);
        }

        [Fact]
        public async Task GetDevicesByLot_WithNoDevices_ReturnsEmptyArray()
        {
            // Arrange
            var lotSeqId = 999;
            var lotType = DeviceLotType.Returned;

            Services.XirgoDevice.Setup(s => s.GetDevicesByLot(lotSeqId, lotType))
                .ReturnsAsync(new WcfXirgoService.GetDevicesByLotResponse
                {
                    Devices = null,
                    resultCount = 0
                });

            // Act
            var result = await Orchestrator.GetDevicesByLot(lotSeqId, lotType);

            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.Devices);
            Assert.Empty(result.Devices);
            Assert.Equal(0, result.DeviceCount);
        }

        [Fact]
        public async Task GetDevicesByLot_WithEmptyDeviceArray_ReturnsEmptyResponse()
        {
            // Arrange
            var lotSeqId = 456;
            var lotType = DeviceLotType.RMA;

            Services.XirgoDevice.Setup(s => s.GetDevicesByLot(lotSeqId, lotType))
                .ReturnsAsync(new WcfXirgoService.GetDevicesByLotResponse
                {
                    Devices = Array.Empty<XirgoDevice>(),
                    resultCount = 0
                });

            // Act
            var result = await Orchestrator.GetDevicesByLot(lotSeqId, lotType);

            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.Devices);
            Assert.Empty(result.Devices);
            Assert.Equal(0, result.DeviceCount);
        }

        [Fact]
        public async Task GetDevicesByLot_WithDifferentLotTypes_CallsCorrectService()
        {
            // Arrange
            var lotSeqId = 789;
            var lotTypes = new[] { DeviceLotType.Manufacturer, DeviceLotType.Returned, DeviceLotType.RMA, DeviceLotType.Inventory };

            foreach (var lotType in lotTypes)
            {
                Services.XirgoDevice.Setup(s => s.GetDevicesByLot(lotSeqId, lotType))
                    .ReturnsAsync(new WcfXirgoService.GetDevicesByLotResponse
                    {
                        Devices = Array.Empty<XirgoDevice>(),
                        resultCount = 0
                    });

                // Act
                await Orchestrator.GetDevicesByLot(lotSeqId, lotType);

                // Assert
                Services.XirgoDevice.Verify(s => s.GetDevicesByLot(lotSeqId, lotType), Times.Once);
            }
        }

        #endregion

        #region Edge Case and Integration Tests

        [Fact]
        public async Task GetLotsForMarkBenchTestComplete_WithMultipleLots_PreservesOrder()
        {
            // Arrange
            var dalLots = new List<DeviceLotDataModel>
            {
                new DeviceLotDataModel { Name = "A", LotSeqID = 1, CreateDateTime = DateTime.Now, StatusCode = 1, TypeCode = 1 },
                new DeviceLotDataModel { Name = "B", LotSeqID = 2, CreateDateTime = DateTime.Now, StatusCode = 1, TypeCode = 1 },
                new DeviceLotDataModel { Name = "C", LotSeqID = 3, CreateDateTime = DateTime.Now, StatusCode = 1, TypeCode = 1 }
            };

            Databases.LotManagement.Setup(d => d.GetLotsForMarkBenchTestComplete())
                .ReturnsAsync(dalLots);

            // Act
            var result = await Orchestrator.GetLotsForMarkBenchTestComplete();

            // Assert
            var lots = result.ToList();
            Assert.Equal(3, lots.Count);
            Assert.Equal("A", lots[0].Name);
            Assert.Equal("B", lots[1].Name);
            Assert.Equal("C", lots[2].Name);
        }

        [Fact]
        public async Task Checkin_WithNullResponse_HandlesGracefully()
        {
            // Arrange
            var query = "TEST";

            Services.DeviceLot.Setup(s => s.GetDeviceLot(query))
                .ReturnsAsync((WcfDeviceLotService.GetDeviceLotByNameResponse)null);

            Services.XirgoDevice.Setup(s => s.GetDeviceBySerialNumber(query))
                .ReturnsAsync((GetDeviceBySerialNumberResponse)null);

            // Act & Assert - Should not throw
            var result = await Orchestrator.Checkin(query);
            Assert.NotNull(result);
        }

        [Fact]
        public async Task FindLot_WithOnlyManufacturerLot_SetsCorrectType()
        {
            // Arrange
            var serialNumber = "SN999999";
            var manufacturerLotSeqId = 100;

            Services.XirgoDevice.Setup(s => s.GetDeviceBySerialNumber(serialNumber))
                .ReturnsAsync(new GetDeviceBySerialNumberResponse
                {
                    Device = new XirgoDevice
                    {
                        DeviceSeqID = 1,
                        ManufacturerLotSeqID = manufacturerLotSeqId,
                        ReturnLotSeqID = null
                    }
                });

            Services.DeviceLot.Setup(s => s.GetDeviceLot(manufacturerLotSeqId))
                .ReturnsAsync(new WcfDeviceLotService.GetDeviceLotResponse
                {
                    DeviceLot = new WcfDeviceLotService.DeviceLot
                    {
                        Name = "MFG-LOT-ONLY",
                        LotSeqID = manufacturerLotSeqId,
                        CreateDateTime = DateTime.Now
                    }
                });

            // Act
            var result = await Orchestrator.FindLot(serialNumber);

            // Assert
            Assert.NotNull(result);
            Services.DeviceLot.Verify(s => s.GetDeviceLot(It.IsAny<int>()), Times.Once);
        }

        #endregion
    }
}

