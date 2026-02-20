using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Azure.Core;
using MediatR;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Admin.Business.Resources;

namespace Progressive.Telematics.Admin.Business.Commands
{
    public class EnrollSnapshotMobileParticipantCommand : IRequest<ExecuteIncidentResolutionResponse>
    {
        [Required]
        public string PolicyNumber { get; set; }
        [Required]
        public string ParticipantId { get; set; }
        [Required]
        public string PhoneNumber { get; set; }

        public EnrollSnapshotMobileParticipantCommand(SPParameter[] storedProcedureParameters) {
            PolicyNumber = storedProcedureParameters.FirstOrDefault(x => x.Name == "PolicyNumber")?.Value;
            ParticipantId = storedProcedureParameters.FirstOrDefault(x => x.Name == "ParticipantId")?.Value;
            PhoneNumber = storedProcedureParameters.FirstOrDefault(x => x.Name == "PhoneNumber")?.Value;

            Validator.ValidateObject(this, new ValidationContext(this), true);
        }
    }
}
