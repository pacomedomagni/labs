using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Progressive.Telematics.Admin.Business.Resources;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService
{
    public class UpdateDeviceSuspensionsRequest
    {
        [Required]
        public List<int> DeviceSeqId { get; set; }
    }
}
