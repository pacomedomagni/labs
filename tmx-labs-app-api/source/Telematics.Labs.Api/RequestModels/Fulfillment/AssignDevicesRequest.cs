using Progressive.Telematics.Labs.Business.Resources.Domain.Fulfillment;
using Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;
using System.ComponentModel.DataAnnotations;

namespace Progressive.Telematics.Labs.Api.RequestModels.Fulfillment;

/// <summary>
/// API request model for assigning devices to an order
/// </summary>
public class AssignDevicesRequest
{
    /// <summary>
    /// Vehicle information for device assignment
    /// </summary>
    [Required(ErrorMessage = "Vehicle is required")]
    public OrderVehicle Vehicle { get; set; }

    /// <summary>
    /// Order details for the assignment
    /// </summary>
    [Required(ErrorMessage = "OrderDetails is required")]
    public DeviceOrderInfo OrderDetails { get; set; }
}
