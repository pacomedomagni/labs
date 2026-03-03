using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Services.Api;
using Progressive.Telematics.Admin.Shared.Utils;

namespace Progressive.Telematics.Admin.Business.Commands
{
    public class UnenrollSnapshotMobileParticipantCommandHandler : IRequestHandler<UnenrollSnapshotMobileParticipantCommand, ExecuteIncidentResolutionResponse>
    {
        private readonly ITmxPolicyApi _tmxPolicyApi;
        private readonly IPolicyServicingApi _policyServicingApi;
        private readonly IUbiApi _ubiApi;

        public UnenrollSnapshotMobileParticipantCommandHandler(ITmxPolicyApi tmxPolicyApi, IPolicyServicingApi policyServicingApi, IUbiApi ubiApi)
        {
            _tmxPolicyApi = tmxPolicyApi;
            _policyServicingApi = policyServicingApi;
            _ubiApi = ubiApi;
        }

        public static SPParameter[] GetSPParameters()
        {
            return new SPParameter[] {
                new SPParameter
                {
                    Name = "PolicyNumber",
                    DataType = "varchar"
                },
                new SPParameter
                {
                    Name = "ParticipantId",
                    DataType = "varchar"
                }
            };
        }
        public async Task<ExecuteIncidentResolutionResponse> Handle(UnenrollSnapshotMobileParticipantCommand request, CancellationToken cancellationToken)
        {
            var policyServicingApiPolicy = await _policyServicingApi.GetPolicy(request.PolicyNumber);
            var driverReferenceId = policyServicingApiPolicy?.CorePolicyDetails?.Drivers?.Where(d => Helper.AreEqualGuids(request.ParticipantId, d.DriverUbiParticipantId)).FirstOrDefault()?.DriverId;
            if (driverReferenceId == null)
            {
                return new ExecuteIncidentResolutionResponse()
                {
                    ResponseStatus = ResponseStatus.Failure,
                    ResponseErrors = new List<ResponseError> { new ResponseError { Message = "Unable to find driverReferenceId for given policy number and participantId" } }
                };
            }

            var snapshotSummary = await _ubiApi.GetPolicySummary(request.PolicyNumber);
            var participantExternalId = snapshotSummary?.Participants?.Where(p => Helper.AreEqualGuids(p.ParticipantId, request.ParticipantId)).FirstOrDefault()?.ParticipantExternalId;
            if (participantExternalId == null)
            {
                return new ExecuteIncidentResolutionResponse()
                {
                    ResponseStatus = ResponseStatus.Failure,
                    ResponseErrors = new List<ResponseError> { new ResponseError { Message = "Unable to find participantExternalId for given policy number and participantId" } }
                };
            }

            var result = await _tmxPolicyApi.UnenrollSnapshotParticipant(
               request.PolicyNumber,
               participantExternalId,
               driverReferenceId,
               "Mobile",
                "MNA",
                "Unenrolled",
                "InsuredRequest");

            return new ExecuteIncidentResolutionResponse()
            {
                ResponseStatus = result ? ResponseStatus.Success : ResponseStatus.Failure
            };
        }
    }
}
