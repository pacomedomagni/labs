namespace Progressive.Telematics.Labs.Business.ResponseModels
{
    public interface IApiFailureResponse
    {
        int ErrorCode { get; }
        string DeveloperMessage { get; }
    }
}

