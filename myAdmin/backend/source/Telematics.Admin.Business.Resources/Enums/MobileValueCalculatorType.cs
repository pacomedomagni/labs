using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources.Enums
{
    [TsEnum]
    public enum MobileValueCalculatorType
    {
        Calculator2008 = 1,
        Calculator2015 = 2,
        Calculator2018WithDistractedDriving = 3,
        Calculator2018WithoutDistractedDriving = 4,
        Calculator2020WithDistractedDriving = 5,
        Calculator2020WithoutDistractedDriving = 6,
        Calculator2021WithDistractedDriving = 7,
        Calculator2021WithoutDistractedDriving = 8
    }
}
