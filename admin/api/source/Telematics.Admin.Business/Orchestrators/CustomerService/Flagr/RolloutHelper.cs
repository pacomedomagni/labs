using Progressive.FeatureFlags;
using Progressive.Telematics.Admin.Shared.Attributes;
using System.Threading.Tasks;

namespace Progressive.Telematics.Admin.Business.Orchestrators.CustomerService.Flagr;

[ScopedService]
public interface IRolloutHelper
{
    Task<RolloutStatus> GetRolloutStatusByFeatureSwitch<TFlag>(IFlagEntity flagEntity) where TFlag : FeatureSwitch;
}

public class RolloutHelper(IFlagManager flagManager) : IRolloutHelper
{
    public async Task<RolloutStatus> GetRolloutStatusByFeatureSwitch<TFlag>(IFlagEntity flagEntity) where TFlag : FeatureSwitch
    {
        var variant = await flagManager.EvaluateFeatureSwitchAsync<TFlag>(flagEntity);
        return variant.IsEnabled ? RolloutStatus.InProcess : RolloutStatus.Ready;
    }
}

public enum RolloutStatus
{
    Ready,
    InProcess,
    Complete
}
