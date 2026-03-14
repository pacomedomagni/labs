using System.Collections.Generic;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;

/// <summary>
/// Request model for confirming device assignment to an order
/// </summary>
public class ConfirmDeviceAssignmentRequest
{
    /// <summary>
    /// Device order sequence ID
    /// </summary>
    public int DeviceOrderSeqID { get; set; }

    /// <summary>
    /// User ID of the person confirming the assignment
    /// </summary>
    public string FulfilledByUserID { get; set; }

    /// <summary>
    /// List of vehicles with their assigned devices
    /// </summary>
    public List<VehicleDeviceAssignment> Vehicles { get; set; }
}

/// <summary>
/// Vehicle with assigned device information
/// </summary>
public class VehicleDeviceAssignment
{
    /// <summary>
    /// Device order detail sequence ID
    /// </summary>
    public int DeviceOrderDetailSeqID { get; set; }

    /// <summary>
    /// Participant sequence ID
    /// </summary>
    public int ParticipantSeqID { get; set; }

    /// <summary>
    /// Serial number of the assigned device
    /// </summary>
    public string DeviceSerialNumber { get; set; }
}
