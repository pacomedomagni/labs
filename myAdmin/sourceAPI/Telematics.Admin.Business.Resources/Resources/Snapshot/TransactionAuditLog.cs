using System;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class TransactionAuditLog : Resource
    {
        [JsonPropertyName("transactionAuditSeqId")]
        public int TransactionAuditSeqId { get; set; }

        [JsonPropertyName("policyNumber")]
        public string PolicyNumber { get; set; }

        [JsonPropertyName("resultStatus")]
        public string ResultStatus { get; set; }

        [JsonPropertyName("resultMessage")]
        public string ResultMessage { get; set; }

        [JsonPropertyName("transactionName")]
        public string TransactionName { get; set; }

        [JsonPropertyName("transactionData")]
        public string TransactionData { get; set; }

        [JsonPropertyName("resolutionStatus")]
        public string ResolutionStatus { get; set; }

        [JsonPropertyName("resolutionComments")]
        public string ResolutionComments { get; set; }

        [JsonPropertyName("createDate")]
        public DateTime CreateDate { get; set; }
    }
}
