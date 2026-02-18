using System;

namespace FulfillmentWeb.Shared.CodeTableManager.Models;

public class XirgoVersion
{
    public int Code { get; set; }
    public string DeviceManufacturer { get; set; }
    public string DeviceVersion { get; set; }
    public string Description { get; set; }
    public int FeatureSetCode { get; set; }
    public int DefaultFirmwareSetCode { get; set; }
    public DateTime CreateDateTime { get; set; }
    public bool IsActive { get; set; }
    public string DistributorDescription { get; set; }
    public short? NetworkCarrierCode { get; set; }
}
