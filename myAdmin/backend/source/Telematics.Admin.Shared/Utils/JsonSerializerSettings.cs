using System.Text.Json;
using System.Text.Json.Serialization;
using Progressive.Telematics.Admin.Shared.Converters;

namespace Progressive.Telematics.Admin.Shared
{
    public static class JsonSerializerSettings
    {
        public static JsonSerializerOptions DefaultOptions { get; private set; }
        public static JsonSerializerOptions CaseInsensitive { get; private set; }
        public static JsonSerializerOptions EnumsAsNumbers { get; private set; }

        static JsonSerializerSettings()
        {
            var options = new JsonSerializerOptions
            {
                WriteIndented = true,
                IgnoreNullValues = true
            };
            EnumsAsNumbers = new JsonSerializerOptions(options);
            options.Converters.Add(new JsonStringEnumConverter(allowIntegerValues: true));
            options.Converters.Add(new TimeSpanConverter());
            DefaultOptions = options;
            CaseInsensitive = new JsonSerializerOptions(options) { PropertyNameCaseInsensitive = true };
        }

        public static void SetDefaultJsonSerializerOptions(this JsonSerializerOptions options)
        {
            options.WriteIndented = DefaultOptions.WriteIndented;
            options.IgnoreNullValues = DefaultOptions.IgnoreNullValues;
            options.Converters.Add(new JsonStringEnumConverter(allowIntegerValues: true));
            options.Converters.Add(new TimeSpanConverter());
        }
    }
}
