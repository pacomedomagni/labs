using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources.Enums
{
    [TsEnum]
    [System.Flags]
    public enum ProtocolCode
    {
        UnknownProtocol = 0,
        ISO9141_1 = 1,
        ISO9141_2 = 2,
        KwipSlowInit = 4,
        KwipFastInit = 8,
        PWM = 16,
        VPWM = 32,
        CAN_11_250kbits = 64,
        CAN_11_500kbits = 128,
        CAN_29_250kbits = 256,
        CAN_29_500kbits = 512,
        CAN = 1001,
        ISO = 1002,
        KWP = 1003,
        VPW = 1004,
        J1939 = 1024,
        KW1281 = 2048,
        KW71 = 2049,
        KW81 = 4096,
        KW82 = 4097,
        ALDL = 8192
    }
}
