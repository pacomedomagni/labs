using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Progressive.Telematics.Admin.Services.Models
{
    public class OData<T>
    {
        [JsonPropertyName("odata.context")]
        public string Metadata { get; set; }

        [JsonPropertyName("value")]
        public List<T> Values { get; set; }
    }
}
