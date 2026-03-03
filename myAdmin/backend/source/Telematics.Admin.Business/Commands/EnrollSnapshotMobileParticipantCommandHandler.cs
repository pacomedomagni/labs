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
    public class EnrollSnapshotMobileParticipantCommandHandler : IRequestHandler<EnrollSnapshotMobileParticipantCommand, ExecuteIncidentResolutionResponse>
    {
        private readonly ITmxPolicyApi _tmxPolicyApi;
        private readonly IPolicyServicingApi _policyServicingApi;
        private readonly IUbiApi _ubiApi;
        public EnrollSnapshotMobileParticipantCommandHandler(ITmxPolicyApi tmxPolicyApi, IPolicyServicingApi policyServicingApi, IUbiApi ubiApi)
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
                    DataType = "varchar",
                    Length = 9,
                },
                new SPParameter
                {
                    Name = "ParticipantId",
                    DataType = "varchar",
                    Length = 50,
                },
                new SPParameter
                {
                    Name = "PhoneNumber",
                    DataType = "varchar",
                    Length = 10,
                }

            };
        }

        public async Task<ExecuteIncidentResolutionResponse> Handle(EnrollSnapshotMobileParticipantCommand request, CancellationToken cancellationToken)
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

            var result = await _tmxPolicyApi.EnrollSnapshotParticipant(
                request.PolicyNumber,
                participantExternalId,
                driverReferenceId,
                request.PhoneNumber,
                "Mobile",
                "MNA",
                "Enrolled");

            return new ExecuteIncidentResolutionResponse()
            {
                ResponseStatus = result ? ResponseStatus.Success : ResponseStatus.Failure                
            };
        }
    }
}
