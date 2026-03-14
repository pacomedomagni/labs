using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources.Enums
{
    [TsEnum]
    public enum AlgorithmType
    {
        Algorithm2008 = 1,
        Algorithm2015 = 2,
        Algorithm2008ObdAnd2018MobileWithDD = 3,
        Algorithm2008ObdAnd2018MobileWithoutDD = 4,
        Algorithm2018ObdAnd2018MobileWithDD = 5,
        Algorithm2018ObdAnd2018MobileWithoutDD = 6,
        Algorithm2020ObdAnd2020MobileWithDD = 7,
        Algorithm2020ObdAnd2020MobileWithoutDD = 8,
        Algorithm2021ObdAnd2021MobileWithDD = 9,
        Algorithm2021ObdAnd2021MobileWithoutDD = 10
    }
}
