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
    public class GetStoredProcedureParametersCommandHandler : IRequestHandler<GetStoredProcedureParametersCommand, SPParameter[]>
    {
        private readonly IPolicyDAL _policyDAL;

        public GetStoredProcedureParametersCommandHandler(IPolicyDAL policyDAL) => _policyDAL = policyDAL;

        public async Task<SPParameter[]> Handle(GetStoredProcedureParametersCommand request, CancellationToken cancellationToken)
        {
            return await _policyDAL.GetStoredProcedureParameters(request.StoredProcedureName);
        }
    }
}
