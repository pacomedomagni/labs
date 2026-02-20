using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using Progressive.Telematics.Admin.Business.Resources;

namespace Progressive.Telematics.Admin.Business.Commands
{
    public class ExecuteStoredProcCommand : IRequest<ExecuteIncidentResolutionResponse>
    {
        public string StoredProcedureName { get; set; }
        public string KBAId { get; set; }
        public SPParameter[] StoredProcedureParameters { get; set; }
        public ExecuteStoredProcCommand(string kbaId, string storedProcedureName, SPParameter[] storedProcedureParameters)
        {
            KBAId = kbaId;
            StoredProcedureName = storedProcedureName;
            StoredProcedureParameters = storedProcedureParameters;
            
        }
    }
}
