using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;
using WcfPolicyService;
using Resources = Progressive.Telematics.Admin.Business.Resources;

namespace Progressive.Telematics.Admin.Services.Wcf
{
    [SingletonService]
    public interface IPolicyService
    {
        Task<GetPolicyResponse> GetPolicy(string policyNumber = "", short? policySuffix = null, short? expirationYear = null, string deviceSerialNumber = "");
        Task<IEnumerable<CommunicationItem>> GetPolicyCommunications(string policyNumber, int participantSeqId);
        Task<GetPolicyPeriodsResponse> GetPolicyPeriods(string policyNumber);
        Task<UpdateAddressResponse> UpdateAddress(string policyNumber, string name, string address1, string address2, string city, string state, string zip);
        Task<PolicyMergeResponse> TransferParticipants(Resources.Policy oldPolicy, Resources.Policy newPolicy);
    }

    public class PolicyService : WcfService<PolicyServiceClient>, IPolicyService
    {
        private readonly IHttpContextAccessor contextAccessor;

        public PolicyService(ILogger<PolicyService> logger, IWcfServiceFactory factory, IHttpContextAccessor contextAccessor)
            : base(logger, factory.CreatePolicyServiceClient)
        {
            this.contextAccessor = contextAccessor;
        }

        public async Task<GetPolicyResponse> GetPolicy(string policyNumber = "", short? policySuffix = null, short? expirationYear = null, string deviceSerialNumber = "")
        {
            using var client = CreateClient();
            var response = await client.GetPolicyAsync(new GetPolicyRequest
            {
                PolicyNumber = policyNumber,
                DeviceSerialNumber = deviceSerialNumber,
                PolicySuffix = policySuffix,
                ExpirationYear = expirationYear
            });
            return response;
        }

        public async Task<IEnumerable<CommunicationItem>> GetPolicyCommunications(string policyNumber, int participantSeqId)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(
                () => client.GetPolicyCommunicationsAsync(new GetPolicyCommunicationsRequest
                {
                    PolicyNumber = policyNumber,
                    ParticipantSeqID = participantSeqId
                }),
                logger);
            return response.Communications.ToList();
        }

        public async Task<GetPolicyPeriodsResponse> GetPolicyPeriods(string policyNumber)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(
                () => client.GetPolicyPeriodsAsync(new GetPolicyPeriodsRequest
                {
                    PolicyNumber = policyNumber
                }),
                logger);
            return response;
        }

        public async Task<UpdateAddressResponse> UpdateAddress(string policyNumber, string name, string address1, string address2, string city, string state, string zip)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(
                () => client.UpdateAddressAsync(new UpdateAddressRequest
                {
                    PolicyNumber = policyNumber,
                    Name = name,
                    Address1 = address1,
                    Address2 = address2,
                    City = city,
                    MailingState = state,
                    Zip = zip
                }),
                logger);
            return response;
        }

        public async Task<PolicyMergeResponse> TransferParticipants(Resources.Policy oldPolicy, Resources.Policy newPolicy)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(
                () => client.PolicyMergeAsync(new PolicyMergeRequest
                {
                    OldPolicy = new WcfPolicyService.Policy
                    {
                        PolicyNumber = oldPolicy.PolicyNumber,
                        PolicyPeriodSeqID = oldPolicy.PolicyPeriodDetails.Last().PolicyPeriodSeqId,
                        Participants = oldPolicy.Participants.Select(x => new WcfPolicyService.Participant
                        {
                            ParticipantSeqID = x.SnapshotDetails.ParticipantSeqId,
                            DeviceSeqID = x.PluginDeviceDetails?.DeviceSeqId,
                            DeviceSerialNumber = x.PluginDeviceDetails?.DeviceSerialNumber,
                            PendingDeviceSerialNumber = x.PluginDeviceDetails?.PendingDeviceSerialNumber,
                            VIN = x.SnapshotDetails.VehicleDetails?.VIN,
                            ParticipantID = x.SnapshotDetails.ParticipantId,
                            ActivateDevice = x.PluginDeviceDetails?.DeviceAbandonedDate == null && x.PluginDeviceDetails?.DeviceReceivedDate == null
                        }).ToArray()
                    },
                    NewPolicy = new WcfPolicyService.Policy
                    {
                        PolicyNumber = newPolicy.PolicyNumber,
                        PolicyPeriodSeqID = newPolicy.PolicyPeriodDetails.Last().PolicyPeriodSeqId,
                        Participants = newPolicy.Participants.Select(x => new WcfPolicyService.Participant
                        {
                            ParticipantSeqID = x.SnapshotDetails.ParticipantSeqId,
                            DeviceSeqID = x.PluginDeviceDetails?.DeviceSeqId,
                            DeviceSerialNumber = x.PluginDeviceDetails?.DeviceSerialNumber,
                            PendingDeviceSerialNumber = x.PluginDeviceDetails?.PendingDeviceSerialNumber,
                            VIN = x.SnapshotDetails.VehicleDetails?.VIN,
                            ParticipantID = x.SnapshotDetails.ParticipantId
                        }).ToArray()
                    },
                    UserName = contextAccessor.CurrentUser()
                }),
                logger);
            return response;
        }
    }
}
