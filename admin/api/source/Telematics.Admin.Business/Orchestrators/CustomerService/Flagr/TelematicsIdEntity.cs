using Progressive.FeatureFlags;
using System;

namespace Progressive.Telematics.Admin.Business.Orchestrators.CustomerService.Flagr
{
    [EntityType("telematicsId")]
    public class TelematicsIdEntity : IFlagEntity
    {
        public string EntityId { get; }

        public TelematicsIdEntity(string telematicsId)
        {
            if (string.IsNullOrWhiteSpace(telematicsId))
            {
                throw new ArgumentNullException(nameof(telematicsId));
            }
            EntityId = telematicsId;
        }
    }
}
