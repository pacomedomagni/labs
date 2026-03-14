using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Services.Database;

namespace Progressive.Telematics.Admin.Business.Commands
{
    public class ExecuteStoredProcCommandHandler : IRequestHandler<ExecuteStoredProcCommand, ExecuteIncidentResolutionResponse>
    {
        private readonly IPolicyDAL _policyDAL;

        public ExecuteStoredProcCommandHandler(IPolicyDAL policyDAL) => _policyDAL = policyDAL;

        public Task<ExecuteIncidentResolutionResponse> Handle(ExecuteStoredProcCommand request, CancellationToken cancellationToken)
        {
            if (!request.StoredProcedureName.StartsWith("usp_IncidentResolution", StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("Stored Procedures executed from this tool must start with usp_IncidentResolution.");

            return _policyDAL.ExecuteStoredProcedure(request.KBAId, request.StoredProcedureName, request.StoredProcedureParameters);
        }
    }
}
