using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Labs.Business.Orchestrators.Fulfillment;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Api.Controllers.Fulfillment
{
    /// <summary>
    /// Controller for managing order fulfillment operations including order counts, 
    /// state-level order counts, and new order retrieval for various order types
    /// (Snapshot, Commercial Lines, Commercial Lines Heavy Truck).
    /// </summary>
    [Route("api/Fulfillment")]
    public class FulfillmentController : TelematicsController<IOrderCountsOrchestrator>
    {
        /// <summary>
        /// Gets order counts for a specific order type.
        /// Includes totals for open orders, devices needed, and processed/fulfilled orders.
        /// </summary>
        /// <param name="ordersModel">The orders model containing the order type and other filter criteria</param>
        /// <returns>Orders object with count information populated</returns>
        /// <response code="200">Returns the order counts successfully</response>
        [HttpPost("OrderCounts")]
        [ProducesResponseType(typeof(Orders), StatusCodes.Status200OK)]
        public async Task<Orders> GetOrderCounts([FromBody][Required] Orders ordersModel)
        {
            return await Orchestrator.GetOrderCounts(ordersModel);
        }

        /// <summary>
        /// Gets order counts grouped by state for a specific order type.
        /// Provides detailed breakdown by state including number of orders, devices needed,
        /// oldest order date, and count of old orders.
        /// </summary>
        /// <param name="ordersByState">The orders by state model containing the order type</param>
        /// <returns>OrdersByState object with state-level count information</returns>
        /// <response code="200">Returns the state order counts successfully</response>
        [HttpPost("StateOrderCounts")]
        [ProducesResponseType(typeof(OrdersByState), StatusCodes.Status200OK)]
        public async Task<OrdersByState> GetStateOrderCounts([FromBody][Required] OrdersByState ordersByState)
        {
            return await Orchestrator.GetStateOrderCounts(ordersByState);
        }

        /// <summary>
        /// Gets new orders for a specific order type with optional filtering by state and order ID.
        /// Supports multiple order types: Snapshot (1, 2, 3), Preview, Commercial Lines, and Heavy Truck orders.
        /// </summary>
        /// <param name="orderType">The type of order to retrieve (e.g., Snapshot1Only, CommercialLines, CommercialLinesHeavyTruck)</param>
        /// <param name="orderState">Optional: Filter orders by state (e.g., "OH", "PA")</param>
        /// <param name="orderId">Optional: Filter by specific order ID or order number</param>
        /// <returns>List of order details including vehicle information, device versions, and shipping details</returns>
        /// <response code="200">Returns the list of new orders successfully</response>
        [HttpGet("NewOrders")]
        [ProducesResponseType(typeof(List<OrderDetails>), StatusCodes.Status200OK)]
        public async Task<List<OrderDetails>> GetNewOrders(
            [FromQuery][Required] OrderType orderType,
            [FromQuery] string orderState = null,
            [FromQuery] string orderId = null)
        {
            return await Orchestrator.GetNewOrders(orderType, orderState, orderId);
        }
    }
}
