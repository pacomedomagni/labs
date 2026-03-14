using System.Collections.Generic;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;

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
    /// List of any errors that occurred during confirmation
    /// </summary>
    public List<string> Errors { get; set; } = new();
}
