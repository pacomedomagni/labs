using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources.Enums;

/// <summary>
/// Represents the outcome of an API operation for determining response status codes.
/// </summary>
[TsEnum]
public enum OperationStatus
{
    /// <summary>
    /// Operation failed completely - returns 400 Bad Request
    /// </summary>
    Failure,

    /// <summary>
    /// Operation completed successfully - returns 200 OK
    /// </summary>
    Success,

    /// <summary>
    /// Operation completed but with some errors - returns 207 Multi-Status or 200 OK with warnings
    /// </summary>
    SuccessWithErrors
}
