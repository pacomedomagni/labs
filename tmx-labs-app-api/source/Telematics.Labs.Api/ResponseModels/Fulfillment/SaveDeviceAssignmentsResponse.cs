using Progressive.Telematics.Labs.Business.Resources;

namespace Progressive.Telematics.Labs.Api.ResponseModels.Fulfillment;

/// <summary>
/// API response model for saving device assignments.
/// Inherits from Resource for standard error/state reporting via Messages, Extenders, and Status.
/// </summary>
public class SaveDeviceAssignmentsResponse : Resource
{
    /// <summary>
    /// Device order sequence ID
    /// </summary>
    public int DeviceOrderSeqID { get; set; }
}
