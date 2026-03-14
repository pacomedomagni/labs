using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources.Enums;

[TsEnum]
public enum StatusSummary
{
    New,
    Inactive,
    PendingResolution,
    Disabled,
    Locked,
    Complete
}
