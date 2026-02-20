using System;
using System.Collections.Generic;
using System.Text;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Services.Models;

namespace Progressive.Telematics.Admin.Business.ResponseModels.CustomerService.Policy
{
    public abstract class GetPolicyResponse
    {
        public virtual bool Successful { get; set; }

        public class Success : GetPolicyResponse
        {
            public Resources.Policy Policy { get; set; }
            public HomebasePolicySummaryResponse homebasePolicySummary { get; set; }
            public override bool Successful => true;
        }

        public class SuccessWithNoResults : Success { }

        public class Failure : GetPolicyResponse, IApiFailureResponse
        {
            public virtual int ErrorCode => 100;
            public virtual string DeveloperMessage => "Failure retrieving policy data.";
        }

        public class NoRegistrationData : Failure
        {
            public override int ErrorCode => 101;
            public override string DeveloperMessage => "Failure retrieving policy registration data.";
        }
    }

    public abstract class GetPolicyByRegistrationCodeResponse
    {
        public class Success : GetPolicyByRegistrationCodeResponse
        {
            public List<Resources.Policy> Policies { get; set; }
        }

        public class SuccessWithNoResults : Success { }

        public class Failure : GetPolicyByRegistrationCodeResponse, IApiFailureResponse
        {
            public virtual int ErrorCode => 100;
            public virtual string DeveloperMessage => "Failure retrieving policy data.";
        }

        public class NoRegistrationData : Failure
        {
            public override int ErrorCode => 101;
            public override string DeveloperMessage => "Failure retrieving policy registration data.";
        }
    }

    public abstract class GetPolicyByDeviceSerialNumberResponse
    {
        public class Success : GetPolicyByDeviceSerialNumberResponse
        {
            public Resources.Policy Policy { get; set; }
        }

        public class SuccessWithNoResults : Success { }

        public class Failure : GetPolicyByDeviceSerialNumberResponse, IApiFailureResponse
        {
            public virtual int ErrorCode => 100;
            public virtual string DeveloperMessage => "Failure retrieving policy data.";
        }

        public class NoRegistrationData : Failure
        {
            public override int ErrorCode => 101;
            public override string DeveloperMessage => "Failure retrieving policy registration data.";
        }
    }

    public abstract class UpdateMailingAddressResponse
    {
        public class Success : UpdateMailingAddressResponse { }

        public class Failure : UpdateMailingAddressResponse, IApiFailureResponse
        {
            public int ErrorCode => 100;
            public string DeveloperMessage => "Failure updating mailing address.";
        }
    }

    public abstract class UpdateAppAssignmentResponse
    {
        public class Success : UpdateAppAssignmentResponse { }

        public class Failure : UpdateAppAssignmentResponse, IApiFailureResponse
        {
            public int ErrorCode => 100;
            public string DeveloperMessage => "Failure updating policy app assignment.";
        }
    }

    public abstract class GetEligibleTransferParticipantsResponse
    {
        public class Success : GetEligibleTransferParticipantsResponse
        {
            public List<Participant> EligibleParticipants { get; set; }
        }

        public class Failure : GetEligibleTransferParticipantsResponse, IApiFailureResponse
        {
            public int ErrorCode => 100;
            public string DeveloperMessage => "Failure in retrieving transfer eligible participants.";
        }
    }

    public abstract class TransferParticipantsResponse
    {
        public class Success : TransferParticipantsResponse { }

        public class Failure : TransferParticipantsResponse, IApiFailureResponse
        {
            public int ErrorCode => 100;
            public string DeveloperMessage => "Failure transferring participants.";
        }
    }

    public abstract class GetParticipantResponse
    {
        public class Success : GetParticipantResponse
        {
            public Participant Participant { get; set; }
        }

        public class Failure : GetParticipantResponse, IApiFailureResponse
        {
            public virtual int ErrorCode => 100;
            public virtual string DeveloperMessage => "Failure retrieving participant.";
        }

        public class NotFound : Failure
        {
            public override int ErrorCode => 101;
            public override string DeveloperMessage => "Participant not found.";
        }
    }

    public abstract class GetHomebaseParticipantSummaryResponse
    {
        public class Success : GetHomebaseParticipantSummaryResponse
        {
            public List<HomebaseParticipantSummaryResponse> Participants { get; set; }
        }

        public class Failure : GetHomebaseParticipantSummaryResponse, IApiFailureResponse
        {
            public virtual int ErrorCode => 100;
            public virtual string DeveloperMessage => "Failure retrieving Homebase participant summary.";
        }

        public class NotFound : Failure
        {
            public override int ErrorCode => 101;
            public override string DeveloperMessage => "Homebase participant summary not found.";
        }
    }

    public abstract class GetTransactionAlertResponse
    {
        public class Success : GetTransactionAlertResponse
        {
            public string Alert { get; set; }
        }

        public class Failure : GetTransactionAlertResponse, IApiFailureResponse
        {
            public int ErrorCode => 100;
            public string DeveloperMessage => "Failure in retrieving transaction error.";
        }
    }
}
