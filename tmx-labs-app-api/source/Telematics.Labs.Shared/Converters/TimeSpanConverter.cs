using System;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Progressive.Telematics.Labs.Shared.Converters
{
    public class TimeSpanConverter : JsonConverter<TimeSpan>
    {
        public override TimeSpan Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            throw new NotImplementedException();
        }

        public override void Write(Utf8JsonWriter writer, TimeSpan value, JsonSerializerOptions options)
        {
            writer.WriteStartObject();
            writer.WriteNumber("days", value.Days);
            writer.WriteNumber("hours", value.Hours);
            writer.WriteNumber("milliseconds", value.Milliseconds);
            writer.WriteNumber("ticks", value.Ticks);
            writer.WriteNumber("minutes", value.Minutes);
            writer.WriteNumber("seconds", value.Seconds);
            writer.WriteNumber("totalDays", value.TotalDays);
            writer.WriteNumber("totalHours", value.TotalHours);
            writer.WriteNumber("totalMilliseconds", value.TotalMilliseconds);
            writer.WriteNumber("totalMinutes", value.TotalMinutes);
            writer.WriteNumber("totalSeconds", value.TotalSeconds);
            /* insert any needed properties here */
            writer.WriteEndObject();
        }
    }
}

