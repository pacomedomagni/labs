using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using Progressive.Telematics.Admin.Business.Resources;

namespace Progressive.Telematics.Admin.Business.Commands
{
    public class UnenrollSnapshotMobileParticipantCommand : IRequest<ExecuteIncidentResolutionResponse>
    {
        [Required]
        public string PolicyNumber { get; set; }
        [Required]
        public string ParticipantId { get; set; }

        public UnenrollSnapshotMobileParticipantCommand(SPParameter[] storedProcedureParameters)
        {
            PolicyNumber = storedProcedureParameters.FirstOrDefault(x => x.Name == "PolicyNumber")?.Value;
            ParticipantId = storedProcedureParameters.FirstOrDefault(x => x.Name == "ParticipantId")?.Value;

            Validator.ValidateObject(this, new ValidationContext(this), true);
        }
    }
}
