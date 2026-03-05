using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Kerberos.NET.Entities;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.Device;
using Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;
using Progressive.Telematics.Labs.Services;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Database.Models.DeviceOrder;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.CodeTableManager;
using Progressive.Telematics.Labs.Shared.Utils;
using WCFBusinessDeviceOrderService;
using WCFDeviceOrderService;
using WCFDeviceOrderSummaryService;
using WcfUserManagementService;

namespace Progressive.Telematics.Labs.Business.Orchestrators.Fulfillment;

[SingletonService]

public interface IDeviceFulfillmentOrchestrator
{
    Task<OrderDetailsModel> AssignDevicesToOrder(MyScoreVehicle myScoreVehicle, OrderDetailsModel orderDetails);
    Task<OrderDetailsModel> GetOrderDetails(OrderDetailsModel orderDetails);
    Task<OrdersList> GetOrdersByStatusCommand(OrdersList orderList);
    Task<OrdersList> GetPendingOrderList();
    Task<int> GetProcessedOrderCount();
    Task<CompletedOrdersList> GetCompletedOrderList();
    Task<List<LabelPrinter>> GetLabelPrinters();
}
public class DeviceFulfillmentOrchestrator : IDeviceFulfillmentOrchestrator
{
    private readonly IWCFDeviceOrderService _wCFDeviceOrderService;
    private readonly IWCFBusinessDeviceOrderService _wCFBusinessDeviceOrderService;
    private readonly IHomeBaseCodeTableManager _homeBaseCodeTableManager;
    private readonly IWCFDeviceOrderSummaryService _wCFDeviceOrderSummaryService;
    private readonly IUserManagementService _userManagementService;
    private readonly IDeviceOrderDAL _deviceOrderDAL;
    private readonly IConfigSettings _configSettings;
    private readonly ILabelPrinterDAL _labelPrinterDAL;
    private readonly ILogger<DeviceFulfillmentOrchestrator> _logger;

    public DeviceFulfillmentOrchestrator(
        IWCFDeviceOrderService wCFDeviceOrderService,
        IWCFBusinessDeviceOrderService wCFBusinessDeviceOrderService,
        IHomeBaseCodeTableManager homeBaseCodeTableManager,
        IWCFDeviceOrderSummaryService wCFDeviceOrderSummaryService,
        IUserManagementService userManagementService,
        IDeviceOrderDAL deviceOrderDAL,
        IConfigSettings configSettings,
        ILabelPrinterDAL labelPrinterDAL,
        ILogger<DeviceFulfillmentOrchestrator> logger)
    {
        _wCFDeviceOrderService = wCFDeviceOrderService;
        _wCFBusinessDeviceOrderService = wCFBusinessDeviceOrderService;
        _homeBaseCodeTableManager = homeBaseCodeTableManager;
        _wCFDeviceOrderSummaryService = wCFDeviceOrderSummaryService;
        _userManagementService = userManagementService;
        _deviceOrderDAL = deviceOrderDAL;
        _configSettings = configSettings;
        _labelPrinterDAL = labelPrinterDAL;
        _logger = logger;
    }

    public async Task<OrderDetailsModel> AssignDevicesToOrder(MyScoreVehicle myScoreVehicle, OrderDetailsModel orderDetails)
    {
        var vehicle = orderDetails.Vehicles.FirstOrDefault(x => x.DeviceOrderDetailSeqID == myScoreVehicle.DeviceOrderDetailSeqID);

        var fulfillDeviceOrderRequest = new FulfillDeviceOrderRequest { DeviceOrderSeqID = orderDetails.DeviceOrderSeqID };
        var deviceOrderDetailList = new List<WCFDeviceOrderService.BusinessDeviceOrderDetail>();
        var deviceOrderDetail = new WCFDeviceOrderService.BusinessDeviceOrderDetail { DeviceAvailable = false, DeviceSerialNbr = vehicle.NewDeviceSerialNumber };

        var od = new WCFDeviceOrderService.DeviceOrderDetail();
        deviceOrderDetail.DeviceOrderDetail = od;
        deviceOrderDetail.DeviceOrderDetail.DeviceOrderDetailSeqID = vehicle.DeviceOrderDetailSeqID;
        deviceOrderDetail.DeviceOrderDetail.DeviceOrderSeqID = orderDetails.DeviceOrderSeqID;

        var part = new WCFDeviceOrderService.Participant();
        deviceOrderDetail.Participant = part;
        deviceOrderDetail.Participant.ParticipantSeqID = vehicle.ParticipantSeqID;
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
                    var vehicle2 = orderDetails.Vehicles.Find(veh => veh.DeviceOrderDetailSeqID == businessOrderDetail.DeviceOrderDetail.DeviceOrderDetailSeqID);
                    if (!businessOrderDetail.DeviceAvailable)
                        vehicle2.Message = businessOrderDetail.Message;
                }
                break;
            default:
                var errMessage = string.Format("Unresolved response error from DeviceOrderService. [DeviceOrderSeqID] = {0} [FulfillDeviceOrderResponse: ] = {1}",
                                               orderDetails.DeviceOrderSeqID, fulfillDeviceOrderResponse.ResponseStatus);
                throw new ApplicationException(errMessage);
        }
        return orderDetails;

    }
    public async Task<OrderDetailsModel> GetOrderDetails(OrderDetailsModel orderDetails)
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
                foreach (var veh in order.DeviceOrderDetails.Select(od => new MyScoreVehicle
                {
                    DeviceOrderDetailSeqID = od.DeviceOrderDetail.DeviceOrderDetailSeqID,
                    Year = od.Vehicle.Year == 0 ? "unknown" : od.Vehicle.Year.ToString(),
                    Make = od.Vehicle.Make,
                    Model = od.Vehicle.Model,
                    ParticipantSeqID = od.Participant.ParticipantSeqID
                }))
                {
                    orderDetails.Vehicles.Add(veh);
                }
            }
        }
        else
        {
            var errMessage = string.Format("Unresolved response error from BusinessDeviceOrderService. [DeviceOrderSeqID] = {0} [ResponseStatus: ] = {1}",
                                           orderDetails.DeviceOrderSeqID, deviceOrderResponse.ResponseStatus);
            throw new ApplicationException(errMessage);
        }

        // Load code tables dataset (this triggers lazy loading from cache or WCF service)
        try
        {
            var dataset = _homeBaseCodeTableManager.TypedDataSet;
            if (dataset != null && dataset.Tables.Contains("DeviceSpec"))
            {
                var deviceSpecTable = dataset.Tables["DeviceSpec"];
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
        catch
        {
            // If code table loading fails (e.g., WCF security issue), use empty list
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
            var errMessage = string.Format("Failure on DeviceOrderSummaryService GetByStatus. [DeviceOrderStatusCode = {0}]",
                                       orderList.DeviceOrderStatusCode);
            throw new ApplicationException(errMessage);
        }

        //get list of customers from keys
        var uids = deviceOrderSummaryResponse.DeviceOrderSummaryList.Select(s => s.ParticipantGroupExternalKey).Distinct().ToArray();

        if (uids.Length == 0)
        {
            orderList.DeviceOrders = new List<Resources.Resources.FulFillment.DeviceOrder>();
            orderList.NumberOfOrders = 0;
            orderList.NumberOfDevices = 0;
            return orderList;
        }

        var resp = await _userManagementService.GetUsersByUIDs(uids);
        if (resp.ResponseStatus != WcfUserManagementService.ResponseStatus.Success)
        {
            var errMessage = string.Format("Failure on UserManagementService GetUsersByUIDs. [DeviceOrderStatusCode = {0}]", orderList.DeviceOrderStatusCode);
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
        orderList.NumberOfDevices = orderList.DeviceOrders.Sum(o => o.NbrDevicesNeeded);

        return orderList;
    }

    public async Task<OrdersList> GetPendingOrderList()
    {
        try
        {
            var dbOrders = (await _deviceOrderDAL.GetFulfillmentOrdersByStatus(new[] { 1, 2 })).ToList();
            if (dbOrders.Count == 0)
            {
                return new OrdersList
                {
                    NumberOfOrders = 0,
                    NumberOfDevices = 0,
                    DeviceOrders = new List<Resources.Resources.FulFillment.DeviceOrder>()
                };
            }

            var userLookup = await GetUsersByExternalKeysAsync(
                dbOrders.Select(o => o.ParticipantGroupExternalKey));

            var allOrders = dbOrders.Select(o =>
            {
                var state = userLookup.TryGetValue(o.ParticipantGroupExternalKey, out var user)
                    ? (user.State ?? "").Trim()
                    : "";

                return new Resources.Resources.FulFillment.DeviceOrder
                {
                    DeviceOrderSeqID = o.DeviceOrderSeqID,
                    OrderNumber = o.DeviceOrderSeqID.ToString(),
                    OrderDate = o.CreateDateTime,
                    State = state,
                    NbrDevicesNeeded = o.DeviceDetailCount,
                    DeviceType = ExtractDeviceType(o.XirgoVersionDescriptions),
                    SnapshotVersion = ResolveSnapshotVersion(o.SnapshotVersionCode),
                    DeviceOrderStatusDescription = o.StatusDescription
                };
            })
            .OrderBy(o => o.OrderDate)
            .ToList();

            return new OrdersList
            {
                NumberOfOrders = allOrders.Count,
                NumberOfDevices = allOrders.Sum(o => o.NbrDevicesNeeded),
                DeviceOrders = allOrders
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

    private static Resources.Resources.FulFillment.DeviceOrder BuildDeviceOrder(
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

        return new Resources.Resources.FulFillment.DeviceOrder
        {
            DeviceOrderSeqID = summary.DeviceOrderSeqID,
            OrderNumber = summary.DeviceOrderSeqID.ToString(),
            OrderDate = orderDate,
            State = (user.State ?? "").Trim(),
            NbrDevicesNeeded = nbrDevicesNeeded,
            DeviceType = deviceType,
            SnapshotVersion = snapshotVersion,
            DeviceOrderStatusDescription = statusDescription,
            Name = (user.LastName ?? "").Trim(),
            Email = (user.Email ?? "").Trim()
        };
    }

    private static string GetStatusDescription(int statusCode)
    {
        return statusCode switch
        {
            1 => "Pending Assignment",
            2 => "Ready to Print",
            _ => "Unknown"
        };
    }

    public async Task<CompletedOrdersList> GetCompletedOrderList()
    {
        try
        {
            var dbOrders = (await _deviceOrderDAL.GetFulfillmentOrdersByStatus(new[] { 3 })).ToList();
            if (dbOrders.Count == 0)
            {
                return new CompletedOrdersList
                {
                    Orders = new List<CompletedDeviceOrder>(),
                    TotalCount = 0,
                    ProcessedByUsers = new List<ProcessedByUser>()
                };
            }

            var userLookup = await GetUsersByExternalKeysAsync(
                dbOrders.Select(o => o.ParticipantGroupExternalKey));

            var processedByLookup = await BuildProcessedByLookupAsync(
                dbOrders.Select(o => o.FulfilledByUserID));

            var orders = dbOrders.Select(o =>
            {
                var state = userLookup.TryGetValue(o.ParticipantGroupExternalKey, out var user)
                    ? (user.State ?? "").Trim()
                    : "";

                var processedByUserID = o.FulfilledByUserID ?? "";
                var processedBy = processedByLookup.TryGetValue(processedByUserID, out var displayName)
                    ? displayName
                    : processedByUserID;

                var deviceSerialNumbers = string.IsNullOrEmpty(o.DeviceSerialNumbers)
                    ? new List<string>()
                    : o.DeviceSerialNumbers.Split(',').Where(s => !string.IsNullOrEmpty(s)).ToList();

                return new CompletedDeviceOrder
                {
                    DeviceOrderSeqID = o.DeviceOrderSeqID,
                    OrderNumber = o.DeviceOrderSeqID.ToString(),
                    ProcessedDateTime = o.ProcessedDateTime,
                    ShipDateTime = o.ShipDateTime,
                    ProcessedBy = processedBy,
                    ProcessedByUserID = processedByUserID,
                    State = state,
                    DeviceCount = o.DeviceDetailCount,
                    DeviceSerialNumbers = deviceSerialNumbers
                };
            }).ToList();

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

    private async Task<Dictionary<string, WcfUserManagementService.User>> GetUsersByExternalKeysAsync(IEnumerable<string> keys)
    {
        var uids = keys.Where(key => !string.IsNullOrEmpty(key)).Distinct().ToArray();
        if (uids.Length == 0)
        {
            return new Dictionary<string, WcfUserManagementService.User>();
        }

        var userResp = await _userManagementService.GetUsersByUIDs(uids);
        if (userResp.ResponseStatus == WcfUserManagementService.ResponseStatus.Success)
        {
            return userResp.Users;
        }

        return new Dictionary<string, WcfUserManagementService.User>();
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

}
