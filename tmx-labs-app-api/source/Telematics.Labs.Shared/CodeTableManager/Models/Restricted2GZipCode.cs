using System;

namespace FulfillmentWeb.Shared.CodeTableManager.Models;

public class Restricted2GZipCode
{
    public string State { get; set; }
    public string ZipCode { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreateDateTime { get; set; }
    public short NetworkCarrierCode { get; set; }
    public bool Allow2GDevices { get; set; }
}
