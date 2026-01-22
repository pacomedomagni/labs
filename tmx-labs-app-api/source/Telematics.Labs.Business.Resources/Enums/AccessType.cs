using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources.Enums;

[TsEnum]
public enum AccessType : int
{
    PGRInternal = 0,
    UbiPerson = 1,
    Both = 2,
}
