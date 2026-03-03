using System.ComponentModel.DataAnnotations;
using Progressive.Telematics.Admin.Business.Resources;

namespace Progressive.Telematics.Admin.Api.RequestModels.Tools.IncidentResolution
{
    public class ExecuteStoredProcedureRequest
    {
        [Required]
        public Progressive.Telematics.Admin.Business.Resources.IncidentResolutionDataModel IncidentResolution { get; set; }

        [Required]
        public SPParameter[] StoredProcedureParameters { get; set; }
    }
}
