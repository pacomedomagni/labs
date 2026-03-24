using System.Collections.Generic;
using System.Linq;
using Progressive.Telematics.Labs.Api.RequestModels.Fulfillment;
using Progressive.Telematics.Labs.Business.Resources.Domain.Fulfillment;

namespace Progressive.Telematics.Labs.Api.Mappers;

/// <summary>
/// API layer mappers for transforming API request models to domain models.
/// These mappers live in the API project since they consume API-specific types.
/// </summary>
public static class FulfillmentRequestMappers
{
    /// <summary>
    /// Maps API SaveDeviceAssignmentsRequest to domain DeviceAssignmentCommand
    /// </summary>
    public static DeviceAssignmentCommand ToDeviceAssignmentCommand(this SaveDeviceAssignmentsRequest request)
    {
        if (request == null) return null;

        return new DeviceAssignmentCommand
        {
            DeviceOrderSeqID = request.DeviceOrderSeqID,
            FulfilledByUserID = request.FulfilledByUserID,
            Vehicles = request.Vehicles?.Select(v => new VehicleDeviceAssignmentInfo
            {
                DeviceOrderDetailSeqID = v.DeviceOrderDetailSeqID,
                ParticipantSeqID = v.ParticipantSeqID,
                DeviceSerialNumber = v.DeviceSerialNumber
            }).ToList() ?? new List<VehicleDeviceAssignmentInfo>()
        };
    }
}
