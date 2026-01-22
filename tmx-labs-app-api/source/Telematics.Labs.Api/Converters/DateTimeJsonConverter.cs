using System;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Progressive.Telematics.Labs.Api.Converters;

public class DateTimeJsonConverter : JsonConverter<DateTime>
{
    public override DateTime Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options
    )
    {
        if (reader.GetString().Contains('Z'))
        {
            return DateTime.ParseExact(
                reader.GetString(),
                "yyyy-MM-ddTHH:mm:ss.fffZ",
                CultureInfo.InvariantCulture
            );
        }
        return DateTime.ParseExact(
            reader.GetString(),
            "yyyy-MM-dd HH:mm:ss",
            CultureInfo.InvariantCulture
        );
    }

    public override void Write(
        Utf8JsonWriter writer,
        DateTime dateTimeValue,
        JsonSerializerOptions options
    ) =>
        writer.WriteStringValue(
            dateTimeValue.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture)
        );
}

