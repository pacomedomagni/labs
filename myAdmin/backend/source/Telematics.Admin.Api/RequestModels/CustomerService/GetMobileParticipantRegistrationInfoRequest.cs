using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService
{
    public class GetMobileParticipantRegistrationInfoRequest
    {
        [Required]
        public List<string> TelematicsIds { get; set; }
    }
}
