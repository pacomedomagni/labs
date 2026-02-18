using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources.Enums;

[TsEnum]    
public enum OrderType
{ 
    All, Snapshot1Only, Snapshot2Only, Snapshot3Only, CommercialLines, CommercialLinesHeavyTruck, CommercialLinesHeavyTruckCable
}
