namespace Progressive.Telematics.Admin.Business.ResponseModels
{
    public interface IApiFailureResponse
    {
        int ErrorCode { get; }
        string DeveloperMessage { get; }
    }
}
