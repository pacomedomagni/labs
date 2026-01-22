using System.IO;
using System.Text.Json;

namespace Progressive.Telematics.Labs.Business.Tests
{
    public static class MoqHelpers
    {
        public static T CreateResource<T>(string dataFile)
        {
            using StreamReader reader = new StreamReader(Path.Combine(Directory.GetCurrentDirectory(), "TestData", $"{dataFile}.json"));
            var data = reader.ReadToEnd();

            var resource = JsonSerializer.Deserialize<T>(data,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return resource;
        }
    }
}

