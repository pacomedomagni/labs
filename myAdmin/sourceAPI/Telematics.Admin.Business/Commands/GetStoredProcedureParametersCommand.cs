using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using Progressive.Telematics.Admin.Business.Resources;

namespace Progressive.Telematics.Admin.Business.Commands
{
    public class GetStoredProcedureParametersCommand : IRequest<SPParameter[]>
    {
        public string StoredProcedureName { get; set; }

        public GetStoredProcedureParametersCommand(string storedProcedureName) => StoredProcedureName = storedProcedureName;
    }
}
