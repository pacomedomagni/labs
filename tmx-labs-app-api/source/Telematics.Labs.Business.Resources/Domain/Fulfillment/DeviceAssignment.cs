using System.Collections.Generic;

namespace Progressive.Telematics.Labs.Business.Resources.Domain.Fulfillment;

/// <summary>
/// Domain model for device assignment command
/// </summary>
public class DeviceAssignmentCommand
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
    public List<VehicleDeviceAssignmentInfo> Vehicles { get; set; } = new();
}

/// <summary>
/// Domain model for vehicle device assignment information
/// </summary>
public class VehicleDeviceAssignmentInfo
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

/// <summary>
/// Domain model for device assignment result
/// </summary>
public class DeviceAssignmentResult
{
    /// <summary>
    /// Indicates if all device assignments were successful
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Total number of vehicles in the request
    /// </summary>
    public int TotalVehicleCount { get; set; }

    /// <summary>
    /// Device order sequence ID
    /// </summary>
    public int DeviceOrderSeqID { get; set; }

    /// <summary>
    /// Structured error details for each failed device
    /// </summary>
    public List<DeviceAssignmentErrorInfo> DeviceErrors { get; set; } = new();

    /// <summary>
    /// True if some devices succeeded and some failed
    /// </summary>
    public bool IsPartialSuccess => Success == false && DeviceErrors.Count > 0 && DeviceErrors.Count < TotalVehicleCount;
}

/// <summary>
/// Domain model for device assignment error
/// </summary>
public class DeviceAssignmentErrorInfo
{
    /// <summary>
    /// Device serial number that failed
    /// </summary>
    public string DeviceSerialNumber { get; set; }

    /// <summary>
    /// Type of error that occurred
    /// </summary>
    public DeviceAssignmentErrorCode ErrorType { get; set; }

    /// <summary>
    /// Validation result if the error was due to validation failure
    /// </summary>
    public DeviceValidationInfo ValidationResult { get; set; }
}

/// <summary>
/// Domain enum for device assignment error types
/// </summary>
public enum DeviceAssignmentErrorCode
{
    /// <summary>
    /// Device failed validation checks
    /// </summary>
    ValidationFailed,

    /// <summary>
    /// Failed to update device status
    /// </summary>
    UpdateFailed,

    /// <summary>
    /// Failed to retrieve device after update
    /// </summary>
    RetrievalFailed
}

/// <summary>
/// Domain model for device validation information
/// </summary>
public class DeviceValidationInfo
{
    /// <summary>
    /// Overall validation result
    /// </summary>
    public bool IsValid { get; set; }

    /// <summary>
    /// Whether the device exists in the system
    /// </summary>
    public bool IsExistent { get; set; }

    /// <summary>
    /// Whether the device has been benchtested
    /// </summary>
    public bool IsBenchtested { get; set; }

    /// <summary>
    /// Whether the device is already assigned
    /// </summary>
    public bool IsAssigned { get; set; }

    /// <summary>
    /// Whether the device is available for assignment
    /// </summary>
    public bool IsAvailable { get; set; }

    /// <summary>
    /// Device serial number
    /// </summary>
    public string DeviceSerialNumber { get; set; }
}
