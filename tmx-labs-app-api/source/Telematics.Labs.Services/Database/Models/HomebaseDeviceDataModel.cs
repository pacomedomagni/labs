using System;
using System.Collections.Generic;
using Progressive.Telematics.Labs.Business.Resources.Enums;

namespace Progressive.Telematics.Labs.Services.Database.Models;

public class HomebaseDeviceDataModel
{
    public int DeviceSeqID { get; set; }
    public string DeviceSerialNumber { get; set; }
    public string SIM { get; set; }
    public int? DeviceStatusCode { get; set; }
    public int? DeviceLocationCode { get; set; }
    public string DeviceManufacturer { get; set; }
    public string DeviceTypeDescription { get; set; }
    public string ReportedVIN { get; set; }
    public DateTime? DeviceShipDateTime { get; set; }
    public DateTime? FirstContactDateTime { get; set; }
    public DateTime? LastContactDateTime { get; set; }
    public DateTime? LastUploadDateTime { get; set; }
    public IList<DeviceFeature> Features { get; set; }
}
