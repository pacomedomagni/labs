using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Labs.Api.Mappers;
using Progressive.Telematics.Labs.Api.RequestModels.Fulfillment;
using Progressive.Telematics.Labs.Api.ResponseModels.Fulfillment;
using Progressive.Telematics.Labs.Business.Orchestrators.Fulfillment;
using Progressive.Telematics.Labs.Business.Resources.Domain.Fulfillment;
using Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;

namespace Progressive.Telematics.Labs.Api.Controllers.Fulfillment;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class FulfillmentController : ControllerBase
{
    private readonly IDeviceFulfillmentOrchestrator _orchestrator;
    private readonly IPrintLabelOrchestrator _printLabelOrchestrator;

    public FulfillmentController(IDeviceFulfillmentOrchestrator orchestrator, IPrintLabelOrchestrator printLabelOrchestrator)
    {
        _orchestrator = orchestrator;
        _printLabelOrchestrator = printLabelOrchestrator;
    }

    /// <summary>
    /// Assigns devices to an order
    /// </summary>
    /// <param name="request">Request containing vehicle and order details</param>
    /// <returns>Updated order details</returns>
    [HttpPost("AssignDevices")]
    public async Task<ActionResult<DeviceOrderInfo>> AssignDevicesToOrder([FromBody] AssignDevicesRequest request)
    {
        if (request == null)
            return BadRequest("Request body is required");

        if (request.Vehicle == null)
            return BadRequest("Vehicle is required");

        if (request.OrderDetails == null)
            return BadRequest("OrderDetails is required");

        var result = await _orchestrator.AssignDevicesToOrder(request.Vehicle, request.OrderDetails);
        return Ok(result);
    }

    /// <summary>
    /// Gets order details by device order sequence ID
    /// </summary>
    /// <param name="deviceOrderSeqID">The device order sequence ID</param>
    /// <returns>Order details</returns>
    [HttpGet("OrderDetails/{deviceOrderSeqID}")]
    public async Task<ActionResult<DeviceOrderInfo>> GetOrderDetails([FromRoute] int deviceOrderSeqID)
    {
        if (deviceOrderSeqID <= 0)
            return BadRequest("DeviceOrderSeqID must be greater than 0");

        var orderDetails = new DeviceOrderInfo { DeviceOrderSeqID = deviceOrderSeqID };
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
    public async Task<ActionResult<DeviceFulfillmentValidation>> ValidateDeviceForFulfillment([FromBody] ValidateDeviceForFulfillmentRequest request)
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
    public async Task<ActionResult<DeviceOrderInfo>> GetPendingOrderByNumber([FromQuery] string orderNumber)
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
    public async Task<ActionResult<DeviceOrderInfo>> GetCompletedOrderByNumber([FromQuery] string orderNumber)
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
    public async Task<ActionResult<List<DeviceOrderInfo>>> GetOrderByEmail([FromQuery] string emailAddress)
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
    public async Task<ActionResult<DeviceOrderInfo>> GetOrderByDeviceSerialNumber([FromQuery] string serialNumber)
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
    public async Task<ActionResult<SaveDeviceAssignmentsResponse>> SaveDeviceAssignments([FromBody] SaveDeviceAssignmentsRequest request)
    {
        if (request == null)
            return BadRequest("Request body is required");

        if (request.DeviceOrderSeqID <= 0)
            return BadRequest("DeviceOrderSeqID must be greater than 0");

        if (request.Vehicles == null || request.Vehicles.Count == 0)
            return BadRequest("At least one vehicle assignment is required");

        // Map API request to domain model
        var command = request.ToDeviceAssignmentCommand();

        // Call orchestrator with domain model
        var domainResult = await _orchestrator.SaveDeviceAssignments(command);

        // Map domain result to API response
        var response = domainResult.ToSaveDeviceAssignmentsResponse();

        return response.Status switch
        {
            Business.Resources.Enums.OperationStatus.Success => Ok(response),
            Business.Resources.Enums.OperationStatus.SuccessWithErrors => StatusCode(207, response), // Multi-Status
            _ => BadRequest(response) // Failure
        };
    }

    /// <summary>
    /// Creates a label and sends it to the specified printer
    /// </summary>
    /// <param name="printer">The printer name to send the label to</param>
    /// <param name="order">The order details to create the label for</param>
    /// <returns>Success status</returns>
    [HttpPost("PrintLabel")]
    public async Task<ActionResult<bool>> PrintLabel([FromQuery] string printer, [FromBody] DeviceOrderInfo order)
    {
        if (string.IsNullOrWhiteSpace(printer))
            return BadRequest("Printer is required");

        if (order == null)
            return BadRequest("Order is required");

        if (string.IsNullOrWhiteSpace(order.OrderNumber))
            return BadRequest("Order number is required");

        try
        {
            var result = await _printLabelOrchestrator.CrateLabelAndPrint(printer, order);
            return Ok(result);
        }
        catch (InvalidOperationException ex) when (IsAddressError(ex))
        {
            return BadRequest(new
            {
                error = "InvalidAddress",
                message = ex.Message,
                orderNumber = order.OrderNumber,
                printer
            });
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("printer", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                error = "PrinterError",
                message = ex.Message,
                orderNumber = order.OrderNumber,
                printer
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                error = "LabelGenerationFailed",
                message = ex.Message,
                orderNumber = order.OrderNumber,
                printer
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                error = "InternalServerError",
                message = "An unexpected error occurred while printing the label. Please try again or contact support.",
                orderNumber = order.OrderNumber,
                printer
            });
        }
    }

    /// <summary>
    /// Downloads a label as a ZPL file for the specified order
    /// </summary>
    /// <param name="order">The order to create the label for</param>
    /// <returns>ZPL label file</returns>
    [HttpPost("DownloadLabel")]
    public async Task<IActionResult> DownloadLabel([FromBody] DeviceOrderInfo order)
    {
        if (order == null)
            return BadRequest("Order is required");

        if (string.IsNullOrWhiteSpace(order.OrderNumber))
            return BadRequest("Order number is required");

        try
        {
            var (content, fileName) = await _printLabelOrchestrator.DownloadLabel(order);
            return File(content, "text/plain", fileName);
        }
        catch (InvalidOperationException ex) when (IsAddressError(ex))
        {
            return BadRequest(new
            {
                error = "InvalidAddress",
                message = ex.Message,
                orderNumber = order.OrderNumber
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                error = "LabelGenerationFailed",
                message = ex.Message,
                orderNumber = order.OrderNumber
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                error = "InternalServerError",
                message = "An unexpected error occurred while generating the label. Please try again or contact support.",
                orderNumber = order.OrderNumber
            });
        }
    }

    private static bool IsAddressError(InvalidOperationException ex)
    {
        if (ex?.Message == null)
            return false;

        return ex.Message.Contains("Address Error", StringComparison.OrdinalIgnoreCase) ||
               ex.Message.Contains("Invalid address", StringComparison.OrdinalIgnoreCase) ||
               ex.Message.Contains("Unable to validate address", StringComparison.OrdinalIgnoreCase);
    }
}

/// <summary>
/// Request model for assigning devices to an order
/// </summary>
public class AssignDevicesRequest
{
    public OrderVehicle Vehicle { get; set; }
    public DeviceOrderInfo OrderDetails { get; set; }
}
