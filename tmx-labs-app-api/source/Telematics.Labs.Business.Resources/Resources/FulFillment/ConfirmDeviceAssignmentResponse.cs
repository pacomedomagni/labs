using System.Collections.Generic;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;

/// <summary>
/// Represents a device assignment error with structured validation information
/// </summary>
public class DeviceAssignmentError
{
    /// <summary>
    /// Device serial number that failed
    /// </summary>
    public string DeviceSerialNumber { get; set; }

    /// <summary>
    /// Type of error that occurred
    /// </summary>
    public DeviceAssignmentErrorType ErrorType { get; set; }

    /// <summary>
    /// Validation result if the error was due to validation failure
    /// </summary>
    public DeviceFulfillmentValidation ValidationResult { get; set; }
}

/// <summary>
/// Types of errors that can occur during device assignment
/// </summary>
public enum DeviceAssignmentErrorType
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
/// Response model for confirming device assignment
/// </summary>
public class ConfirmDeviceAssignmentResponse
{
    /// <summary>
    /// Indicates if the confirmation was successful
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Device order sequence ID
    /// </summary>
    public int DeviceOrderSeqID { get; set; }

    /// <summary>
    /// List of formatted error messages for presentation
    /// </summary>
    public List<string> Errors { get; set; } = new();

    /// <summary>
    /// Structured error details for each failed device
    /// </summary>
    public List<DeviceAssignmentError> DeviceErrors { get; set; } = new();
}
