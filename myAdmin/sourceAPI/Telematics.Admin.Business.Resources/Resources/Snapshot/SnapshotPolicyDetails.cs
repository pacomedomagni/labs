using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class SnapshotPolicyDetails : Resource
    {
        [JsonPropertyName("groupExternalId")]
        public string GroupExternalId { get; set; }

        [JsonPropertyName("appInfo")]
        public AppInfo AppInfo { get; set; }

        [JsonPropertyName("mailingAddress")]
        public Address MailingAddress { get; set; }

        [JsonPropertyName("createDate")]
        public DateTime CreateDate { get; set; }

        [JsonPropertyName("inceptionDate")]
        public DateTime InceptionDate { get; set; }

        [JsonPropertyName("expirationDate")]
        public DateTime ExpirationDate { get; set; }

        [JsonPropertyName("policySystem")]
        public string PolicySystem { get; set; }
    }
}
