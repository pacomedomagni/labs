using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources.Enums
{
    [TsEnum]
    public enum DeviceStatus
    {
        Available = 1,
        Inactive = 2,
        Assigned = 3,
        Abandoned = 4,
        CustomerReturn = 5,
        Unavailable = 6,
        Defective = 7,
        Batched = 8,
        ReadyForPrep = 9,
        ReadyForBenchTest = 10
    }

    public enum DeviceBenchTestStatus
    {
        Available = 1,
        Inactive = 2,
        Assigned = 3,
        Abandoned = 4,
        CustomerReturn = 5,
        Unavailable = 6,
        Defective = 7,
        Batched = 8,
        ReadyForPrep = 9,
        ReadyForBenchTest = 10,
        ReturnedByCustomerDamaged = 11,
        UnderReview = 12,
        UnderReviewBad = 13,
        UnderReviewGood = 14,
        NeedsRepair = 15
    }
}

