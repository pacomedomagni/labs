using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CLBusinessDeviceOrderService;
using DiscountFulfillmentService;
using FulfillmentWeb.Shared.CodeTableManager;
using FulfillmentWeb.Shared.CodeTableManager.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Progressive.Telematics.Labs.Business.Orchestrators.Fulfillment;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;
using Progressive.Telematics.Labs.Services.Wcf;
using Xunit;

namespace Progressive.Telematics.Labs.Business.Tests.Orchestrators.Fulfillment
{
    public class OrderCountsOrchestratorTests
    {
        private readonly Mock<ILogger<OrderCountsOrchestrator>> _logger;
        private readonly Mock<IDiscountFulfillmentService> _discountFulfillmentService;
        private readonly Mock<ICLBusinessDeviceOrderService> _clBusinessDeviceOrderService;
        private readonly Mock<IFulfillmentWebCodeTableManager> _fulfillmentWebCodeTableManager;
        private readonly Mock<IConfiguration> _configuration;
        private readonly OrderCountsOrchestrator _orchestrator;

        public OrderCountsOrchestratorTests()
        {
            _logger = new Mock<ILogger<OrderCountsOrchestrator>>();
            _discountFulfillmentService = new Mock<IDiscountFulfillmentService>();
            _clBusinessDeviceOrderService = new Mock<ICLBusinessDeviceOrderService>();
            _fulfillmentWebCodeTableManager = new Mock<IFulfillmentWebCodeTableManager>();
            _configuration = new Mock<IConfiguration>();

            _orchestrator = new OrderCountsOrchestrator(
                _discountFulfillmentService.Object,
                _clBusinessDeviceOrderService.Object,
                _fulfillmentWebCodeTableManager.Object,
                _configuration.Object
            );
        }

        #region GetOrderCounts Tests

        [Fact]
        public async Task GetOrderCounts_WithSnapshotOrders_ReturnsCorrectCounts()
        {
            // Arrange
            var ordersModel = new Orders { Type = OrderType.Snapshot1Only };
            SetupMockCodeTables();
            SetupDiscountFulfillmentForNewOrders(2, 5);
            SetupDiscountFulfillmentForShippedOrders(3);

            // Act
            var result = await _orchestrator.GetOrderCounts(ordersModel);

            // Assert
            Assert.Equal(2, result.OpenSnapshotOrders);
            Assert.Equal(5, result.SnapshotDevicesNeeded);
            Assert.Equal(3, result.ProcessedSnapshotOrders);
        }

        [Fact]
        public async Task GetOrderCounts_WithCommercialLinesOrders_ReturnsCorrectCounts()
        {
            // Arrange
            var ordersModel = new Orders { Type = OrderType.CommercialLines };
            SetupMockCodeTables();
            SetupCLBusinessForNewOrders(3, 7);
            SetupCLBusinessForShippedOrders(4);

            // Act
            var result = await _orchestrator.GetOrderCounts(ordersModel);

            // Assert
            Assert.Equal(3, result.OpenCommercialLinesOrders);
            Assert.Equal(7, result.CommercialLinesDevicesNeeded);
            Assert.Equal(4, result.ProcessedCommercialLinesOrders);
        }

        [Fact]
        public async Task GetOrderCounts_WithCommercialLinesHeavyTruck_ReturnsCorrectCounts()
        {
            // Arrange
            var ordersModel = new Orders { Type = OrderType.CommercialLinesHeavyTruck };
            SetupMockCodeTables();
            SetupCLBusinessForNewOrders(1, 2, isHeavyTruck: true);
            SetupCLBusinessForShippedOrders(1);

            // Act
            var result = await _orchestrator.GetOrderCounts(ordersModel);

            // Assert
            Assert.Equal(1, result.OpenCommercialLinesOrders);
            Assert.Equal(2, result.CommercialLinesDevicesNeeded);
            Assert.Equal(1, result.ProcessedCommercialLinesOrders);
        }

        [Fact]
        public async Task GetOrderCounts_WithCommercialLinesHeavyTruckCable_ReturnsCorrectCableCount()
        {
            // Arrange
            var ordersModel = new Orders { Type = OrderType.CommercialLinesHeavyTruckCable };
            SetupMockCodeTables();
            SetupCLBusinessForNewOrders(1, 3, isHeavyTruck: true, cableCount: 2);
            SetupCLBusinessForShippedOrders(1, cableCount: 2);

            // Act
            var result = await _orchestrator.GetOrderCounts(ordersModel);

            // Assert
            Assert.Equal(1, result.OpenCommercialLinesOrders);
            Assert.Equal(3, result.CommercialLinesDevicesNeeded);
            Assert.Equal(2, result.ProcessedCommercialLinesOrders); // Only cable orders
        }

        #endregion

        #region GetStateOrderCounts Tests

        [Fact]
        public async Task GetStateOrderCounts_WithMultipleStates_GroupsCorrectly()
        {
            // Arrange
            var ordersByState = new OrdersByState { Type = OrderType.Snapshot1Only };
            SetupMockCodeTables();
            SetupDiscountFulfillmentForNewOrdersByState(new Dictionary<string, int>
            {
                { "OH", 3 },
                { "PA", 2 },
                { "FL", 1 }
            });

            // Act
            var result = await _orchestrator.GetStateOrderCounts(ordersByState);

            // Assert
            Assert.Equal(3, result.SearchResults.Count);
            Assert.Contains(result.SearchResults, s => s.State == "OH" && s.NumberOfOrders == 3);
            Assert.Contains(result.SearchResults, s => s.State == "PA" && s.NumberOfOrders == 2);
            Assert.Contains(result.SearchResults, s => s.State == "FL" && s.NumberOfOrders == 1);
        }

        [Fact]
        public async Task GetStateOrderCounts_WithOldOrders_CalculatesOldOrderCount()
        {
            // Arrange
            var ordersByState = new OrdersByState { Type = OrderType.CommercialLines };
            SetupMockCodeTables();
            SetupCLBusinessForOldAndNewOrders("OH", 2, 3); // 2 old, 3 new

            // Act
            var result = await _orchestrator.GetStateOrderCounts(ordersByState);

            // Assert
            var ohState = result.SearchResults.FirstOrDefault(s => s.State == "OH");
            Assert.NotNull(ohState);
            Assert.Equal(5, ohState.NumberOfOrders); // Total orders
            Assert.Equal(2, ohState.NumberOfOldOrders); // Old orders
        }

        [Fact]
        public async Task GetStateOrderCounts_OrdersStatesByName()
        {
            // Arrange
            var ordersByState = new OrdersByState { Type = OrderType.Snapshot2Only };
            SetupMockCodeTables();
            SetupDiscountFulfillmentForNewOrdersByState(new Dictionary<string, int>
            {
                { "TX", 1 },
                { "CA", 2 },
                { "NY", 1 }
            });

            // Act
            var result = await _orchestrator.GetStateOrderCounts(ordersByState);

            // Assert
            Assert.Equal(3, result.SearchResults.Count);
            Assert.Equal("CA", result.SearchResults[0].State);
            Assert.Equal("NY", result.SearchResults[1].State);
            Assert.Equal("TX", result.SearchResults[2].State);
        }

        #endregion

        #region GetNewOrders Tests

        [Fact]
        public async Task GetNewOrders_WithSnapshot1Only_AppliesCorrectFilter()
        {
            // Arrange
            SetupMockCodeTables();
            var expectedFilter = "ProgramType = 'PriceModel1'";
            DiscountFulfillmentService.GetOrdersRequest capturedRequest = null;

            _discountFulfillmentService
                .Setup(s => s.GetOrders(It.IsAny<DiscountFulfillmentService.GetOrdersRequest>()))
                .Callback<DiscountFulfillmentService.GetOrdersRequest>(req => capturedRequest = req)
                .ReturnsAsync(new DiscountFulfillmentService.GetOrdersResponse
                {
                    ResponseStatus = DiscountFulfillmentService.ResponseStatus.Success,
                    Orders = Array.Empty<DiscountFulfillmentService.Order>()
                });

            // Act
            await _orchestrator.GetNewOrders(OrderType.Snapshot1Only, null, null);

            // Assert
            Assert.NotNull(capturedRequest);
            Assert.Equal(expectedFilter, capturedRequest.Filter);
        }

        [Fact]
        public async Task GetNewOrders_WithSnapshot2Only_AppliesCorrectFilter()
        {
            // Arrange
            SetupMockCodeTables();
            var expectedFilter = "ProgramType = 'PriceModel2'";
            DiscountFulfillmentService.GetOrdersRequest capturedRequest = null;

            _discountFulfillmentService
                .Setup(s => s.GetOrders(It.IsAny<DiscountFulfillmentService.GetOrdersRequest>()))
                .Callback<DiscountFulfillmentService.GetOrdersRequest>(req => capturedRequest = req)
                .ReturnsAsync(new DiscountFulfillmentService.GetOrdersResponse
                {
                    ResponseStatus = DiscountFulfillmentService.ResponseStatus.Success,
                    Orders = Array.Empty<DiscountFulfillmentService.Order>()
                });

            // Act
            await _orchestrator.GetNewOrders(OrderType.Snapshot2Only, null, null);

            // Assert
            Assert.NotNull(capturedRequest);
            Assert.Equal(expectedFilter, capturedRequest.Filter);
        }

        [Fact]
        public async Task GetNewOrders_WithSnapshot3Only_AppliesCorrectFilter()
        {
            // Arrange
            SetupMockCodeTables();
            var expectedFilter = "ProgramType in ('PriceModel3', 'PriceModel4')";
            DiscountFulfillmentService.GetOrdersRequest capturedRequest = null;

            _discountFulfillmentService
                .Setup(s => s.GetOrders(It.IsAny<DiscountFulfillmentService.GetOrdersRequest>()))
                .Callback<DiscountFulfillmentService.GetOrdersRequest>(req => capturedRequest = req)
                .ReturnsAsync(new DiscountFulfillmentService.GetOrdersResponse
                {
                    ResponseStatus = DiscountFulfillmentService.ResponseStatus.Success,
                    Orders = Array.Empty<DiscountFulfillmentService.Order>()
                });

            // Act
            await _orchestrator.GetNewOrders(OrderType.Snapshot3Only, null, null);

            // Assert
            Assert.NotNull(capturedRequest);
            Assert.Equal(expectedFilter, capturedRequest.Filter);
        }

        [Fact]
        public async Task GetNewOrders_WithOrderState_FiltersCorrectly()
        {
            // Arrange
            SetupMockCodeTables();
            DiscountFulfillmentService.GetOrdersRequest capturedRequest = null;

            _discountFulfillmentService
                .Setup(s => s.GetOrders(It.IsAny<DiscountFulfillmentService.GetOrdersRequest>()))
                .Callback<DiscountFulfillmentService.GetOrdersRequest>(req => capturedRequest = req)
                .ReturnsAsync(new DiscountFulfillmentService.GetOrdersResponse
                {
                    ResponseStatus = DiscountFulfillmentService.ResponseStatus.Success,
                    Orders = Array.Empty<DiscountFulfillmentService.Order>()
                });

            // Act
            await _orchestrator.GetNewOrders(OrderType.Snapshot1Only, "OH", null);

            // Assert
            Assert.NotNull(capturedRequest);
            Assert.Equal("OH", capturedRequest.State);
        }

        [Fact]
        public async Task GetNewOrders_WithOrderId_FiltersCorrectly()
        {
            // Arrange
            SetupMockCodeTables();
            DiscountFulfillmentService.GetOrdersRequest capturedRequest = null;

            _discountFulfillmentService
                .Setup(s => s.GetOrders(It.IsAny<DiscountFulfillmentService.GetOrdersRequest>()))
                .Callback<DiscountFulfillmentService.GetOrdersRequest>(req => capturedRequest = req)
                .ReturnsAsync(new DiscountFulfillmentService.GetOrdersResponse
                {
                    ResponseStatus = DiscountFulfillmentService.ResponseStatus.Success,
                    Orders = Array.Empty<DiscountFulfillmentService.Order>()
                });

            // Act
            await _orchestrator.GetNewOrders(OrderType.Snapshot1Only, null, "12345");

            // Assert
            Assert.NotNull(capturedRequest);
            Assert.Equal("12345", capturedRequest.OrderNumber);
        }

        [Fact]
        public async Task GetNewOrders_WithCommercialLinesHeavyTruck_SetsIsHeavyTruckFlag()
        {
            // Arrange
            SetupMockCodeTables();
            GetBusinessDeviceOrderByOrderStatusRequest capturedRequest = null;

            _clBusinessDeviceOrderService
                .Setup(s => s.GetBusinessDeviceOrderByOrderStatus(It.IsAny<GetBusinessDeviceOrderByOrderStatusRequest>()))
                .Callback<GetBusinessDeviceOrderByOrderStatusRequest>(req => capturedRequest = req)
                .ReturnsAsync(new GetBusinessDeviceOrderResponse
                {
                    ResponseStatus = CLBusinessDeviceOrderService.ResponseStatus.Success,
                    BusinessDeviceOrderList = Array.Empty<BusinessDeviceOrder>()
                });

            // Act
            await _orchestrator.GetNewOrders(OrderType.CommercialLinesHeavyTruck, null, null);

            // Assert
            Assert.NotNull(capturedRequest);
            Assert.True(capturedRequest.IsHeavyTruck);
        }

        [Fact]
        public async Task GetNewOrders_WithDiscountOrders_MapsVehiclesCorrectly()
        {
            // Arrange
            SetupMockCodeTables();
            var order = CreateMockDiscountOrder("OH", "12345", 2);

            _discountFulfillmentService
                .Setup(s => s.GetOrders(It.IsAny<DiscountFulfillmentService.GetOrdersRequest>()))
                .ReturnsAsync(new DiscountFulfillmentService.GetOrdersResponse
                {
                    ResponseStatus = DiscountFulfillmentService.ResponseStatus.Success,
                    Orders = new[] { order }
                });

            // Act
            var result = await _orchestrator.GetNewOrders(OrderType.Snapshot1Only, null, null);

            // Assert
            Assert.Single(result);
            var orderDetails = result.First();
            Assert.Equal(2, orderDetails.Vehicles.Count);
            Assert.Equal("2020", orderDetails.Vehicles[0].Year);
            Assert.Equal("Toyota", orderDetails.Vehicles[0].Make);
        }

        [Fact]
        public async Task GetNewOrders_WithCommercialLinesOrders_MapsVehiclesCorrectly()
        {
            // Arrange
            SetupMockCodeTables();
            var order = CreateMockCLBusinessOrder("OH", 12345, 2);

            _clBusinessDeviceOrderService
                .Setup(s => s.GetBusinessDeviceOrderByOrderStatus(It.IsAny<GetBusinessDeviceOrderByOrderStatusRequest>()))
                .ReturnsAsync(new GetBusinessDeviceOrderResponse
                {
                    ResponseStatus = CLBusinessDeviceOrderService.ResponseStatus.Success,
                    BusinessDeviceOrderList = new[] { order }
                });

            // Act
            var result = await _orchestrator.GetNewOrders(OrderType.CommercialLines, null, null);

            // Assert
            Assert.Single(result);
            var orderDetails = result.First();
            Assert.Equal(2, orderDetails.Vehicles.Count);
            Assert.Equal("2019", orderDetails.Vehicles[0].Year);
        }

        [Fact]
        public async Task GetNewOrders_WithCommercialLinesHeavyTruckCable_FiltersCorrectOrderType()
        {
            // Arrange
            SetupMockCodeTables();
            var heavyTruckCableOrder = CreateMockCLBusinessOrder("OH", 12345, 1, isHeavyTruck: true, hasCable: true, cableCount: 1);
            var heavyTruckNoCableOrder = CreateMockCLBusinessOrder("OH", 12346, 1, isHeavyTruck: true, hasCable: false, cableCount: 0);
            var regularOrder = CreateMockCLBusinessOrder("OH", 12347, 1, isHeavyTruck: false, hasCable: false, cableCount: 0);

            _clBusinessDeviceOrderService
                .Setup(s => s.GetBusinessDeviceOrderByOrderStatus(It.IsAny<GetBusinessDeviceOrderByOrderStatusRequest>()))
                .ReturnsAsync(new GetBusinessDeviceOrderResponse
                {
                    ResponseStatus = CLBusinessDeviceOrderService.ResponseStatus.Success,
                    BusinessDeviceOrderList = new[] { heavyTruckCableOrder }
                });

            // Act
            var result = await _orchestrator.GetNewOrders(OrderType.CommercialLinesHeavyTruckCable, null, null);

            // Assert
            Assert.Single(result); // Only heavy truck cable orders
            Assert.Equal(OrderType.CommercialLinesHeavyTruckCable, result.First().Type);
        }

        #endregion

        #region Helper Methods

        private void SetupMockCodeTables()
        {
            var codeTableData = new CodeTableData
            {
                XirgoVersions = new List<XirgoVersion>
                {
                    new XirgoVersion
                    {
                        Code = 19,
                        IsActive = true,
                        FeatureSetCode = 1,
                        DistributorDescription = "R",
                        NetworkCarrierCode = 1
                    },
                    new XirgoVersion
                    {
                        Code = 20,
                        IsActive = true,
                        FeatureSetCode = 2,
                        DistributorDescription = "X",
                        NetworkCarrierCode = 1
                    }
                },
                XirgoRules = new List<XirgoRule>
                {
                    new XirgoRule
                    {
                        Code = 10,
                        VersionCode = 25,
                        IsActive = true
                    }
                },
                Restricted2GZipCodes = new List<Restricted2GZipCode>()
            };

            _fulfillmentWebCodeTableManager
                .Setup(m => m.GetCodeTablesAsync())
                .ReturnsAsync(codeTableData);
        }

        private void SetupDiscountFulfillmentForNewOrders(int orderCount, int totalDevices)
        {
            var orders = new List<DiscountFulfillmentService.Order>();

            for (int i = 0; i < orderCount; i++)
            {
                // Distribute devices as evenly as possible
                int devicesForThisOrder = totalDevices / orderCount;
                if (i < (totalDevices % orderCount))
                {
                    devicesForThisOrder++; // Add remainder to first orders
                }
                orders.Add(CreateMockDiscountOrder("OH", $"ORD{i}", devicesForThisOrder));
            }

            _discountFulfillmentService
                .Setup(s => s.GetOrders(It.Is<DiscountFulfillmentService.GetOrdersRequest>(
                    req => req.Status == DiscountFulfillmentService.OrderStatus.New)))
                .ReturnsAsync(new DiscountFulfillmentService.GetOrdersResponse
                {
                    ResponseStatus = DiscountFulfillmentService.ResponseStatus.Success,
                    Orders = orders.ToArray()
                });
        }

        private void SetupDiscountFulfillmentForShippedOrders(int orderCount)
        {
            var orders = new List<DiscountFulfillmentService.Order>();
            for (int i = 0; i < orderCount; i++)
            {
                orders.Add(CreateMockDiscountOrder("OH", $"SHP{i}", 1));
            }

            _discountFulfillmentService
                .Setup(s => s.GetOrders(It.Is<DiscountFulfillmentService.GetOrdersRequest>(
                    req => req.Status == DiscountFulfillmentService.OrderStatus.Shipped)))
                .ReturnsAsync(new DiscountFulfillmentService.GetOrdersResponse
                {
                    ResponseStatus = DiscountFulfillmentService.ResponseStatus.Success,
                    Orders = orders.ToArray()
                });
        }

        private void SetupDiscountFulfillmentForNewOrdersByState(Dictionary<string, int> ordersByState)
        {
            var allOrders = new List<DiscountFulfillmentService.Order>();
            int orderId = 1;

            foreach (var kvp in ordersByState)
            {
                for (int i = 0; i < kvp.Value; i++)
                {
                    allOrders.Add(CreateMockDiscountOrder(kvp.Key, $"ORD{orderId++}", 2));
                }
            }

            _discountFulfillmentService
                .Setup(s => s.GetOrders(It.IsAny<DiscountFulfillmentService.GetOrdersRequest>()))
                .ReturnsAsync(new DiscountFulfillmentService.GetOrdersResponse
                {
                    ResponseStatus = DiscountFulfillmentService.ResponseStatus.Success,
                    Orders = allOrders.ToArray()
                });
        }

        private void SetupCLBusinessForNewOrders(int orderCount, int totalDevices, bool isHeavyTruck = false, int cableCount = 0)
        {
            var orders = new List<BusinessDeviceOrder>();

            for (int i = 0; i < orderCount; i++)
            {
                // Distribute devices as evenly as possible
                int devicesForThisOrder = totalDevices / orderCount;
                if (i < (totalDevices % orderCount))
                {
                    devicesForThisOrder++; // Add remainder to first orders
                }
                
                // For cable orders, determine if this order should have cable items
                bool hasCableForThisOrder = cableCount > 0 && i == 0; // Put all cables in first order for simplicity
                orders.Add(CreateMockCLBusinessOrder("OH", 10000 + i, devicesForThisOrder, isHeavyTruck, hasCableForThisOrder, cableCount));
            }

            _clBusinessDeviceOrderService
                .Setup(s => s.GetBusinessDeviceOrderByOrderStatus(It.Is<GetBusinessDeviceOrderByOrderStatusRequest>(
                    req => req.OrderStatus == 1)))
                .ReturnsAsync(new GetBusinessDeviceOrderResponse
                {
                    ResponseStatus = CLBusinessDeviceOrderService.ResponseStatus.Success,
                    BusinessDeviceOrderList = orders.ToArray()
                });
        }

        private void SetupCLBusinessForShippedOrders(int orderCount, int cableCount = 0)
        {
            var orders = new List<BusinessDeviceOrder>();

            for (int i = 0; i < orderCount; i++)
            {
                bool hasCableForThisOrder = cableCount > 0 && i == 0;
                orders.Add(CreateMockCLBusinessOrder("OH", 20000 + i, 1, false, hasCableForThisOrder, cableCount));
            }

            _clBusinessDeviceOrderService
                .Setup(s => s.GetBusinessDeviceOrderByOrderStatus(It.Is<GetBusinessDeviceOrderByOrderStatusRequest>(
                    req => req.OrderStatus == 3)))
                .ReturnsAsync(new GetBusinessDeviceOrderResponse
                {
                    ResponseStatus = CLBusinessDeviceOrderService.ResponseStatus.Success,
                    BusinessDeviceOrderList = orders.ToArray()
                });
        }

        private void SetupCLBusinessForOldAndNewOrders(string state, int oldOrders, int newOrders)
        {
            var orders = new List<BusinessDeviceOrder>();
            var oldDate = DateTime.Now.AddDays(-15); // Old orders
            var newDate = DateTime.Now.AddDays(-1); // Recent orders

            for (int i = 0; i < oldOrders; i++)
            {
                var order = CreateMockCLBusinessOrder(state, 30000 + i, 1);
                order.DeviceOrder.CreateDateTime = oldDate;
                orders.Add(order);
            }

            for (int i = 0; i < newOrders; i++)
            {
                var order = CreateMockCLBusinessOrder(state, 40000 + i, 1);
                order.DeviceOrder.CreateDateTime = newDate;
                orders.Add(order);
            }

            _clBusinessDeviceOrderService
                .Setup(s => s.GetBusinessDeviceOrderByOrderStatus(It.IsAny<GetBusinessDeviceOrderByOrderStatusRequest>()))
                .ReturnsAsync(new GetBusinessDeviceOrderResponse
                {
                    ResponseStatus = CLBusinessDeviceOrderService.ResponseStatus.Success,
                    BusinessDeviceOrderList = orders.ToArray()
                });
        }

        private DiscountFulfillmentService.Order CreateMockDiscountOrder(string state, string orderNumber, int vehicleCount)
        {
            var orderDetails = new List<DiscountFulfillmentService.OrderDetail>();
            for (int i = 0; i < vehicleCount; i++)
            {
                orderDetails.Add(new DiscountFulfillmentService.OrderDetail
                {
                    OrderDetailId = $"DET{i}",
                    VehicleYear = "2020",
                    VehicleMake = "Toyota",
                    VehicleModel = "Camry",
                    VehicleUsesCan = true,
                    ValidDeviceVersionsByCode = new[] { "19", "20" },
                    ValidDeviceVersionsByLetter = new[] { "R", "X" },
                    Message = ""
                });
            }

            return new DiscountFulfillmentService.Order
            {
                OrderNumber = orderNumber,
                State = state,
                Zip = "43215",
                PolicyNumber = "POL123456",
                ProductCode = "PA",
                RateRevision = "R1",
                ChannelIndicator = "A",
                InceptionDate = DateTime.Today,
                ExpirationDate = DateTime.Today.AddYears(1),
                ProgramType = "PriceModel1",
                ParticipationType = "Full",
                DevicesNeeded = vehicleCount,
                CreateDate = DateTime.Now.AddDays(-2),
                AudioVolumeValue = 50,
                ValidDeviceVersionsByCode = "19,20",
                ValidDeviceVersionsByLetter = "R,X",
                OrderDetails = orderDetails.ToArray()
            };
        }

        private BusinessDeviceOrder CreateMockCLBusinessOrder(string state, int orderId, int vehicleCount, bool isHeavyTruck = false, bool hasCable = false, int cableCount = 0)
        {
            var deviceDetails = new List<BusinessDeviceOrderDetail>();
            
            // If this order has cables, create the specified number of cable order details
            int cableItemsToCreate = hasCable ? cableCount : 0;
            int regularItemsToCreate = hasCable ? vehicleCount - cableItemsToCreate : vehicleCount;
            
            // Create cable items first
            for (int i = 0; i < cableItemsToCreate; i++)
            {
                deviceDetails.Add(new BusinessDeviceOrderDetail
                {
                    Vehicle = new CLBusinessDeviceOrderService.Vehicle
                    {
                        Year = 2019,
                        Make = "Ford",
                        Model = "F-150",
                        CableType = "OBDII"
                    },
                    DeviceOrderDetail = new DeviceOrderDetail
                    {
                        DeviceOrderDetailSeqID = 1000 + i,
                        IsCableOrderInd = true
                    },
                    Message = "",
                    DeviceVersionDescriptor = "X"
                });
            }
            
            // Create regular (non-cable) items
            for (int i = 0; i < regularItemsToCreate; i++)
            {
                deviceDetails.Add(new BusinessDeviceOrderDetail
                {
                    Vehicle = new CLBusinessDeviceOrderService.Vehicle
                    {
                        Year = 2019,
                        Make = "Ford",
                        Model = "F-150",
                        CableType = ""
                    },
                    DeviceOrderDetail = new DeviceOrderDetail
                    {
                        DeviceOrderDetailSeqID = 2000 + i,
                        IsCableOrderInd = false
                    },
                    Message = "",
                    DeviceVersionDescriptor = "X"
                });
            }

            return new BusinessDeviceOrder
            {
                DeviceOrder = new CLBusinessDeviceOrderService.DeviceOrder
                {
                    DeviceOrderSeqID = orderId,
                    CreateDateTime = DateTime.Now.AddDays(-1),
                    IsHeavyTruck = isHeavyTruck
                },
                Policy = new CLBusinessDeviceOrderService.Policy
                {
                    State = state,
                    ZipCode = "43215"
                },
                DeviceOrderDetails = deviceDetails.ToArray()
            };
        }

        #endregion
    }
}
