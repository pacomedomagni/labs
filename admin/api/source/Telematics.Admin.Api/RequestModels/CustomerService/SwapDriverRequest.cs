using System.ComponentModel.DataAnnotations;

namespace Progressive.Telematics.Admin.Api.RequestModels.CustomerService
{
    public class SwapDriverRequest
    {
        [Required, StringLength(9)]
        public string PolicyNumber { get; set; }

        [Required]
        public int SrcParticipantSeqId { get; set; }

        [Required]
        public int DestParticipantSeqId { get; set; }
    }
}
