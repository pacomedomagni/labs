using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Progressive.Telematics.Admin.Api.Attributes;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService
{
    public class UpdateRegistrationCodeRequest
    {
        [Required, StringLength(9)]
        public string PolicyNumber { get; set; }

        [Required, MinLength(10), MaxLength(10)]
        public string NewRegistrationCode { get; set; }

        [Required]
        public Participant Participant { get; set; }

        public List<int> ConflictingRegistrationSeqIds { get; set; }
    }

    public class MobileRegistrationStatusChangeRequest : IValidatableObject
    {
        [Required, StringLength(9)]
        public string PolicyNumber { get; set; }
        
        [Required]
        public RegistrationStatusUpdateAction UpdateAction { get; set; }
        
        public int RegistrationSeqId { get; set; }

        [ValidTelematicsId]
        public string TelematicsId { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (RegistrationSeqId == 0 && string.IsNullOrEmpty(TelematicsId))
            {
                yield return new ValidationResult("Either RegistrationSeqId or TelematicsId must be provided.", ["Request"]);
            }
        }
    }
}
