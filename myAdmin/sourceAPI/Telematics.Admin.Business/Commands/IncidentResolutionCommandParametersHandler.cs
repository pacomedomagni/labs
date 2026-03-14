using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Progressive.Telematics.Admin.Business.Orchestrators.Tools;
using Progressive.Telematics.Admin.Business.Resources;

namespace Progressive.Telematics.Admin.Business.Commands
{
    public class IncidentResolutionCommandParametersHandler : IRequestHandler<IncidentResolutionCommandParametersRequest, SPParameter[]>
    {
        public Task<SPParameter[]> Handle(IncidentResolutionCommandParametersRequest request, CancellationToken cancellationToken)
        {
            return Task.FromResult(request.StoredProcedureParameters);
        }
    }
}
