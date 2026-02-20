using System;
using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class Driver : Resource
    {
        [JsonPropertyName("firstName")]
        public string FirstName { get; set; }

        [JsonPropertyName("lastName")]
        public string LastName { get; set; }

        [JsonPropertyName("seqId")]
        public int? SeqId { get; set; }

        [JsonPropertyName("externalId")]
        public Guid? ExternalId { get; set; }
    }
}
