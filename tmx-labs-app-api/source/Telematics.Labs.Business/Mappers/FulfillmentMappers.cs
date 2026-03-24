using System.Collections.Generic;
using System.Linq;
using Progressive.Telematics.Labs.Business.Resources.Domain.Fulfillment;
using Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;
using Progressive.Telematics.Labs.Services.Database.Models.DeviceOrder;

namespace Progressive.Telematics.Labs.Business.Mappers;

/// <summary>
/// Mappers for transforming between API, Domain, and DAL fulfillment models.
/// 
/// Model flow:
/// API Request ? Domain Model ? DAL Entity (write operations)
/// DAL Entity ? Domain Model ? API Response (read operations)
/// </summary>
public static class FulfillmentMappers
{
    #region DAL Entity ? Domain Model

    /// <summary>
    /// Maps DAL entity to domain model for pending orders
    /// </summary>
    public static DeviceOrderInfo ToDeviceOrderInfo(this FulfillmentOrderEntity entity)
    {
        if (entity == null) return null;

        return new DeviceOrderInfo
        {
            DeviceOrderSeqID = entity.DeviceOrderSeqID,
            OrderNumber = entity.DeviceOrderSeqID.ToString(),
            OrderDate = entity.CreateDateTime,
            DeviceOrderStatusDescription = entity.StatusDescription,
            SnapshotVersion = entity.SnapshotVersionCode,
            // Note: Name, Email, State, DeviceType require additional joins - set separately
        };
    }

    /// <summary>
    /// Maps collection of DAL entities to domain models
    /// </summary>
    public static IEnumerable<DeviceOrderInfo> ToDeviceOrderInfoList(this IEnumerable<FulfillmentOrderEntity> entities)
    {
        return entities?.Select(e => e.ToDeviceOrderInfo()) ?? Enumerable.Empty<DeviceOrderInfo>();
    }

    /// <summary>
    /// Maps DeviceFulfillmentValidation to domain DeviceValidationInfo
    /// </summary>
    public static DeviceValidationInfo ToDeviceValidationInfo(this DeviceFulfillmentValidation validation)
    {
        if (validation == null) return null;

        return new DeviceValidationInfo
        {
            IsValid = validation.IsValid,
            IsExistent = validation.IsExistent,
            IsBenchtested = validation.IsBenchtested,
            IsAssigned = validation.IsAssigned,
            IsAvailable = validation.IsAvailable,
            DeviceSerialNumber = validation.DeviceSerialNumber
        };
    }

    #endregion

    
    #region API Request ? Domain Model

    /// <summary>
    /// Maps ConfirmDeviceAssignmentRequest to domain DeviceAssignmentCommand
    /// </summary>
    public static DeviceAssignmentCommand ToDeviceAssignmentCommand(this ConfirmDeviceAssignmentRequest request)
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

    #endregion
}
