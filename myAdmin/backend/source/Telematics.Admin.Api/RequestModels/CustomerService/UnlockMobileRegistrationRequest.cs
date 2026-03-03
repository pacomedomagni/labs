using System.ComponentModel.DataAnnotations;
using Progressive.Telematics.Admin.Business.Resources.Enums;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService
{
    public class UnlockRegistrationRequest
    {
        [Required, MinLength(10), MaxLength(10)]
        public string MobileRegistrationCode { get; set; }

        [Required]
        public int RegistrationSeqId { get; set; }

        public ProgramCode ProgramCode { get; set; } = ProgramCode.Snapshot;

        [Required]
        public MobileRegistrationStatus NewMobileRegistrationStatus { get; set; }

    }
}
