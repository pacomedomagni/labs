using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CLBusinessDeviceOrderService;
using WcfShippingLabelService;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Services.Wcf;
using Constants = Progressive.Telematics.Labs.Shared.Constants;
using FulfillmentWeb.Shared.CodeTableManager;
using FulfillmentWeb.Shared.CodeTableManager.Models;
using Microsoft.Extensions.Configuration;

namespace Progressive.Telematics.Labs.Business.Orchestrators.Fulfillment;

[SingletonService]
public interface IOrderCountsOrchestrator
{
    Task<Orders> GetOrderCounts(Orders ordersModel);
    Task<OrdersByState> GetStateOrderCounts(OrdersByState ordersByState);
    Task<List<OrderDetails>> GetNewOrders(OrderType orderType, string orderState, string orderId);
}

public class OrderCountsOrchestrator : IOrderCountsOrchestrator
{
    private readonly IDiscountFulfillmentService _discountFulfillmentService;
    private readonly ICLBusinessDeviceOrderService _clBusinessDeviceOrderService;
    private readonly IFulfillmentWebCodeTableManager _fufillmentWebCodeTableManager;
    private readonly IConfiguration _configuration;
    private int _numberOfDaysForOldOrder;
    private List<OrderDetails> _newOrderList;

    private const int DEVICE_AUDIO_ON_VOLUME_LEVEL = 50;
    private const int HEAVY_TRUCK_RULE_CODE = 10;
    private const int COMMERCIAL_LINES_MIN_VERSION_CODE = 19;
    private const int FEATURE_SET_WX_IOT = 8;
    private const int FEATURE_SET_AWS_IOT = 9;

    public OrderCountsOrchestrator(
        IDiscountFulfillmentService discountFulfillmentService, 
        ICLBusinessDeviceOrderService cLBusinessDeviceOrderService, 
        IFulfillmentWebCodeTableManager fufillmentWebCodeTableManager,
        IConfiguration configuration)
    {
        _discountFulfillmentService = discountFulfillmentService;
        _clBusinessDeviceOrderService = cLBusinessDeviceOrderService;
        _fufillmentWebCodeTableManager = fufillmentWebCodeTableManager;
        _configuration = configuration;
    }

    public async Task<Orders> GetOrderCounts(Orders ordersModel)
    {
        OrdersByState byStateModel = new OrdersByState() { Type = ordersModel.Type };
        byStateModel = await GetStateOrderCounts(byStateModel);

        // Commercial Lines Device Orders
        if (ordersModel.Type == OrderType.CommercialLines || ordersModel.Type == OrderType.CommercialLinesHeavyTruck)
        {
            ordersModel.OpenCommercialLinesOrders = byStateModel.SearchResults.Sum(state => state.NumberOfOrders);
            ordersModel.CommercialLinesDevicesNeeded = byStateModel.SearchResults.Sum(state => state.NumberOfDevices);
            await GetCommercialLinesFulfilledOrderCount(ordersModel);
        }
        else if (ordersModel.Type == OrderType.CommercialLinesHeavyTruckCable)
        {
            ordersModel.OpenCommercialLinesOrders = byStateModel.SearchResults.Sum(state => state.NumberOfOrders);
            ordersModel.CommercialLinesDevicesNeeded = byStateModel.SearchResults.Sum(state => state.NumberOfDevices);
            await GetCommercialLinesHeavyTruckCableFulfilledOrderCount(ordersModel);
        }
        else
        {
            ordersModel.OpenSnapshotOrders = byStateModel.SearchResults.Sum(state => state.NumberOfOrders);
            ordersModel.SnapshotDevicesNeeded = byStateModel.SearchResults.Sum(state => state.NumberOfDevices);
            await GetSnapshotFulfilledOrderCount(ordersModel);
        }
        return ordersModel;
    }

    private async Task GetSnapshotFulfilledOrderCount(Orders model)
    {
        CodeTableData ds = await _fufillmentWebCodeTableManager.GetCodeTablesAsync();

        // We need to inspect all processed orders for today to see if filter applies
        DiscountFulfillmentService.GetOrdersRequest getShippedRequest = new DiscountFulfillmentService.GetOrdersRequest()
        {
            Status = DiscountFulfillmentService.OrderStatus.Shipped,
            ProcessedStartDate = DateTime.Today,
            ProcessedEndDate = DateTime.Today.AddDays(1),
            ReturnOrderDetails = true
        };

        switch (model.Type)
        {
            case OrderType.Snapshot1Only:
                getShippedRequest.Filter = "ProgramType = 'PriceModel1'";
                break;
            case OrderType.Snapshot2Only:
                getShippedRequest.Filter = "ProgramType = 'PriceModel2'";
                break;
            case OrderType.Snapshot3Only:
                getShippedRequest.Filter = "ProgramType in ('PriceModel3', 'PriceModel4')";
                break;
        }

        DiscountFulfillmentService.GetOrdersResponse getShippedResponse = _discountFulfillmentService.GetOrders(getShippedRequest).GetAwaiter().GetResult(); 

        if (getShippedResponse.ResponseStatus == DiscountFulfillmentService.ResponseStatus.Success)
        {
            model.ProcessedSnapshotOrders = getShippedResponse.Orders.Count();
        }
    }

    private async Task GetCommercialLinesFulfilledOrderCount(Orders model)
    {
        GetBusinessDeviceOrderByOrderStatusRequest getOrdersRequest = new GetBusinessDeviceOrderByOrderStatusRequest();
        getOrdersRequest.OrderStatus = 3; // 3 = shipped orders
        getOrdersRequest.ShipDateFrom = DateTime.Today;
        getOrdersRequest.ShipDateTo = DateTime.Today.AddDays(1);
        GetBusinessDeviceOrderResponse getOrdersResponse = await _clBusinessDeviceOrderService.GetBusinessDeviceOrderByOrderStatus(getOrdersRequest);

        if (getOrdersResponse.ResponseStatus == CLBusinessDeviceOrderService.ResponseStatus.Success)
        {
            model.ProcessedCommercialLinesOrders = getOrdersResponse.BusinessDeviceOrderList.Count();
        }
    }
    private async Task GetCommercialLinesHeavyTruckCableFulfilledOrderCount(Orders model)
    {
        GetBusinessDeviceOrderByOrderStatusRequest getOrdersRequest = new GetBusinessDeviceOrderByOrderStatusRequest();
        getOrdersRequest.OrderStatus = 3; // 3 = shipped orders
        getOrdersRequest.ShipDateFrom = DateTime.Today;
        getOrdersRequest.ShipDateTo = DateTime.Today.AddDays(1);
        GetBusinessDeviceOrderResponse getOrdersResponse = await _clBusinessDeviceOrderService.GetBusinessDeviceOrderByOrderStatus(getOrdersRequest);

        if (getOrdersResponse.ResponseStatus == CLBusinessDeviceOrderService.ResponseStatus.Success)
        {
            model.ProcessedCommercialLinesOrders = getOrdersResponse.BusinessDeviceOrderList.SelectMany(b => b.DeviceOrderDetails).Count(detail => detail.DeviceOrderDetail.IsCableOrderInd);
        }
    }


    public async Task<OrdersByState> GetStateOrderCounts(OrdersByState ordersByState)
    {
        _numberOfDaysForOldOrder = Constants.FulfillmentConstants.NumberOfDaysForOldOrder;

        List<OrderDetails> newOrders = await GetNewOrders(ordersByState.Type, null, null);

        // Finally group orders by state
        foreach (var stateOrders in newOrders.GroupBy(order => order.OrderState).OrderBy(grp => grp.Key))
        {
            StateOrder so = new StateOrder()
            {
                State = stateOrders.Key,
                NumberOfOrders = stateOrders.Count(),
                NumberOfDevices = stateOrders.Sum(order => order.DevicesNeeded),
                OldestOrder = stateOrders.Min(order => order.OrderDate),
                NumberOfOldOrders = stateOrders.Count(order => (order.OrderDate < DateTime.Now.AddDays(-_numberOfDaysForOldOrder))),
                NumberDaysForOldOrders = _numberOfDaysForOldOrder
            };

            ordersByState.SearchResults.Add(so);
        }
        return ordersByState;

    }

    public async Task<List<OrderDetails>> GetNewOrders(OrderType orderType, string orderState, string orderId)
    {
        _newOrderList = new List<OrderDetails>();

        if (orderType == OrderType.CommercialLines || orderType == OrderType.CommercialLinesHeavyTruck
            || orderType == OrderType.CommercialLinesHeavyTruckCable)
        {
           await CommercialLinesGetOrders(orderType, orderState, orderId);
        }
        else
        {
            await DiscountGetOrders(orderType, orderState, orderId);
        }

        return _newOrderList;
    }

    private async Task DiscountGetOrders(OrderType orderType, string orderState, string orderId)
    {
        DiscountFulfillmentService.GetOrdersRequest getOrdersRequest = new DiscountFulfillmentService.GetOrdersRequest();
        getOrdersRequest.Status = DiscountFulfillmentService.OrderStatus.New;
        if (!string.IsNullOrEmpty(orderState))
            getOrdersRequest.State = orderState;
        if (!string.IsNullOrEmpty(orderId))
            getOrdersRequest.OrderNumber = orderId;
        getOrdersRequest.ReturnOrderDetails = true;

        switch (orderType)
        {
            case OrderType.Snapshot1Only:
                getOrdersRequest.Filter = "ProgramType = 'PriceModel1'";
                break;
            case OrderType.Snapshot2Only:
                getOrdersRequest.Filter = "ProgramType = 'PriceModel2'";
                break;
            case OrderType.Snapshot3Only:
                getOrdersRequest.Filter = "ProgramType in ('PriceModel3', 'PriceModel4')";
                break;
        }

        DiscountFulfillmentService.GetOrdersResponse getOrdersResponse = _discountFulfillmentService.GetOrders(getOrdersRequest).GetAwaiter().GetResult();

        if (getOrdersResponse.ResponseStatus == DiscountFulfillmentService.ResponseStatus.Success)
        {
            var orders = getOrdersResponse.Orders.ToList();

            // Process orders with async support
            var orderDetailsTasks = orders.Select(order => CreateOrderDetailsModel(order, orderType, OrderSourceType.Discount));
            var orderDetailsModels = await Task.WhenAll(orderDetailsTasks);
            _newOrderList.AddRange(orderDetailsModels);
        }
    }

    private async Task CommercialLinesGetOrders(OrderType orderType, string orderState, string orderId)
    {
        GetBusinessDeviceOrderResponse getOrdersResponse;

        if (!string.IsNullOrEmpty(orderId))
        {
            GetBusinessDeviceOrderRequest req = new GetBusinessDeviceOrderRequest();
            req.DeviceOrderSeqID = Convert.ToInt32(orderId);
            getOrdersResponse = await _clBusinessDeviceOrderService.GetBusinessDeviceOrder(req);
        }
        else
        {
            GetBusinessDeviceOrderByOrderStatusRequest getOrdersRequest = new GetBusinessDeviceOrderByOrderStatusRequest();
            getOrdersRequest.OrderStatus = 1; // 1 = new orders
            if (orderType == OrderType.CommercialLinesHeavyTruck || orderType == OrderType.CommercialLinesHeavyTruckCable)
            {
                getOrdersRequest.IsHeavyTruck = true;
            }
            getOrdersResponse = await _clBusinessDeviceOrderService.GetBusinessDeviceOrderByOrderStatus(getOrdersRequest);
        }

        if (getOrdersResponse.ResponseStatus == CLBusinessDeviceOrderService.ResponseStatus.Success)
        {
            if (!string.IsNullOrEmpty(orderState) && getOrdersResponse.BusinessDeviceOrderList != null && getOrdersResponse.BusinessDeviceOrderList.Length > 0)
            {
                getOrdersResponse.BusinessDeviceOrderList = getOrdersResponse.BusinessDeviceOrderList.Where(x => x.Policy.State == orderState).ToArray();
            }

            var orders = getOrdersResponse.BusinessDeviceOrderList.ToList();

            // Process orders with async support
            var orderDetailsTasks = orders.Select(order => CreateOrderDetailsModel(order, orderType, OrderSourceType.CommercialLines));
            var orderDetailsModels = await Task.WhenAll(orderDetailsTasks);
            _newOrderList.AddRange(orderDetailsModels);
        }

        // order by OrderDate to show oldest orders first, and also only show orders matching corresponding OrderType
        _newOrderList.OrderBy(x => x.OrderDate).Where(o => o.Type == orderType).ToList();
    }

    /// <summary>
    /// Simplified method to create OrderDetails from any order type (no longer async)
    /// </summary>
    private async Task<OrderDetails> CreateOrderDetailsModel(dynamic order, OrderType orderType, OrderSourceType sourceType)
    {
        // Use consolidated mapper to create the base order details model
        OrderDetails orderDetailsModel = MapOrderToOrderDetailsModel(order, orderType, sourceType);

        var orderDetails = ExtractOrderDetails(order, sourceType);

        // Map vehicles using consolidated method
        MapVehiclesToOrderDetailsModel(orderDetailsModel, orderDetails, sourceType);

        // Apply order-type-specific processing
        await ApplyOrderTypeSpecificProcessing(orderDetailsModel, sourceType);

        return orderDetailsModel;
    }

    /// <summary>
    /// Consolidated mapping method for all order types
    /// </summary>
    private OrderDetails MapOrderToOrderDetailsModel(dynamic order, OrderType orderType, OrderSourceType sourceType)
    {
        var orderDetailsModel = new OrderDetails
        {
            Type = orderType
        };

        // Map common properties based on source type
        switch (sourceType)
        {
            case OrderSourceType.Discount:
                MapDiscountSpecificProperties(orderDetailsModel, order);
                break;
            case OrderSourceType.CommercialLines:
                MapCommercialLinesSpecificProperties(orderDetailsModel, order);
                break;
        }

        return orderDetailsModel;
    }

    /// <summary>
    /// Maps discount-specific properties
    /// </summary>
    private void MapDiscountSpecificProperties(OrderDetails model, dynamic order)
    {
        model.OrderState = order.State.ToUpper();
        model.ZipCode = order.Zip;
        model.PolicyNumber = order.PolicyNumber;
        model.ProductCode = order.ProductCode;
        model.RateRevision = order.RateRevision;
        model.ChannelIndicator = order.ChannelIndicator;
        model.InceptionDate = order.InceptionDate;
        model.ExpirationDate = order.ExpirationDate;
        model.ProgramType = order.ProgramType;
        model.ParticipationType = order.ParticipationType;
        model.DevicesNeeded = order.DevicesNeeded;
        model.OrderDate = order.CreateDate;
        model.OrderId = order.OrderNumber.Trim();
        model.ValidDeviceVersionsByCode = order.ValidDeviceVersionsByCode;
        model.ValidDeviceVersionsByLetter = order.ValidDeviceVersionsByLetter;
        model.AudioOn = IsDeviceAudioEnabled(order.AudioVolumeValue);

        // Apply vehicle-count-based modifications
        if (order.OrderDetails != null)
        {
            model.ValidDeviceVersionsByLetter = ModifyValidDeviceByLettterByVehicleCount(model, (DiscountFulfillmentService.OrderDetail[])order.OrderDetails);
        }
    }
        
    /// <summary>
    /// Maps commercial lines-specific properties
    /// </summary>
    private static void MapCommercialLinesSpecificProperties(OrderDetails model, dynamic order)
    {
        model.OrderState = order.Policy.State;
        model.ZipCode = order.Policy.ZipCode;
        model.DevicesNeeded = order.DeviceOrderDetails.Length;
        model.OrderDate = order.DeviceOrder.CreateDateTime;
        model.OrderId = order.DeviceOrder.DeviceOrderSeqID.ToString();

        // Set order type based on heavy truck and cable indicators
        bool isHeavyTruck = order.DeviceOrder.IsHeavyTruck ?? false;
        bool hasCableOrder = ((BusinessDeviceOrderDetail[])order.DeviceOrderDetails)
            .Any(x => x?.DeviceOrderDetail?.IsCableOrderInd == true);

        if (isHeavyTruck && hasCableOrder)
        {
            model.Type = OrderType.CommercialLinesHeavyTruckCable;
        }
        else if (isHeavyTruck && !hasCableOrder)
        {
            model.Type = OrderType.CommercialLinesHeavyTruck;
        }
        else
        {
            model.Type = OrderType.CommercialLines;
        }
    }

    /// <summary>
    /// Consolidated vehicle mapping method
    /// </summary>
    private void MapVehiclesToOrderDetailsModel(OrderDetails orderDetailsModel, dynamic orderDetails, OrderSourceType sourceType)
    {
        if (orderDetailsModel == null)
            throw new ArgumentNullException(nameof(orderDetailsModel), "OrderDetailsModel cannot be null");

        if (orderDetails == null)
            return; // Allow null/empty order details

        foreach (dynamic od in orderDetails)
        {
            if (od == null) continue; // Skip null entries

            var vehicle = CreateSnapshotVehicle(od, sourceType);
            if (vehicle != null)
            {
                // Apply source-specific processing
                if (sourceType == OrderSourceType.Discount)
                {
                    vehicle = ParseVehicleLevelValidDeviceVersionsByLetter(vehicle, od);
                }

                orderDetailsModel.Vehicles.Add(vehicle);
            }
        }
    }

    /// <summary>
    /// Creates a SnapshotVehicle from order detail based on source type
    /// </summary>
    private static SnapshotVehicle CreateSnapshotVehicle(dynamic od, OrderSourceType sourceType)
    {
        SnapshotVehicle vehicle = new SnapshotVehicle();

        switch (sourceType)
        {
            case OrderSourceType.Discount:
                vehicle.Year = od.VehicleYear;
                vehicle.Make = od.VehicleMake;
                vehicle.Model = od.VehicleModel;
                vehicle.Message = od.Message ?? string.Empty;
                vehicle.DetailID = od.OrderDetailId ?? string.Empty;
                vehicle.VehicleUsesCan = od.VehicleUsesCan;
                var validDeviceVersions = od.ValidDeviceVersionsByCode as string[];
                if (validDeviceVersions != null && validDeviceVersions.Length != 0)
                {
                   vehicle.ValidDeviceVersionsByCode = string.Join(",", validDeviceVersions.Where(code => !string.IsNullOrWhiteSpace(code)));
                }
                break;

            case OrderSourceType.CommercialLines:
                if (od?.Vehicle == null || od.DeviceOrderDetail == null)
                    return null; // Skip invalid entries

                vehicle.Year = od.Vehicle.Year.ToString();
                vehicle.Make = od.Vehicle.Make;
                vehicle.Model = od.Vehicle.Model;
                vehicle.Message = od.Message ?? string.Empty;
                vehicle.DetailID = od.DeviceOrderDetail.DeviceOrderDetailSeqID.ToString();
                vehicle.CableType = string.IsNullOrWhiteSpace(od.Vehicle.CableType) ? string.Empty : od.Vehicle.CableType.Trim();
                vehicle.VehicleUsesCan = od.Vehicle.Year > 2007;
                vehicle.DeviceVersionDescriptor = od.DeviceVersionDescriptor ?? string.Empty;
                break;
        }

        return vehicle;
    }

    /// <summary>
    /// Extracts order details array from an order based on source type
    /// </summary>
    private static dynamic ExtractOrderDetails(dynamic order, OrderSourceType sourceType)
    {
        switch (sourceType)
        {
            case OrderSourceType.Discount:
                return order.OrderDetails;
            case OrderSourceType.CommercialLines:
                return order.DeviceOrderDetails;
            default:
                return null;
        }
    }

    /// <summary>
    /// Applies order-type-specific processing after mapping
    /// </summary>
    private async Task ApplyOrderTypeSpecificProcessing(OrderDetails orderDetailsModel, OrderSourceType sourceType)
    {
        await CommercialGetValidDevicesVersions(orderDetailsModel);
    }

    /// <summary>
    /// Determines if device audio is enabled based on the audio volume value.
    /// Audio is considered "on" when volume is set to the specific threshold value.
    /// </summary>
    private static bool IsDeviceAudioEnabled(int? audioVolumeValue)
    {
        return audioVolumeValue.HasValue && audioVolumeValue.Value == DEVICE_AUDIO_ON_VOLUME_LEVEL;
    }

    /// <summary>
    /// Determines the insurance type based on the order source type
    /// </summary>
    private static InsuranceType DetermineInsuranceType(OrderSourceType sourceType)
    {
        switch (sourceType)
        {
            case OrderSourceType.CommercialLines:
                return InsuranceType.CommercialLines;
            case OrderSourceType.Discount:
            default:
                return InsuranceType.PersonalLines;
        }
    }

  
    /// <summary>
    /// Applies network carrier restrictions to the device version list based on ZIP code
    /// </summary>
    /// <param name="validDeviceVersionList">The list of device versions to filter</param>
    /// <param name="zipCode">The ZIP code to check for restrictions</param>
    /// <param name="ds">The fulfillment code table dataset</param>
    private void ApplyNetworkCarrierRestrictions(List<XirgoVersion> validDeviceVersionList,
                                                string zipCode, CodeTableData ds)
    {
        if (string.IsNullOrWhiteSpace(zipCode) || ds?.Restricted2GZipCodes == null)
            return;

        // Check for ATT-only restriction
        var hasAttRestriction = ds.Restricted2GZipCodes
            .Any(z => z.ZipCode == zipCode && z.NetworkCarrierCode == (int)NetworkCarrier.ATT);

        if (hasAttRestriction)
        {
            validDeviceVersionList.RemoveAll(x => x.NetworkCarrierCode != (int)NetworkCarrier.ATT);
        }
    }

    /// <summary>
    /// Builds the device version strings for the order details model
    /// </summary>
    /// <param name="orderDetailsModel">The order details model to populate</param>
    /// <param name="validDeviceVersionList">The list of valid device versions</param>
    private void BuildDeviceVersionStrings(OrderDetails orderDetailsModel,
                                          List<XirgoVersion> validDeviceVersionList)
    {
        if (!validDeviceVersionList.Any())
        {
            //LoggerUtility.LogWarning(nameof(GetNewOrdersCommand), "No valid device versions found after filtering");
            return;
        }

        var sortedDeviceVersions = validDeviceVersionList.OrderBy(x => x.Code).ToList();
        var versionCodes = new StringBuilder();
        var versionLetters = new StringBuilder();

        foreach (var deviceVersion in sortedDeviceVersions)
        {
            // Build version codes string
            versionCodes.Append($"{deviceVersion.Code},");

            // Build version letters string  
            var distributorDesc = deviceVersion.DistributorDescription;
            versionLetters.Append($"{distributorDesc},");

            // Add supplementary 'S' version when 'R' version is present
            // This is a known business rule for device distributor compatibility
            if (distributorDesc == DistributorVersion.R.ToString())
            {
                versionLetters.Append($"{DistributorVersion.S},");
            }
        }

        orderDetailsModel.ValidDeviceVersionsByCode = versionCodes.ToString();
        orderDetailsModel.ValidDeviceVersionsByLetter = versionLetters.ToString();
    }

    private async Task CommercialGetValidDevicesVersions(OrderDetails orderDetailsModel)
    {
        CodeTableData ds = await _fufillmentWebCodeTableManager.GetCodeTablesAsync();
        IEnumerable<XirgoVersion> versionRows = null;
        var heavyTruckVersionCodes = ds.XirgoRules
            .Where(x => x.Code == HEAVY_TRUCK_RULE_CODE && x.IsActive)
            .Select(x => x.VersionCode);

        if (orderDetailsModel.Type == OrderType.CommercialLinesHeavyTruck)
        {
            versionRows = ds.XirgoVersions
                .Where(x => x.IsActive && heavyTruckVersionCodes.Contains(x.Code));
        }
        else
        {
            if (orderDetailsModel.Vehicles.Any(v => !v.VehicleUsesCan))
            {
                versionRows = ds.XirgoVersions
                    .Where(x => x.Code >= COMMERCIAL_LINES_MIN_VERSION_CODE && 
                           x.FeatureSetCode != FEATURE_SET_WX_IOT && 
                           x.IsActive && 
                           !heavyTruckVersionCodes.Contains(x.Code));
            }
            else
            {
                versionRows = ds.XirgoVersions
                    .Where(x => x.Code >= COMMERCIAL_LINES_MIN_VERSION_CODE && 
                           x.IsActive && 
                           !heavyTruckVersionCodes.Contains(x.Code));
            }

            string iotDeviceQueueStatus = _configuration["AppSettings:IotDeviceQueueStatus"] ?? "";

            if (string.IsNullOrWhiteSpace(iotDeviceQueueStatus) || iotDeviceQueueStatus == "Disabled")
            {
                versionRows = ds.XirgoVersions
                    .Where(x => x.Code >= COMMERCIAL_LINES_MIN_VERSION_CODE && 
                           x.FeatureSetCode != FEATURE_SET_WX_IOT && 
                           x.FeatureSetCode != FEATURE_SET_AWS_IOT &&
                           x.IsActive && 
                           !heavyTruckVersionCodes.Contains(x.Code));
            }
        }

        versionRows = versionRows.OrderBy(x => x.Code);

        foreach (var r in versionRows)
        {
            orderDetailsModel.ValidDeviceVersionsByCode += (r.Code.ToString() + ",");
            orderDetailsModel.ValidDeviceVersionsByLetter += (r.DistributorDescription + ",");
        }
    }

    private SnapshotVehicle ParseVehicleLevelValidDeviceVersionsByLetter(SnapshotVehicle vehicle, DiscountFulfillmentService.OrderDetail od)
    {
        if (od.ValidDeviceVersionsByLetter != null && od.ValidDeviceVersionsByLetter.Any())
        {
            if (od.VehicleUsesCan && od.ValidDeviceVersionsByLetter.Contains(DistributorVersion.X.ToString()))
            {
                od.ValidDeviceVersionsByLetter = od.ValidDeviceVersionsByLetter.Where(d => d != DistributorVersion.X.ToString()).ToArray();
                od.ValidDeviceVersionsByLetter = new[] { $"{DistributorVersion.X} (Preferred)" }.Concat(od.ValidDeviceVersionsByLetter).ToArray();
            }

            vehicle.ValidDeviceVersionsByLetter = string.Join(", ", od.ValidDeviceVersionsByLetter);
        }

        return vehicle;
    }

    private string ModifyValidDeviceByLettterByVehicleCount(OrderDetails model, DiscountFulfillmentService.OrderDetail[] orderDetails)
    {
        var canVehicles = orderDetails.Where(v => v.VehicleUsesCan);
        var preCanVehicles = orderDetails.Except(canVehicles);

        var sb = new StringBuilder();

        if (canVehicles != null && canVehicles.Any() && preCanVehicles != null && !preCanVehicles.Any())
        {
            sb.Append($"{string.Join(",", canVehicles.First().ValidDeviceVersionsByLetter)} ({canVehicles.Count()})");
            return sb.ToString();
        }
        else if (preCanVehicles != null && preCanVehicles.Any() && canVehicles != null && !canVehicles.Any())
        {
            sb.Append($"{string.Join(",", preCanVehicles.First().ValidDeviceVersionsByLetter)} ({preCanVehicles.Count()})");
            return sb.ToString();
        }
        else if (canVehicles != null && canVehicles.Any())
        {
            sb.Append($"{string.Join(",", preCanVehicles.First().ValidDeviceVersionsByLetter)} ({preCanVehicles.Count()})");
            sb.Append($"; {DistributorVersion.X} ({canVehicles.Count()})");
            return sb.ToString();
        }
        else
        {
            return model.ValidDeviceVersionsByLetter;
        }
    }

    private enum DistributorVersion
    {
        R, // Standard device version
        S, // Supplementary version that gets added when R is present
        X  // CAN-enabled device version (preferred for compatible vehicles)
    }
    
    private enum NetworkCarrier
    {
        ATT = 1,
    }
    
    private enum OrderSourceType
    {
        Discount,
        CommercialLines
    }
}
