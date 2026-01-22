using System;
using System.Collections.Generic;
using System.Text;
using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources.Enums
{
    [TsEnum]
    public enum DeviceReturnReasonCode
    {
        OptOut = 1,
        Cancel = 2,
        NonInstaller = 3,
        DeviceReplaced = 4,
        CustomerReturn = 5,
        DeviceProblem = 6,
        DeviceRefused = 7,
        DeviceUnclaimed = 8,
        MarkedReturned = 9,
        DeviceUndeliverable = 10,
        Abandoned = 11,
        NonCommunicator = 12,
        DiscountQualified = 13,
        DiscountDisqualified = 14,
        ManualMonitoringComplete = 15
    }
}

