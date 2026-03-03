using System;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class SupportPolicy : Resource
    {
        [JsonPropertyName("policySeqID")]
        public int PolicySeqID { get; set; }

        [JsonPropertyName("policyNumber")]
        public string PolicyNumber { get; set; }

        [JsonPropertyName("emailAddress")]
        public string EmailAddress { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("address1")]
        public string Address1 { get; set; }

        [JsonPropertyName("address2")]
        public string Address2 { get; set; }

        [JsonPropertyName("city")]
        public string City { get; set; }

        [JsonPropertyName("state")]
        public string State { get; set; }

        [JsonPropertyName("zipCode")]
        public string ZipCode { get; set; }

        [JsonPropertyName("sourceCode")]
        public string SourceCode { get; set; }

        [JsonPropertyName("activeEmailAddress")]
        public string ActiveEmailAddress { get; set; }

        [JsonPropertyName("needsLabelPrinted")]
        public string NeedsLabelPrinted { get; set; }

        [JsonPropertyName("createDate")]
        public DateTime CreateDate { get; set; }

        [JsonPropertyName("firstTimeLogin")]
        public DateTime? FirstTimeLogin { get; set; }

        [JsonPropertyName("participationType")]
        public string ParticipationType { get; set; }

        [JsonPropertyName("participationSubType")]
        public string ParticipationSubType { get; set; }

        [JsonPropertyName("channelIndicator")]
        public string ChannelIndicator { get; set; }

        [JsonPropertyName("lastReconcileDate")]
        public DateTime? LastReconcileDate { get; set; }

        [JsonPropertyName("mailingState")]
        public string MailingState { get; set; }

        [JsonPropertyName("deviceCategoryID")]
        public byte? DeviceCategoryID { get; set; }

        [JsonPropertyName("productCode")]
        public string ProductCode { get; set; }

        [JsonPropertyName("trialCustomerID")]
        public string TrialCustomerID { get; set; }
    }
}
