using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService
{
    public class CancelOptOutRequest
    {
        [Required]
        public List<int> optOutSeqIds { get; set; }
    }
}
