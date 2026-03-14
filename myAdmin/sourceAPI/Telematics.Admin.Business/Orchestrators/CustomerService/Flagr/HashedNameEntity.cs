using System;
using Progressive.FeatureFlags;

namespace Progressive.Telematics.Admin.Business.Orchestrators.CustomerService.Flagr;

[EntityType("hashedName")]
public class HashedNameEntity : IFlagEntity
{
    public string EntityId { get; }

    public HashedNameEntity(string hashedName)
    {
        if (string.IsNullOrWhiteSpace(hashedName))
        {
            throw new ArgumentNullException(nameof(hashedName));
        }
        EntityId = hashedName;
    }
}
