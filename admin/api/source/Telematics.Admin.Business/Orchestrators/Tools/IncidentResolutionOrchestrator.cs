using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Progressive.Telematics.Admin.Business.Commands;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Services.Database;
using Progressive.Telematics.Admin.Services.Models.UbiDTO;
using Progressive.Telematics.Admin.Shared.Attributes;

namespace Progressive.Telematics.Admin.Business.Orchestrators.Tools
{
    [SingletonService]
    public interface IIncidentResolutionOrchestrator
    {
        Task<List<IncidentResolutionDataModel>> GetIncidentResolutions();
        Task AddIncidentResolution(IncidentResolutionDataModel incidentResolution);
        Task UpdateIncidentResolution(IncidentResolutionDataModel incidentResolution);
        Task DeleteIncidentResolution(IncidentResolutionDataModel incidentResolution);
        Task<ExecuteIncidentResolutionResponse> ExecuteStoredProcedure(IncidentResolutionDataModel incidentResolution, SPParameter[] storedProcedureParameters);
        Task<SPParameter[]> GetStoredProcedureParameters(string storedProcedureName);
    }
    public class IncidentResolutionOrchestrator : IIncidentResolutionOrchestrator
    {
        private readonly IMediator _mediator;
        private readonly ISupportDAL _supportDAL;
        public IncidentResolutionOrchestrator(IMediator mediator, ISupportDAL supportDAL)
        {
            _mediator = mediator;
            _supportDAL = supportDAL;
        }

        public async Task<List<IncidentResolutionDataModel>> GetIncidentResolutions()
        {
            return await _supportDAL.GetIncidentResolutions();
        }

        public async Task AddIncidentResolution(IncidentResolutionDataModel incidentResolution)
        {
            await _supportDAL.AddIncidentResolution(incidentResolution);
        }

        public async Task UpdateIncidentResolution(IncidentResolutionDataModel incidentResolution)
        {
            await _supportDAL.UpdateIncidentResolution(incidentResolution);
        }

        public async Task DeleteIncidentResolution(IncidentResolutionDataModel incidentResolution)
        {
            await _supportDAL.DeleteIncidentResolution(incidentResolution);
        }

        public async Task<ExecuteIncidentResolutionResponse> ExecuteStoredProcedure(IncidentResolutionDataModel incidentResolution, SPParameter[] storedProcedureParameters)
        {
            object command = incidentResolution.StoredProcedureName switch
            {
                IncidentResolutionCommandName.EnrollSnapshotMobileParticipant => new EnrollSnapshotMobileParticipantCommand(storedProcedureParameters),
                IncidentResolutionCommandName.UnenrollSnapshotMobileParticipant => new UnenrollSnapshotMobileParticipantCommand(storedProcedureParameters),
                _ => new ExecuteStoredProcCommand(incidentResolution.KBAId,incidentResolution.StoredProcedureName, storedProcedureParameters)
            };

            return (ExecuteIncidentResolutionResponse)await _mediator.Send(command);
        }

        public async Task<SPParameter[]> GetStoredProcedureParameters(string storedProcedureName)
        {
            object command = storedProcedureName switch
            {
                IncidentResolutionCommandName.EnrollSnapshotMobileParticipant => new IncidentResolutionCommandParametersRequest(EnrollSnapshotMobileParticipantCommandHandler.GetSPParameters()),
                IncidentResolutionCommandName.UnenrollSnapshotMobileParticipant => new IncidentResolutionCommandParametersRequest(UnenrollSnapshotMobileParticipantCommandHandler.GetSPParameters()),
                _ => new GetStoredProcedureParametersCommand(storedProcedureName)
            };

            return (SPParameter[])await _mediator.Send(command);
        }
    }

    struct IncidentResolutionCommandName
    {
        public const string UnenrollSnapshotMobileParticipant = "Unenroll Snapshot Mobile Participant";
        public const string EnrollSnapshotMobileParticipant = "Enroll Snapshot Mobile Participant";
    }
}
