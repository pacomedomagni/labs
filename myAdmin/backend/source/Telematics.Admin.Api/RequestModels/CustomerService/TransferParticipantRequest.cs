using System.ComponentModel.DataAnnotations;
using Progressive.Telematics.Admin.Business.Resources;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService
{
    public class TransferParticipantRequest
    {
        [Required]
        public Policy OldPolicy { get; set; }

        [Required]
        public Policy NewPolicy { get; set; }
    }
}
