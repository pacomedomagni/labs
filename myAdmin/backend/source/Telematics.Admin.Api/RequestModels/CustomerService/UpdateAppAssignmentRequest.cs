using System.ComponentModel.DataAnnotations;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService
{
    public class UpdateAppAssignmentRequest
    {
        [Required, StringLength(9)]
        public string PolicyNumber { get; set; }

        [Required, StringLength(3)]
        public string AppName { get; set; }
    }
}
