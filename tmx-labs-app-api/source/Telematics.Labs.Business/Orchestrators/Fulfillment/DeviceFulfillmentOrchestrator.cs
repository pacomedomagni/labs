using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Kerberos.NET.Entities;
using Progressive.Telematics.Labs.Business.Resources.Resources.Device;
using Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.CodeTableManager;
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
}
public class DeviceFulfillmentOrchestrator : IDeviceFulfillmentOrchestrator
{
    private readonly IWCFDeviceOrderService _wCFDeviceOrderService;
    private readonly IWCFBusinessDeviceOrderService _wCFBusinessDeviceOrderService;
    private readonly IHomeBaseCodeTableManager _homeBaseCodeTableManager;
    private readonly IWCFDeviceOrderSummaryService _wCFDeviceOrderSummaryService;
    private readonly IUserManagementService _userManagementService;
    private readonly IDeviceOrderDAL _deviceOrderDAL;


    public DeviceFulfillmentOrchestrator(IWCFDeviceOrderService wCFDeviceOrderService, IWCFBusinessDeviceOrderService wCFBusinessDeviceOrderService, IHomeBaseCodeTableManager homeBaseCodeTableManager, IWCFDeviceOrderSummaryService wCFDeviceOrderSummaryService, IUserManagementService userManagementService, IDeviceOrderDAL deviceOrderDAL)
    {
        _wCFDeviceOrderService = wCFDeviceOrderService;
        _wCFBusinessDeviceOrderService = wCFBusinessDeviceOrderService;
        _homeBaseCodeTableManager = homeBaseCodeTableManager;
        _wCFDeviceOrderSummaryService = wCFDeviceOrderSummaryService;
        _userManagementService = userManagementService;
        _deviceOrderDAL = deviceOrderDAL;
    }

    public async Task<OrderDetailsModel> AssignDevicesToOrder(MyScoreVehicle myScoreVehicle, OrderDetailsModel orderDetails) {
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
    public async Task<OrderDetailsModel> GetOrderDetails(OrderDetailsModel orderDetails) {
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
        if (deviceOrderSummaryResponse.ResponseStatus == WCFDeviceOrderSummaryService.ResponseStatus.Success)
        {
            orderList.NumberOfOrders = deviceOrderSummaryResponse.RecordCount;

            // Calculate total number of devices across all device orders
            orderList.NumberOfDevices = deviceOrderSummaryResponse.DeviceOrderSummaryList
                .Sum(s => s.DeviceOrderDetailCount);

            //get list of customers from keys
            var uids = deviceOrderSummaryResponse.DeviceOrderSummaryList.Select(s => s.ParticipantGroupExternalKey).Distinct().ToArray();

            var resp = await _userManagementService.GetUsersByUIDs(uids);
            if (resp.ResponseStatus != WcfUserManagementService.ResponseStatus.Success)
            {
                var errMessage = string.Format("Failure on UserManagementService GetUsersByUIDs. [DeviceOrderStatusCode = {0}]", orderList.DeviceOrderStatusCode);
                throw new ApplicationException(errMessage);
            }

            // TEMPORARY: Log missing ParticipantGroupExternalKey values for debugging
            var missingKeys = deviceOrderSummaryResponse.DeviceOrderSummaryList
                .Where(s => !resp.Users.ContainsKey(s.ParticipantGroupExternalKey))
                .Select(s => s.ParticipantGroupExternalKey)
                .ToList();

            if (missingKeys.Any())
            {
                Console.WriteLine($"WARNING: {missingKeys.Count} ParticipantGroupExternalKey(s) not found in Users dictionary:");
                foreach (var key in missingKeys)
                {
                    Console.WriteLine($"  - Missing Key: '{key}'");
                }
            }

            //populate model with user info
            orderList.DeviceOrders = (from s in deviceOrderSummaryResponse.DeviceOrderSummaryList
                                  where resp.Users.ContainsKey(s.ParticipantGroupExternalKey)
                                  let u = resp.Users[s.ParticipantGroupExternalKey]
                                  select new Resources.Resources.FulFillment.DeviceOrder
                                  {
                                      DeviceOrderSeqID = s.DeviceOrderSeqID,
                                      NbrDevicesNeeded = s.DeviceOrderDetailCount,
                                      Name = u.LastName,
                                      Email = u.Email
                                  }).ToList();
        }
        else
        {
            var errMessage = string.Format("Failure on DeviceOrderSummaryService GetByStatus. [DeviceOrderStatusCode = {0}]",
                                       orderList.DeviceOrderStatusCode);
            throw new ApplicationException(errMessage);
        }
        return orderList;
    }

    public async Task<OrdersList> GetPendingOrderList()
    {
        // Fetch all pending orders (status 1=New and 2=DevicesAssigned) from the database
        var newOrders = await _deviceOrderDAL.GetPendingOrderSummaries(1);
        var assignedOrders = await _deviceOrderDAL.GetPendingOrderSummaries(2);

        var allRows = newOrders.Concat(assignedOrders).ToList();

        var orderList = new OrdersList
        {
            NumberOfOrders = allRows.Count,
            NumberOfDevices = allRows.Sum(r => r.NbrDevicesNeeded),
            DeviceOrders = allRows.Select(r => new Resources.Resources.FulFillment.DeviceOrder
            {
                DeviceOrderSeqID = r.DeviceOrderSeqID,
                OrderNumber = r.OrderNumber,
                OrderDate = r.OrderDate,
                State = r.State,
                NbrDevicesNeeded = r.NbrDevicesNeeded,
                DeviceType = r.DeviceType,
                SnapshotVersion = r.SnapshotVersion,
                DeviceOrderStatusDescription = r.DeviceOrderStatusCode == 1 ? "Pending Assignment" : "Ready to Print",
                Name = r.Name,
                Email = r.Email
            }).OrderBy(o => o.OrderDate).ToList()
        };

        return orderList;
    }

    public async Task<int> GetProcessedOrderCount()
    {
        return await _deviceOrderDAL.ProcessedOrderCount();
    }

}
