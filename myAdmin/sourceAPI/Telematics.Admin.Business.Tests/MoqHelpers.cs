using System.IO;
using System.Text.Json;

namespace Progressive.Telematics.Admin.Business.Tests
{
    public static class MoqHelpers
    {
        public static T CreateResource<T>(string dataFile)
        {
            using StreamReader reader = new StreamReader(Path.Combine(Directory.GetCurrentDirectory(), "TestData", $"{dataFile}.json"));
            var data = reader.ReadToEnd();

            var resource = JsonSerializer.Deserialize<T>(data,
                new JsonSerializerOptions { IgnoreNullValues = true, PropertyNameCaseInsensitive = true });
            return resource;
        }
    }
}
