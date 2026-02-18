using Progressive.Telematics.Labs.Business.Resources;

namespace Progressive.Telematics.Labs.Business.ResponseModels.CustomerService;

public class Response<T>
{
    public virtual bool Successful { get; set; }

    public class Success : Response<T>
    {
        public T Data { get; set; }
        public override bool Successful => true;
    }

    public class SuccessWithNoResults : Success { }

    public class Failure : Response<T>, IApiFailureResponse
    {
        public virtual int ErrorCode => 100;
        public string DeveloperMessage => "Failure retrieving data.";
        public string stkTrace { get; set; }
    }

    public class NoRegistrationData : Failure
    {
        public override int ErrorCode => 101;
        public string DeveloperMessage => "Failure retrieving data.";
    }
}

