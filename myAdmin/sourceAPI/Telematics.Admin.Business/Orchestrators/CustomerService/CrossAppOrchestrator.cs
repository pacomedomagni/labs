using System.Linq;
using System.Threading.Tasks;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Services.Api;
using Progressive.Telematics.Admin.Shared.Attributes;

namespace Progressive.Telematics.Admin.Business.Orchestrators.CustomerService
{
    [SingletonService]
    public interface ICrossAppOrchestrator
    {
        Task<PolicyEnrolledFeatures> GetPolicyEnrolledFeatures(string policyNumber);
    }

    public class CrossAppOrchestrator : ICrossAppOrchestrator
    {
        private readonly IHomebaseParticipantManagementApi homebaseParticipantManagement;
        private readonly IUbiApi ubiApi;

        public CrossAppOrchestrator(IHomebaseParticipantManagementApi homebaseParticipantManagement, IUbiApi ubiApi)
        {
            this.homebaseParticipantManagement = homebaseParticipantManagement;
            this.ubiApi = ubiApi;
        }

        public async Task<PolicyEnrolledFeatures> GetPolicyEnrolledFeatures(string policyNumber)
        {
            var summary = await homebaseParticipantManagement.GetPolicySummary(policyNumber);
            var snapshotSummary = await ubiApi.GetPolicySummary(policyNumber);
            var features = new PolicyEnrolledFeatures
            {
                IsEnrolledInAre = summary?.Participants.Any(y => y.ADEnrolled) ?? false,
                IsEnrolledInSnapshot = snapshotSummary?.Participants.Any(y => y.UBIEnrolled) ?? false
            };
            return features;
        }
    }
}
