namespace Progressive.Telematics.Labs.Api.RequestModels.Fulfillment;

/// <summary>
/// API request model for getting orders by status
/// </summary>
public class GetOrdersByStatusRequest
{
    /// <summary>
    /// The device order status code to filter by
    /// </summary>
    public int DeviceOrderStatusCode { get; set; }

    /// <summary>
    /// Optional participant group type code filter
    /// </summary>
    public int? ParticipantGroupTypeCode { get; set; }

    /// <summary>
    /// Whether user can only view orders for their own group
    /// </summary>
    public bool CanOnlyViewOrdersForOwnGroup { get; set; }
}
