using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Progressive.Telematics.Labs.Api.RequestModels.Fulfillment;

/// <summary>
/// API request model for saving device assignments to an order
/// </summary>
public class SaveDeviceAssignmentsRequest
{
    /// <summary>
    /// Device order sequence ID
    /// </summary>
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "DeviceOrderSeqID must be greater than 0")]
    public int DeviceOrderSeqID { get; set; }

    /// <summary>
    /// User ID of the person confirming the assignment
    /// </summary>
    public string FulfilledByUserID { get; set; }

    /// <summary>
    /// List of vehicles with their assigned devices
    /// </summary>
    [Required(ErrorMessage = "At least one vehicle assignment is required")]
    [MinLength(1, ErrorMessage = "At least one vehicle assignment is required")]
    public List<VehicleDeviceAssignmentRequest> Vehicles { get; set; }
}

/// <summary>
/// Vehicle with assigned device information for the API request
/// </summary>
public class VehicleDeviceAssignmentRequest
{
    /// <summary>
    /// Device order detail sequence ID
    /// </summary>
    [Required]
    public int DeviceOrderDetailSeqID { get; set; }

    /// <summary>
    /// Participant sequence ID
    /// </summary>
    [Required]
    public int ParticipantSeqID { get; set; }

    /// <summary>
    /// Serial number of the assigned device
    /// </summary>
    [Required(ErrorMessage = "Device serial number is required")]
    public string DeviceSerialNumber { get; set; }
}
