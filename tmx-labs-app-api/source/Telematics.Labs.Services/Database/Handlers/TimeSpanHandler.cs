using System;
using System.Data;
using Dapper;

namespace Progressive.Telematics.Labs.Services.Database.Handlers
{
    public class TimeSpanHandler : SqlMapper.TypeHandler<TimeSpan>
    {
        public override TimeSpan Parse(object value)
        {
            return TimeSpan.Parse(value.ToString());
        }

        public override void SetValue(IDbDataParameter parameter, TimeSpan value)
        {
            parameter.Value = value.ToString();
        }
    }
}

