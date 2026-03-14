using System.Collections.Generic;
using Progressive.Telematics.Admin.Business.Resources.Enums;

namespace Progressive.Telematics.Admin.Business.ResponseModels.CustomerService.AccidentDetection
{

    public abstract class UnenrollResponse
    {
        public class Success : UnenrollResponse
        {
           
        }

        public class Failure : UnenrollResponse, IApiFailureResponse
        {
            public virtual int ErrorCode => 100;
            public virtual string DeveloperMessage { get; set; } = "Failed to unenroll.";
        }
    }
}
