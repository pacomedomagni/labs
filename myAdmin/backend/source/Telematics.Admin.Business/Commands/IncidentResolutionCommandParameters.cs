using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using Progressive.Telematics.Admin.Business.Resources;

namespace Progressive.Telematics.Admin.Business.Commands
{
    public class IncidentResolutionCommandParametersRequest : IRequest<SPParameter[]>
    {
        public SPParameter[] StoredProcedureParameters { get; set; }

        public IncidentResolutionCommandParametersRequest(SPParameter[] storedProcedureParameters)
        {
            StoredProcedureParameters = storedProcedureParameters;
        }
    }
}
