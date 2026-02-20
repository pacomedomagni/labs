using System.Collections.Generic;
using Progressive.Telematics.Admin.Business.Resources.Enums;

namespace Progressive.Telematics.Admin.Business.ResponseModels.CustomerService.Registration
{
    public abstract class GetRegistrationResponse
    {
        public virtual bool Successful { get; set; }

        public class Success : GetRegistrationResponse
        {
            public List<Resources.Registration> Registrations { get; set; }
            public override bool Successful => true;
        }

        public class Failure : GetRegistrationResponse, IApiFailureResponse
        {
            public int ErrorCode => 100;
            public string DeveloperMessage => "Failure retrieving registration data.";
        }

        public class NoRegistration : Failure
        {
            public new int ErrorCode => 101;
        }
    }

    public abstract class GetRegistrationConflictsResponse
    {
        public class Success : GetRegistrationConflictsResponse
        {
            public List<Resources.Registration> ConflictingRegistrations { get; set; }
        }

        public class Failure : GetRegistrationConflictsResponse, IApiFailureResponse
        {
            public int ErrorCode => 100;
            public string DeveloperMessage => "Failure retrieving conflicting registration data.";
        }
    }

    public abstract class DetermineUnlockRegistrationStatusResponse
    {
        public class Success : DetermineUnlockRegistrationStatusResponse
        {
            public MobileRegistrationStatus? RegistrationStatus { get; set; }
        }

        public class Failure : DetermineUnlockRegistrationStatusResponse, IApiFailureResponse
        {
            public int ErrorCode => 100;
            public string DeveloperMessage => "Failure to determine participant's new registration status.";
        }
    }

    public abstract class UnlockRegistrationResponse
    {
        public class Success : UnlockRegistrationResponse { }

        public class Failure : UnlockRegistrationResponse, IApiFailureResponse
        {
            public virtual int ErrorCode => 100;
            public virtual string DeveloperMessage => "Failed to unlock registration.";
        }
    }

    public abstract class UpdateRegistrationCodeResponse
    {
        public class Success : UpdateRegistrationCodeResponse { }

        public class Failure : UpdateRegistrationCodeResponse, IApiFailureResponse
        {
            public virtual int ErrorCode => 100;
            public virtual string DeveloperMessage { get; set; } = "Failed to retrieve conflicting registrations.";
        }

        public class FailureUpdatingConflictingRegistration : Failure
        {
            public override int ErrorCode => 101;
            public override string DeveloperMessage => "Failed to update one or more of the conflicting registrations.";
        }

        public class FailureUpdatingRegistration : Failure
        {
            public override int ErrorCode => 102;
            public override string DeveloperMessage => "Failed to update registration code.";
        }
    }

    public abstract class UpdateRegistrationStatusCodeResponse
    {
        public class Success : UpdateRegistrationStatusCodeResponse
        {
            public MobileRegistrationStatus NewRegistrationStatus { get; set; }
        }

        public class Failure : UpdateRegistrationStatusCodeResponse, IApiFailureResponse
        {
            public virtual int ErrorCode => 100;
            public virtual string DeveloperMessage { get; set; } = "Failed to update registration status code.";
        }
    }

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
