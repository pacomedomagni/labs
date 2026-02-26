using System;
using System.ComponentModel.DataAnnotations;


namespace Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;

public class MyScoreVehicle
{
    public string Year { get; set; }

    public string Make { get; set; }

    public string Model { get; set; }

    public string Message { get; set; }

    public int DeviceOrderDetailSeqID { get; set; }

    public int ParticipantSeqID { get; set; }

    public int DeviceTypeSelected { get; set; }

    public string NewDeviceSerialNumber { get; set; }

    // this field is an email address
    public string NewDeviceRegistrationKey { get; set; }

    public string MobileOSName { get; set; }

    public string MobileDeviceModelName { get; set; }

    public string MobileOSVersionName { get; set; }

    public string MobileAppVersionName { get; set; }
}

public enum DeviceTypeKind { Xirgo = 1, Mobile, OEM }
