using System.Data;
using Dapper;

namespace Progressive.Telematics.Labs.Services.Database.Handlers
{
    public class TrimmedStringHandler : SqlMapper.TypeHandler<string>
    {
        public override string Parse(object value)
        {
            var result = (value as string)?.Trim();
            return result;
        }

        public override void SetValue(IDbDataParameter parameter, string value)
        {
            parameter.Value = value;
        }
    }
}

