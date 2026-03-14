using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Labs.Business.Orchestrators.Fulfillment;
using Progressive.Telematics.Labs.Business.Resources.Resources.Device;
using Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;

namespace Progressive.Telematics.Labs.Api.Controllers.Fulfillment;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class FulfillmentController : ControllerBase
{
    private readonly IDeviceFulfillmentOrchestrator _orchestrator;

    public FulfillmentController(IDeviceFulfillmentOrchestrator orchestrator)
    {
        _orchestrator = orchestrator;
    }

    /// <summary>
    /// Assigns devices to an order
    /// </summary>
    /// <param name="request">Request containing vehicle and order details</param>
    /// <returns>Updated order details</returns>
    [HttpPost("AssignDevices")]
    public async Task<ActionResult<OrderDetailsModel>> AssignDevicesToOrder([FromBody] AssignDevicesRequest request)
    {
        if (request == null)
            return BadRequest("Request body is required");

        if (request.MyScoreVehicle == null)
            return BadRequest("MyScoreVehicle is required");

        if (request.OrderDetails == null)
            return BadRequest("OrderDetails is required");

        var result = await _orchestrator.AssignDevicesToOrder(request.MyScoreVehicle, request.OrderDetails);
        return Ok(result);
    }

    /// <summary>
    /// Gets order details by device order sequence ID
    /// </summary>
    /// <param name="deviceOrderSeqID">The device order sequence ID</param>
    /// <returns>Order details</returns>
    [HttpGet("OrderDetails/{deviceOrderSeqID}")]
    public async Task<ActionResult<OrderDetailsModel>> GetOrderDetails([FromRoute] int deviceOrderSeqID)
    {
        if (deviceOrderSeqID <= 0)
            return BadRequest("DeviceOrderSeqID must be greater than 0");

        var orderDetails = new OrderDetailsModel { DeviceOrderSeqID = deviceOrderSeqID };
        var result = await _orchestrator.GetOrderDetails(orderDetails);
        return Ok(result);
    }

    /// <summary>
    /// Gets orders by status code
    /// </summary>
    /// <param name="deviceOrderStatusCode">The device order status code</param>
    /// <param name="participantGroupTypeCode">Optional participant group type code</param>
    /// <param name="canOnlyViewOrdersForOwnGroup">Whether user can only view orders for their own group</param>
    /// <returns>List of orders matching the status</returns>
    [HttpGet("OrdersByStatus")]
    public async Task<ActionResult<OrdersList>> GetOrdersByStatusCommand(
        [FromQuery] int deviceOrderStatusCode,
        [FromQuery] int? participantGroupTypeCode = null,
        [FromQuery] bool canOnlyViewOrdersForOwnGroup = false)
    {
        var orderList = new OrdersList
        {
            DeviceOrderStatusCode = deviceOrderStatusCode,
            ParticipantGroupTypeCode = participantGroupTypeCode,
            CanOnlyViewOrdersForOwnGroup = canOnlyViewOrdersForOwnGroup
        };

        var result = await _orchestrator.GetOrdersByStatusCommand(orderList);
        return Ok(result);
    }

    /// <summary>
    /// Gets all pending orders with full details for the Pending Orders table
    /// </summary>
    /// <returns>List of pending orders with order number, date, state, device info, and status</returns>
    [HttpGet("PendingOrderList")]
    public async Task<ActionResult<OrdersList>> GetPendingOrderList()
    {
        var result = await _orchestrator.GetPendingOrderList();
        return Ok(result);
    }

    /// <summary>
    /// Gets the count of device orders processed today
    /// </summary>
    /// <returns>Count of processed orders</returns>
    [HttpGet("ProcessedOrderCount")]
    public async Task<ActionResult<int>> ProcessedOrderCount()
    {
        var result = await _orchestrator.GetProcessedOrderCount();
        return Ok(result);
    }

    /// <summary>
    /// Gets all completed (shipped) orders
    /// </summary>
    /// <returns>List of completed orders with processed-by user info</returns>
    [HttpGet("CompletedOrderList")]
    public async Task<ActionResult<CompletedOrdersList>> GetCompletedOrderList()
    {
        var result = await _orchestrator.GetCompletedOrderList();
        return Ok(result);
    }

    [HttpGet("GetLabelPrinters")]
    public async Task<ActionResult<List<LabelPrinter>>> GetLabelPrinters()
    {
        var result = await _orchestrator.GetLabelPrinters();
        return Ok(result);
    }

    /// <summary>
    /// Validates a device for fulfillment
    /// </summary>
    /// <param name="request">Request containing device serial number and optional order ID</param>
    /// <returns>Validation result indicating if device is valid and available</returns>
    [HttpPost("ValidateDevice")]
    public async Task<ActionResult<ValidateDeviceForFulfillmentResponse>> ValidateDeviceForFulfillment([FromBody] ValidateDeviceForFulfillmentRequest request)
    {
        if (request == null)
            return BadRequest("Request body is required");

        if (string.IsNullOrWhiteSpace(request.DeviceSerialNumber))
            return BadRequest("Device serial number is required");

        var result = await _orchestrator.ValidateDeviceForFulfillment(request);

        return Ok(result);
    }

    /// <summary>
    /// Gets vehicles for a device order
    /// </summary>
    /// <param name="deviceOrderSeqID">The device order sequence ID</param>
    /// <returns>List of vehicles associated with the order</returns>
    [HttpGet("GetDeviceOrderVehicles")]
    public async Task<ActionResult<List<OrderVehicle>>> GetDeviceOrderVehicles([FromQuery] int deviceOrderSeqID)
    {
        if (deviceOrderSeqID <= 0)
            return BadRequest("DeviceOrderSeqID must be greater than 0");

        var result = await _orchestrator.GetDeviceOrderVehicles(deviceOrderSeqID);
        return Ok(result);
    }

    /// <summary>
    /// Gets a pending order by order number
    /// </summary>
    /// <param name="orderNumber">The device order sequence ID to search for</param>
    /// <returns>Pending device order if found, otherwise null</returns>
    [HttpGet("GetPendingOrderByNumber")]
    public async Task<ActionResult<DeviceOrder>> GetPendingOrderByNumber([FromQuery] string orderNumber)
    {
        if (string.IsNullOrWhiteSpace(orderNumber))
            return BadRequest("Order number is required");

        var result = await _orchestrator.GetPendingOrderByNumber(orderNumber);

        if (result == null)
            return NotFound($"No pending order found with order number {orderNumber}");

        return Ok(result);
    }

    /// <summary>
    /// Gets a completed order by order number
    /// </summary>
    /// <param name="orderNumber">The device order sequence ID to search for</param>
    /// <returns>Completed device order if found, otherwise null</returns>
    [HttpGet("GetCompletedOrderByNumber")]
    public async Task<ActionResult<CompletedDeviceOrder>> GetCompletedOrderByNumber([FromQuery] string orderNumber)
    {
        if (string.IsNullOrWhiteSpace(orderNumber))
            return BadRequest("Order number is required");

        var result = await _orchestrator.GetCompletedOrderByNumber(orderNumber);

        if (result == null)
            return NotFound($"No completed order found with order number {orderNumber}");

        return Ok(result);
    }

    /// <summary>
    /// Gets orders by customer email address
    /// </summary>
    /// <param name="emailAddress">The email address to search for</param>
    /// <returns>List of device orders if found, otherwise empty list</returns>
    [HttpGet("GetOrderByEmail")]
    public async Task<ActionResult<List<DeviceOrder>>> GetOrderByEmail([FromQuery] string emailAddress)
    {
        if (string.IsNullOrWhiteSpace(emailAddress))
            return BadRequest("Email address is required");

        var result = await _orchestrator.GetOrderByEmail(emailAddress);

        if (result == null || result.Count == 0)
            return NotFound($"No pending order found for email address '{emailAddress}'");

        return Ok(result);
    }

    /// <summary>
    /// Gets an order by device serial number
    /// </summary>
    /// <param name="serialNumber">The device serial number to search for</param>
    /// <returns>Device order if found, otherwise null</returns>
    [HttpGet("GetOrderByDeviceSerialNumber")]
    public async Task<ActionResult<DeviceOrder>> GetOrderByDeviceSerialNumber([FromQuery] string serialNumber)
    {
        if (string.IsNullOrWhiteSpace(serialNumber))
            return BadRequest("Device serial number is required");

        var result = await _orchestrator.GetOrderByDeviceSerialNumber(serialNumber);

        if (result == null)
            return NotFound($"No pending order found containing device serial number '{serialNumber}'");

        return Ok(result);
    }

    /// <summary>
    /// Confirms device assignment for an order
    /// </summary>
    /// <param name="request">Request containing device order ID and vehicle/device assignments</param>
    /// <returns>Confirmation result with any errors</returns>
    [HttpPost("SaveDeviceAssignments")]
    public async Task<ActionResult<ConfirmDeviceAssignmentResponse>> SaveDeviceAssignments([FromBody] ConfirmDeviceAssignmentRequest request)
    {
        if (request == null)
            return BadRequest("Request body is required");

        if (request.DeviceOrderSeqID <= 0)
            return BadRequest("DeviceOrderSeqID must be greater than 0");

        if (request.Vehicles == null || request.Vehicles.Count == 0)
            return BadRequest("At least one vehicle assignment is required");

        var result = await _orchestrator.SaveDeviceAssignments(request);
        return Ok(result);
    }
}

/// <summary>
/// Request model for assigning devices to an order
/// </summary>
public class AssignDevicesRequest
{
    public MyScoreVehicle MyScoreVehicle { get; set; }
    public OrderDetailsModel OrderDetails { get; set; }
}
