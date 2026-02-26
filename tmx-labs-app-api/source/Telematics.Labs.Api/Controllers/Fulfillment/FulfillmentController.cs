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
}



/// <summary>
/// Request model for assigning devices to an order
/// </summary>
public class AssignDevicesRequest
{
    public MyScoreVehicle MyScoreVehicle { get; set; }
    public OrderDetailsModel OrderDetails { get; set; }
}
