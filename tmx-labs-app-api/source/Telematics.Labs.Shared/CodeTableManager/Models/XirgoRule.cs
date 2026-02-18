using System;

namespace FulfillmentWeb.Shared.CodeTableManager.Models;

public class XirgoRule
{
    public int Code { get; set; }
    public int VersionCode { get; set; }
    public int FirmwareSetCode { get; set; }
    public int AudioVolumeValue { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreateDateTime { get; set; }
}
