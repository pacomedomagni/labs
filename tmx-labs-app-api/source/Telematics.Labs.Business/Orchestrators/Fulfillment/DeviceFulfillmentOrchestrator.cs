using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Mappers;
using Progressive.Telematics.Labs.Business.Resources.Domain.Fulfillment;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.Device;
using Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;
using Progressive.Telematics.Labs.Business.Services;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Database.Models.DeviceOrder;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Utils;
using WCFBusinessDeviceOrderService;
using WCFDeviceOrderService;
using WCFDeviceOrderSummaryService;
using WcfUserManagementService;
using WcfXirgoService;

namespace Progressive.Telematics.Labs.Business.Orchestrators.Fulfillment;



public static class DeviceOrderStatus
{
    public const int PendingAssignment = 1;
    public const int ReadyToPrint = 2;
    public const int Shipped = 3;
    public const int Canceled = 4;
}

[SingletonService]

public interface IDeviceFulfillmentOrchestrator
{
    Task<DeviceOrderInfo> AssignDevicesToOrder(OrderVehicle vehicle, DeviceOrderInfo orderDetails);
    Task<DeviceOrderInfo> GetOrderDetails(DeviceOrderInfo orderDetails);
    Task<OrdersList> GetOrdersByStatusCommand(OrdersList orderList);
    Task<OrdersList> GetPendingOrderList();
    Task<int> GetProcessedOrderCount();
    Task<CompletedOrdersList> GetCompletedOrderList();
    Task<AllOrdersList> GetAllOrdersList();
    Task<List<LabelPrinter>> GetLabelPrinters();
    Task<DeviceFulfillmentValidation> ValidateDeviceForFulfillment(ValidateDeviceForFulfillmentRequest request);
    Task<List<OrderVehicle>> GetDeviceOrderVehicles(int deviceOrderSeqId);
    Task<DeviceOrderInfo> GetPendingOrderByNumber(string orderNumber);
    Task<DeviceOrderInfo> GetCompletedOrderByNumber(string orderNumber);
    Task<List<DeviceOrderInfo>> GetOrderByEmail(string emailAddress);
    Task<DeviceOrderInfo> GetOrderByDeviceSerialNumber(string serialNumber); /// <summary>
                                                                             /// Saves device assignments (returns domain model for full separation pattern)
                                                                             /// </summary>
    Task<DeviceAssignmentResult> SaveDeviceAssignments(DeviceAssignmentCommand command);
}
public class DeviceFulfillmentOrchestrator : IDeviceFulfillmentOrchestrator
{
    private readonly IWCFDeviceOrderService _wCFDeviceOrderService;
    private readonly IWCFBusinessDeviceOrderService _wCFBusinessDeviceOrderService;
    private readonly ILabsMyScoreDeviceDAL _homeBaseDeviceDAL;
    private readonly IWCFDeviceOrderSummaryService _wCFDeviceOrderSummaryService;
    private readonly IUserManagementService _userManagementService;
    private readonly IDeviceOrderDAL _deviceOrderDAL;
    private readonly IDeviceOrderDetailDAL _deviceOrderDetailDAL;
    private readonly IXirgoDeviceService _xirgoDeviceService;
    private readonly IDeviceValidationService _deviceValidationService;
    private readonly ILabelPrinterDAL _labelPrinterDAL;
    private readonly ILogger<DeviceFulfillmentOrchestrator> _logger;

    public DeviceFulfillmentOrchestrator(
        IWCFDeviceOrderService wCFDeviceOrderService,
        IWCFBusinessDeviceOrderService wCFBusinessDeviceOrderService,
        ILabsMyScoreDeviceDAL homeBaseDeviceDAL,
        IWCFDeviceOrderSummaryService wCFDeviceOrderSummaryService,
        IUserManagementService userManagementService,
        IDeviceOrderDAL deviceOrderDAL,
        IDeviceOrderDetailDAL deviceOrderDetailDAL,
        IXirgoDeviceService xirgoDeviceService,
        IDeviceValidationService deviceValidationService,
        IConfigSettings configSettings,
        ILabelPrinterDAL labelPrinterDAL,
        ILogger<DeviceFulfillmentOrchestrator> logger)
    {
        _wCFDeviceOrderService = wCFDeviceOrderService;
        _wCFBusinessDeviceOrderService = wCFBusinessDeviceOrderService;
        _homeBaseDeviceDAL = homeBaseDeviceDAL;
        _wCFDeviceOrderSummaryService = wCFDeviceOrderSummaryService;
        _userManagementService = userManagementService;
        _deviceOrderDAL = deviceOrderDAL;
        _deviceOrderDetailDAL = deviceOrderDetailDAL;
        _xirgoDeviceService = xirgoDeviceService;
        _deviceValidationService = deviceValidationService;
        _labelPrinterDAL = labelPrinterDAL;
        _logger = logger;
    }

    public async Task<DeviceOrderInfo> AssignDevicesToOrder(OrderVehicle vehicle, DeviceOrderInfo orderDetails)
    {
        var newVehicle = orderDetails.Vehicles.FirstOrDefault(x => x.DeviceOrderDetailSeqId == vehicle.DeviceOrderDetailSeqId);

        var fulfillDeviceOrderRequest = new FulfillDeviceOrderRequest { DeviceOrderSeqID = orderDetails.DeviceOrderSeqID };
        var deviceOrderDetailList = new List<WCFDeviceOrderService.BusinessDeviceOrderDetail>();
        var deviceOrderDetail = new WCFDeviceOrderService.BusinessDeviceOrderDetail { DeviceAvailable = false, DeviceSerialNbr = newVehicle.DeviceSerialNumber
        };

        var od = new WCFDeviceOrderService.DeviceOrderDetail();
        deviceOrderDetail.DeviceOrderDetail = od;
        deviceOrderDetail.DeviceOrderDetail.DeviceOrderDetailSeqID = vehicle.DeviceOrderDetailSeqId;
        deviceOrderDetail.DeviceOrderDetail.DeviceOrderSeqID = orderDetails.DeviceOrderSeqID;

        var part = new WCFDeviceOrderService.Participant();
        deviceOrderDetail.Participant = part;
        deviceOrderDetail.Participant.ParticipantSeqID = vehicle.ParticipantSeqId;
        deviceOrderDetail.Participant.ParticipantGroupSeqID = orderDetails.ParticipantGroupSeqID;
        deviceOrderDetailList.Add(deviceOrderDetail);

        fulfillDeviceOrderRequest.BusinessDeviceOrderDetails = deviceOrderDetailList.ToArray();
        var fulfillDeviceOrderResponse = await _wCFDeviceOrderService.Fulfill(fulfillDeviceOrderRequest);

        switch (fulfillDeviceOrderResponse.ResponseStatus)
        {
            case WCFDeviceOrderService.ResponseStatus.Success:
                orderDetails.HasErrors = false;
                break;
            case WCFDeviceOrderService.ResponseStatus.SuccessWithWarning:
                orderDetails.HasErrors = true;
                foreach (var businessOrderDetail in fulfillDeviceOrderResponse.BusinessDeviceOrderDetails)
                {
                    var vehicle2 = orderDetails.Vehicles.Find(veh => veh.DeviceOrderDetailSeqId == businessOrderDetail.DeviceOrderDetail.DeviceOrderDetailSeqID);
                    if (!businessOrderDetail.DeviceAvailable)
                        vehicle2.Message = businessOrderDetail.Message;
                }
                break;
            default:
                var errMessage = $"Unresolved response error from DeviceOrderService. [DeviceOrderSeqID] = {orderDetails.DeviceOrderSeqID} [FulfillDeviceOrderResponse: ] = {fulfillDeviceOrderResponse.ResponseStatus}";
                throw new ApplicationException(errMessage);
        }
        return orderDetails;

    }

    public async Task<DeviceOrderInfo> GetOrderDetails(DeviceOrderInfo orderDetails)
    {
        var deviceOrderRequest = new GetBusinessDeviceOrderRequest
        {
            DeviceOrderSeqID = orderDetails.DeviceOrderSeqID
        };
        var deviceOrderResponse = await _wCFBusinessDeviceOrderService.GetBusinessDeviceOrder(deviceOrderRequest);
        if (deviceOrderResponse.ResponseStatus == WCFBusinessDeviceOrderService.ResponseStatus.Success)
        {
            foreach (var order in deviceOrderResponse.BusinessDeviceOrderList)
            {
                orderDetails.ParticipantGroupSeqID = order.DeviceOrder.ParticipantGroupSeqID;
                foreach (var veh in order.DeviceOrderDetails.Select(od => new OrderVehicle
                {
                    DeviceOrderDetailSeqId = od.DeviceOrderDetail.DeviceOrderDetailSeqID,
                    DeviceSeqID = od.DeviceOrderDetail.DeviceSeqID,
                    Year = od.Vehicle.Year,
                    Make = od.Vehicle.Make,
                    Model = od.Vehicle.Model,
                    ParticipantSeqId = od.DeviceOrderDetail.ParticipantSeqID
                }))
                {
                    orderDetails.Vehicles.Add(veh);
                }
            }
        }
        else
        {
            var errMessage = $"Unresolved response error from BusinessDeviceOrderService. [DeviceOrderSeqID] = {orderDetails.DeviceOrderSeqID} [ResponseStatus: ] = {deviceOrderResponse.ResponseStatus}";
            throw new ApplicationException(errMessage);
        }

        // Load device specs from database
        try
        {
            var deviceSpecTable = await _homeBaseDeviceDAL.GetDeviceSpecs();
            if (deviceSpecTable != null && deviceSpecTable.Rows.Count > 0)
            {
                orderDetails.DeviceTypes = deviceSpecTable.AsEnumerable()
                    .Select(row => new DeviceType
                    {
                        Code = row.Field<int>("Code"),
                        Description = row.Field<string>("Description")
                    }).ToList();
            }
            else
            {
                orderDetails.DeviceTypes = new List<DeviceType>();
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to load device specifications.");
            orderDetails.DeviceTypes = new List<DeviceType>();
        }

        orderDetails.MobileOSNames = new[] { "iOS", "Android" };
        return orderDetails;
    }

    public async Task<OrdersList> GetOrdersByStatusCommand(OrdersList orderList)
    {
        var deviceOrderSummaryRequest = new GetDeviceOrderSummaryByStatusRequest { DeviceOrderStatusCode = orderList.DeviceOrderStatusCode };

        if (orderList.CanOnlyViewOrdersForOwnGroup)
            deviceOrderSummaryRequest.ParticipantGroupTypeCode = orderList.ParticipantGroupTypeCode;

        var deviceOrderSummaryResponse = await _wCFDeviceOrderSummaryService.GetByStatus(deviceOrderSummaryRequest);
        if (deviceOrderSummaryResponse.ResponseStatus != WCFDeviceOrderSummaryService.ResponseStatus.Success)
        {
            var errMessage = $"Failure on DeviceOrderSummaryService GetByStatus. [DeviceOrderStatusCode = {orderList.DeviceOrderStatusCode}]";
            throw new ApplicationException(errMessage);
        }

        //get list of customers from keys
        var uids = deviceOrderSummaryResponse.DeviceOrderSummaryList.Select(s => s.ParticipantGroupExternalKey).Distinct().ToArray();

        if (uids.Length == 0)
        {
            orderList.DeviceOrders = new List<DeviceOrderInfo>();
            orderList.NumberOfOrders = 0;
            orderList.NumberOfDevices = 0;
            return orderList;
        }

        var resp = await _userManagementService.GetUsersByUIDs(uids);
        if (resp.ResponseStatus != WcfUserManagementService.ResponseStatus.Success)
        {
            var errMessage = $"Failure on UserManagementService GetUsersByUIDs. [DeviceOrderStatusCode = {orderList.DeviceOrderStatusCode}]";
            throw new ApplicationException(errMessage);
        }

        // Get detailed business device order data for enrichment (OrderDate, DeviceType, SnapshotVersion)
        var detailResponse = await _wCFBusinessDeviceOrderService.GetBusinessDeviceOrderByOrderStatus(
            new GetBusinessDeviceOrderByOrderStatusRequest { OrderStatus = orderList.DeviceOrderStatusCode });

        var detailLookup = new Dictionary<int, WCFBusinessDeviceOrderService.BusinessDeviceOrder>();
        if (detailResponse.ResponseStatus == WCFBusinessDeviceOrderService.ResponseStatus.Success)
        {
            detailLookup = detailResponse.BusinessDeviceOrderList
                .ToDictionary(b => b.DeviceOrder.DeviceOrderSeqID);
        }

        // Build the status description from status code
        var statusDescription = GetStatusDescription(orderList.DeviceOrderStatusCode);

        //populate model with user and detail info
        orderList.DeviceOrders = (from s in deviceOrderSummaryResponse.DeviceOrderSummaryList
                                  where resp.Users.ContainsKey(s.ParticipantGroupExternalKey)
                                  let u = resp.Users[s.ParticipantGroupExternalKey]
                                  let detail = detailLookup.ContainsKey(s.DeviceOrderSeqID) ? detailLookup[s.DeviceOrderSeqID] : null
                                  select BuildDeviceOrder(s, u, detail, statusDescription)).ToList();

        // Derive counts from the built orders (single source of truth)
        orderList.NumberOfOrders = orderList.DeviceOrders.Count;
        orderList.NumberOfDevices = orderList.DeviceOrders.Sum(o => o.DeviceCount);

        return orderList;
    }

    public async Task<OrdersList> GetPendingOrderList()
    {
        try
        {
            var orders = await GetOrdersWithDetailsAsync(
                new[] { DeviceOrderStatus.PendingAssignment, DeviceOrderStatus.ReadyToPrint },
                includeAddressFields: true,
                includeDeviceTypeAndVersion: true,
                includeProcessedByFields: false,
                orderByDate: true);

            return new OrdersList
            {
                NumberOfOrders = orders.Count,
                NumberOfDevices = orders.Sum(o => o.DeviceCount),
                DeviceOrders = orders
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(LoggingEvents.DeviceFulfillmentOrchestrator_GetPendingOrders_Error, ex,
                "Failed to get pending orders.");
            throw;
        }
    }

    public async Task<int> GetProcessedOrderCount()
    {
        return await _deviceOrderDAL.ProcessedOrderCount();
    }

    public async Task<List<LabelPrinter>> GetLabelPrinters()
    {
        var printers = await _labelPrinterDAL.GetLabelPrinters();
        return printers.ToList();
    }

    public async Task<DeviceOrderInfo> GetPendingOrderByNumber(string orderNumber)
    {
        var pendingOrders = await GetPendingOrderList();
        return pendingOrders.DeviceOrders.FirstOrDefault(o => o.OrderNumber == orderNumber);
    }

    public async Task<DeviceOrderInfo> GetCompletedOrderByNumber(string orderNumber)
    {
        var completedOrders = await GetCompletedOrderList();
        return completedOrders.Orders.FirstOrDefault(o => o.OrderNumber == orderNumber);
    }

    public async Task<List<DeviceOrderInfo>> GetOrderByEmail(string emailAddress)
    {
        if (string.IsNullOrWhiteSpace(emailAddress))
        {
            return new List<DeviceOrderInfo>();
        }

        var normalizedEmail = emailAddress.Trim();
        var allOrders = await GetAllOrdersList();
        return allOrders.Orders
            .Where(o => string.Equals(o.Email, normalizedEmail, StringComparison.OrdinalIgnoreCase))
            .ToList();
    }

    public async Task<DeviceOrderInfo> GetOrderByDeviceSerialNumber(string serialNumber)
    {
        if (string.IsNullOrWhiteSpace(serialNumber))
        {
            return null;
        }

        var normalizedSerialNumber = serialNumber.Trim();
        var allOrders = await GetAllOrdersList();
        return allOrders.Orders
            .FirstOrDefault(o => o.DeviceSerialNumbers != null &&
                o.DeviceSerialNumbers.Any(sn => string.Equals(sn, normalizedSerialNumber, StringComparison.OrdinalIgnoreCase)));
    }

    public async Task<CompletedOrdersList> GetCompletedOrderList()
    {
        try
        {
            var (orders, processedByLookup) = await GetOrdersWithProcessedByLookupAsync(
                new[] { DeviceOrderStatus.Shipped },
                includeAddressFields: true,
                includeDeviceTypeAndVersion: false,
                includeProcessedByFields: true,
                orderByDate: false);

            var processedByUsers = processedByLookup
                .Select(kvp => new ProcessedByUser { UserID = kvp.Key, DisplayName = kvp.Value })
                .OrderBy(u => u.DisplayName)
                .ToList();

            return new CompletedOrdersList
            {
                Orders = orders,
                TotalCount = orders.Count,
                ProcessedByUsers = processedByUsers
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(LoggingEvents.DeviceFulfillmentOrchestrator_GetCompletedOrders_Error, ex,
                "Failed to get completed orders.");
            throw;
        }
    }

    public async Task<AllOrdersList> GetAllOrdersList()
    {
        try
        {
            var orders = await GetOrdersWithDetailsAsync(
                new[] { DeviceOrderStatus.PendingAssignment, DeviceOrderStatus.ReadyToPrint, DeviceOrderStatus.Shipped },
                includeAddressFields: false,
                includeDeviceTypeAndVersion: false,
                includeProcessedByFields: true,
                orderByDate: false);

            return new AllOrdersList
            {
                Orders = orders,
                TotalCount = orders.Count
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(LoggingEvents.DeviceFulfillmentOrchestrator_GetCompletedOrders_Error, ex,
                "Failed to get completed orders.");
            throw;
        }
    }
    private async Task<List<FulfillmentOrderDataModel>> GetOrdersByStatusesAsync(params int[] statuses)
    {
        return (await _deviceOrderDAL.GetFulfillmentOrdersByStatus(statuses)).ToList();
    }

    private async Task<Dictionary<string, WcfUserManagementService.User>> GetUserLookupAsync(List<FulfillmentOrderDataModel> orders)
    {
        var externalKeys = orders
            .Select(o => o.ParticipantGroupExternalKey)
            .Where(key => !string.IsNullOrEmpty(key))            .Distinct()
            .ToArray();

        return await GetUsersByExternalKeysAsync(externalKeys);
    }

    private async Task<List<DeviceOrderInfo>> GetOrdersWithDetailsAsync(
        int[] statusCodes,
        bool includeAddressFields,
        bool includeDeviceTypeAndVersion,
        bool includeProcessedByFields,
        bool orderByDate)
    {
        var dbOrders = await GetOrdersByStatusesAsync(statusCodes);
        if (!dbOrders.Any())
        {
            return new List<DeviceOrderInfo>();
        }

        var userLookup = await GetUserLookupAsync(dbOrders);

        Dictionary<string, string> processedByLookup = null;
        if (includeProcessedByFields)
        {
            processedByLookup = await BuildProcessedByLookupAsync(dbOrders.Select(o => o.FulfilledByUserID));
        }

        var orders = dbOrders.Select(o => MapToDeviceOrderInfo(
            o,
            userLookup,
            processedByLookup,
            includeAddressFields,
            includeDeviceTypeAndVersion,
            includeProcessedByFields)).ToList();

        return orderByDate ? orders.OrderBy(o => o.OrderDate).ToList() : orders;
    }

    private async Task<(List<DeviceOrderInfo> orders, Dictionary<string, string> processedByLookup)> GetOrdersWithProcessedByLookupAsync(
        int[] statusCodes,
        bool includeAddressFields,
        bool includeDeviceTypeAndVersion,
        bool includeProcessedByFields,
        bool orderByDate)
    {
        var dbOrders = await GetOrdersByStatusesAsync(statusCodes);
        if (!dbOrders.Any())
        {
            return (new List<DeviceOrderInfo>(), new Dictionary<string, string>());
        }

        var userLookup = await GetUserLookupAsync(dbOrders);
        var processedByLookup = await BuildProcessedByLookupAsync(dbOrders.Select(o => o.FulfilledByUserID));

        var orders = dbOrders.Select(o => MapToDeviceOrderInfo(
            o,
            userLookup,
            processedByLookup,
            includeAddressFields,
            includeDeviceTypeAndVersion,
            includeProcessedByFields)).ToList();

        return (orderByDate ? orders.OrderBy(o => o.OrderDate).ToList() : orders, processedByLookup);
    }

    private static DeviceOrderInfo MapToDeviceOrderInfo(
        FulfillmentOrderDataModel dbOrder,
        Dictionary<string, WcfUserManagementService.User> userLookup,
        Dictionary<string, string> processedByLookup,
        bool includeAddressFields,
        bool includeDeviceTypeAndVersion,
        bool includeProcessedByFields)
    {
        var hasUser = userLookup.TryGetValue(dbOrder.ParticipantGroupExternalKey, out var user);

        var orderInfo = new DeviceOrderInfo
        {
            DeviceOrderSeqID = dbOrder.DeviceOrderSeqID,
            OrderNumber = dbOrder.DeviceOrderSeqID.ToString(),
            OrderDate = dbOrder.CreateDateTime,
            State = hasUser ? (user.State ?? "").Trim() : "",
            Email = hasUser ? (user.Email ?? "").Trim() : "",
            FirstName = hasUser ? (user.FirstName ?? "").Trim() : "",
            LastName = hasUser ? (user.LastName ?? "").Trim() : "",
            DeviceCount = dbOrder.DeviceDetailCount,
            DeviceSerialNumbers = string.IsNullOrWhiteSpace(dbOrder.DeviceSerialNumbers) 
                ? new List<string>() 
                : dbOrder.DeviceSerialNumbers.Split(',').Where(s => !string.IsNullOrEmpty(s)).ToList(),
            DeviceOrderStatusDescription = GetStatusDescription(dbOrder.DeviceOrderStatusCode)
        };

        if (includeAddressFields && hasUser)
        {
            orderInfo.AddressLine1 = (user.Address ?? "").Trim();
            orderInfo.City = (user.City ?? "").Trim();
            orderInfo.ZipCode = (user.Zip ?? "").Trim();
        }

        if (includeDeviceTypeAndVersion)
        {
            orderInfo.DeviceType = ExtractDeviceType(dbOrder.XirgoVersionDescriptions);
            orderInfo.SnapshotVersion = ResolveSnapshotVersion(dbOrder.SnapshotVersionCode);
        }

        if (includeProcessedByFields && processedByLookup != null)
        {
            var processedByUserID = dbOrder.FulfilledByUserID ?? "";
            orderInfo.ProcessedBy = processedByLookup.TryGetValue(processedByUserID, out var displayName)
                ? displayName
                : processedByUserID;
            orderInfo.ProcessedByUserID = processedByUserID;
            orderInfo.ProcessedDateTime = dbOrder.ProcessedDateTime;
            orderInfo.ShipDateTime = dbOrder.ShipDateTime;
        }

        return orderInfo;
    }

    
    private static DeviceOrderInfo BuildDeviceOrder(
        WCFDeviceOrderSummaryService.DeviceOrderSummary summary,
        WcfUserManagementService.User user,
        WCFBusinessDeviceOrderService.BusinessDeviceOrder detail,
        string statusDescription)
    {
        var deviceType = "";
        var snapshotVersion = "";
        var orderDate = DateTime.MinValue;
        var nbrDevicesNeeded = 0;

        if (detail != null)
        {
            orderDate = detail.DeviceOrder.CreateDateTime;
            nbrDevicesNeeded = detail.DeviceOrderDetails.Length;

            // Device type abbreviations from DeviceSerialNbr first character, with counts
            // e.g. "J(2), X(1)" per PBI spec
            var serialPrefixes = detail.DeviceOrderDetails
                .Where(d => !string.IsNullOrEmpty(d.DeviceSerialNbr))
                .Select(d => d.DeviceSerialNbr[0].ToString().ToUpper())
                .ToList();

            if (serialPrefixes.Any())
            {
                deviceType = string.Join(", ", serialPrefixes
                    .GroupBy(p => p)
                    .OrderBy(g => g.Key)
                    .Select(g => $"{g.Key}({g.Count()})"));
            }

            // Snapshot version from MobileSummarizerVersionCode on participants
            // Only assign a version when all participants in the order agree on the same recognized code
            var versionCodes = detail.DeviceOrderDetails
                .Select(d => d.Participant)
                .Where(p => p != null && p.MobileSummarizerVersionCode.HasValue)
                .Select(p => p.MobileSummarizerVersionCode.Value)
                .Distinct()
                .ToList();
            if (versionCodes.Count == 1)
            {
                snapshotVersion = SnapshotVersionMap.GetDescription(versionCodes[0]) ?? "";
            }
        }

        return new DeviceOrderInfo
        {
            DeviceOrderSeqID = summary.DeviceOrderSeqID,
            OrderNumber = summary.DeviceOrderSeqID.ToString(),
            OrderDate = orderDate,
            State = (user.State ?? "").Trim(),
            DeviceCount = nbrDevicesNeeded,
            DeviceType = deviceType,
            SnapshotVersion = snapshotVersion,
            DeviceOrderStatusDescription = statusDescription,
            LastName = (user.LastName ?? "").Trim(),
            FirstName = (user.FirstName ?? "").Trim(),
            Email = (user.Email ?? "").Trim()
        };
    }

    private static string GetStatusDescription(int statusCode)
    {
        return statusCode switch
        {
            DeviceOrderStatus.PendingAssignment => "Pending Assignment",
            DeviceOrderStatus.ReadyToPrint => "Ready to Print",
            DeviceOrderStatus.Shipped => "Shipped",
            DeviceOrderStatus.Canceled => "Canceled",
            _ => "Unknown"
        };
    }

    private async Task<Dictionary<string, WcfUserManagementService.User>> GetUsersByExternalKeysAsync(IEnumerable<string> keys)
    {
        var uids = keys.Where(key => !string.IsNullOrEmpty(key)).Distinct().ToArray();
        if (uids.Length == 0)
        {
            return new Dictionary<string, User>();
        }

        var userResp = await _userManagementService.GetUsersByUIDs(uids);
        if (userResp.ResponseStatus == WcfUserManagementService.ResponseStatus.Success)
        {
            return userResp.Users;
        }

        return new Dictionary<string, User>();
    }

    private async Task<Dictionary<string, string>> BuildProcessedByLookupAsync(IEnumerable<string> fulfilledByUserIds)
    {
        var userIds = fulfilledByUserIds
            .Where(id => !string.IsNullOrEmpty(id))
            .Distinct()
            .ToList();

        var processedByLookup = new Dictionary<string, string>();
        foreach (var userId in userIds)
        {
            processedByLookup[userId] = await ResolveUserDisplayNameAsync(userId);
        }

        return processedByLookup;
    }

    private async Task<string> ResolveUserDisplayNameAsync(string userId)
    {
        try
        {
            var userResponse = await _userManagementService.GetUserByUserName(userId);
            if (userResponse.ResponseStatus == WcfUserManagementService.ResponseStatus.Success && userResponse.User != null)
            {
                var u = userResponse.User;
                return $"{(u.LastName ?? "").Trim()}, {(u.FirstName ?? "").Trim()}";
            }
        }
        catch
        {
            return userId;
        }

        return userId;
    }

    /// <summary>
    /// Extracts device type letters from XirgoVersion descriptions.
    /// Each description is like "Wireless W", "Wireless X (Ocarina WX...)", etc.
    /// Extracts the first capital letter after "Wireless " and groups with counts.
    /// Returns e.g. "J(2), X(1)"
    /// </summary>
    private static string ExtractDeviceType(string xirgoVersionDescriptions)
    {
        if (string.IsNullOrEmpty(xirgoVersionDescriptions))
            return "";

        var descriptions = xirgoVersionDescriptions.Split(',');
        var letters = new List<string>();

        foreach (var desc in descriptions)
        {
            var trimmed = desc.Trim();
            var match = Regex.Match(trimmed, @"Wireless\s+([A-Z])");
            if (match.Success)
            {
                letters.Add(match.Groups[1].Value);
            }
        }

        if (letters.Count == 0)
            return "";

        return string.Join(", ", letters
            .GroupBy(l => l)
            .OrderBy(g => g.Key)
            .Select(g => $"{g.Key}({g.Count()})"));
    }

    /// <summary>
    /// Converts SnapshotVersionCode from the stored proc to a display string using SnapshotVersionMap.
    /// </summary>
    private static string ResolveSnapshotVersion(string snapshotVersionCode)
    {
        if (string.IsNullOrEmpty(snapshotVersionCode))
            return "";

        if (int.TryParse(snapshotVersionCode, out var code))
        {
            return SnapshotVersionMap.GetDescription(code) ?? "";
        }

        return "";
    }

    public async Task<DeviceFulfillmentValidation> ValidateDeviceForFulfillment(ValidateDeviceForFulfillmentRequest request)
    {
        return await _deviceValidationService.ValidateDeviceForFulfillment(request.DeviceSerialNumber);
    }

    public async Task<List<OrderVehicle>> GetDeviceOrderVehicles(int deviceOrderSeqId)
    {
        var vehicles = await _deviceOrderDAL.GetVehiclesByDeviceOrderSeqId(deviceOrderSeqId);
        return vehicles.ToList();
    }

    public async Task<DeviceAssignmentResult> SaveDeviceAssignments(DeviceAssignmentCommand command)
    {
        var result = new DeviceAssignmentResult
        {
            DeviceOrderSeqID = command.DeviceOrderSeqID,
            TotalVehicleCount = command?.Vehicles?.Count ?? 0
        };

        try
        {
            if (command?.Vehicles == null || command.Vehicles.Count == 0)
            {
                _logger.LogWarning(LoggingEvents.DeviceFulfillmentOrchestrator_SaveDeviceAssignments_Warning,
                    "SaveDeviceAssignmentsV2 called with no vehicles for order {DeviceOrderSeqID}", command?.DeviceOrderSeqID);
                result.Success = false;
                return result;
            }

            foreach (var vehicle in command.Vehicles)
            {
                var validation = await _deviceValidationService.ValidateDeviceForFulfillment(vehicle.DeviceSerialNumber);

                if (!validation.IsValid)
                {
                    result.DeviceErrors.Add(new DeviceAssignmentErrorInfo
                    {
                        DeviceSerialNumber = vehicle.DeviceSerialNumber,
                        ErrorType = DeviceAssignmentErrorCode.ValidationFailed,
                        ValidationResult = validation.ToDeviceValidationInfo()
                    });
                    continue;
                }

                var updateDeviceResponse = await _xirgoDeviceService.UpdateXirgoDevice(
                    vehicle.DeviceSerialNumber,
                    DeviceStatus.Assigned,
                    DeviceLocation.ShippedToCustomer,
                    true, true);

                if (updateDeviceResponse.ResponseStatus != WcfXirgoService.ResponseStatus.Success)
                {
                    result.DeviceErrors.Add(new DeviceAssignmentErrorInfo
                    {
                        DeviceSerialNumber = vehicle.DeviceSerialNumber,
                        ErrorType = DeviceAssignmentErrorCode.UpdateFailed,
                        ValidationResult = validation.ToDeviceValidationInfo()
                    });
                    continue;
                }

                var xirgoDeviceResponse = await _xirgoDeviceService.GetDeviceBySerialNumber(vehicle.DeviceSerialNumber);

                if (xirgoDeviceResponse.ResponseStatus != WcfXirgoService.ResponseStatus.Success || 
                    xirgoDeviceResponse.Device == null)
                {
                    result.DeviceErrors.Add(new DeviceAssignmentErrorInfo
                    {
                        DeviceSerialNumber = vehicle.DeviceSerialNumber,
                        ErrorType = DeviceAssignmentErrorCode.RetrievalFailed,
                        ValidationResult = validation.ToDeviceValidationInfo()
                    });
                    continue;
                }

                await _deviceOrderDetailDAL.UpdateDeviceOrderDetail(
                    vehicle.DeviceOrderDetailSeqID,
                    deviceSeqId: xirgoDeviceResponse.Device.DeviceSeqID);
            }

            // Only update order status if at least one device was successfully assigned
            if (result.DeviceErrors.Count < command.Vehicles.Count)
            {
                await _deviceOrderDAL.UpdateDeviceOrder(
                    command.DeviceOrderSeqID,
                    deviceOrderStatusCode: DeviceOrderStatus.ReadyToPrint,
                    fulfilledByUserId: command.FulfilledByUserID);
            }

            result.Success = result.DeviceErrors.Count == 0;
            
            if (result.DeviceErrors.Count > 0)
            {
                _logger.LogWarning(LoggingEvents.DeviceFulfillmentOrchestrator_SaveDeviceAssignments_PartialFailure,
                    "Partial failure assigning devices for order {DeviceOrderSeqID}. {SuccessCount} succeeded, {ErrorCount} failed",
                    command.DeviceOrderSeqID, 
                    command.Vehicles.Count - result.DeviceErrors.Count,
                    result.DeviceErrors.Count);
            }
            
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(LoggingEvents.DeviceFulfillmentOrchestrator_SaveDeviceAssignments_Error, ex,
                "Failed to save device assignments for order {DeviceOrderSeqID}", command.DeviceOrderSeqID);
            throw;
        }
    }

}

