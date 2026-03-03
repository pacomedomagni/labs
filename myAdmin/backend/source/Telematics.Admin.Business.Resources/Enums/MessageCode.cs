using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources.Enums
{
    [TsEnum]
    public enum MessageCode
    {
        Error,
        ErrorCode,
        ErrorDetails,
        Handled,
        StackTrace,
        StatusCode,
        StatusDescription
    }
}
