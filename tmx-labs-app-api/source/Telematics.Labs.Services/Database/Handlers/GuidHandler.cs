using System;
using System.Data;
using Dapper;

namespace Progressive.Telematics.Labs.Services.Database.Handlers
{
    public class GuidHandler : SqlMapper.TypeHandler<Guid>
    {
        // Handles how data is serialized into object
        public override Guid Parse(object value)
        {
            return Guid.Parse(value.ToString());
        }

        // Handles how data is saved into the database
        public override void SetValue(IDbDataParameter parameter, Guid value)
        {
            parameter.Value = value.ToString();
        }
    }

    public class NullableGuidHandler : SqlMapper.TypeHandler<Guid?>
    {
        // Handles how data is serialized into object
        public override Guid? Parse(object value)
        {
            return value == null || string.IsNullOrWhiteSpace(value.ToString()) ? null : (Guid?)Guid.Parse(value.ToString());
        }

        // Handles how data is saved into the database
        public override void SetValue(IDbDataParameter parameter, Guid? value)
        {
            parameter.Value = value.HasValue ? value.ToString() : null;
        }
    }
}

