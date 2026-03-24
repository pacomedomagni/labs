using System.Collections.Generic;
using System.Linq;
using Progressive.Telematics.Labs.Api.ResponseModels.Fulfillment;
using Progressive.Telematics.Labs.Business.Resources.Domain.Fulfillment;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Shared;

namespace Progressive.Telematics.Labs.Api.Mappers;

/// <summary>
/// API layer mappers for transforming domain models to API response models.
/// These mappers live in the API project since they produce API-specific types.
/// </summary>
public static class FulfillmentResponseMappers
{


    #region SaveDeviceAssignments Mappers

    /// <summary>
    /// Maps domain DeviceAssignmentResult to API SaveDeviceAssignmentsResponse.
    /// Uses Resource.AddMessage for error reporting.
    /// </summary>
    public static SaveDeviceAssignmentsResponse ToSaveDeviceAssignmentsResponse(this DeviceAssignmentResult domain)
    {
        if (domain == null) return null;

        var response = new SaveDeviceAssignmentsResponse
        {
            Status = DetermineOperationStatus(domain),
            DeviceOrderSeqID = domain.DeviceOrderSeqID
        };

        // Add error messages using Resource pattern
        foreach (var deviceError in domain.DeviceErrors ?? Enumerable.Empty<DeviceAssignmentErrorInfo>())
        {
            var errorMessage = FormatErrorMessage(deviceError);
            response.AddMessage(MessageCode.Error, errorMessage);
        }

        return response;
    }

    private static OperationStatus DetermineOperationStatus(DeviceAssignmentResult result)
    {
        if (result.Success)
            return OperationStatus.Success;
        
        if (result.IsPartialSuccess)
            return OperationStatus.SuccessWithErrors;
        
        return OperationStatus.Failure;
    }

    private static string FormatErrorMessage(DeviceAssignmentErrorInfo error)
    {
        return error.ErrorType switch
        {
            DeviceAssignmentErrorCode.ValidationFailed => FormatValidationError(error),
            DeviceAssignmentErrorCode.UpdateFailed => $"Failed to update device {error.DeviceSerialNumber}",
            DeviceAssignmentErrorCode.RetrievalFailed => $"Failed to retrieve device {error.DeviceSerialNumber} after update",
            _ => $"Unknown error for device {error.DeviceSerialNumber}"
        };
    }

    private static string FormatValidationError(DeviceAssignmentErrorInfo error)
    {
        var errorParts = new List<string>();
        var validation = error.ValidationResult;

        if (validation == null)
            return $"Device {error.DeviceSerialNumber} validation failed";

        if (!validation.IsExistent)
            errorParts.Add("device not found");
        if (!validation.IsBenchtested)
            errorParts.Add("device not benchtested");
        if (validation.IsAssigned)
            errorParts.Add("device already assigned");
        if (!validation.IsAvailable)
            errorParts.Add("device not available");

        return $"Device {error.DeviceSerialNumber} validation failed: {string.Join(", ", errorParts)}";
    }

    #endregion
}
