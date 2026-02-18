using System;
using System.Collections.Generic;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;
public class OrderDetails : OrderSearch
{
    public OrderDetails()
    {
        Vehicles = new List<SnapshotVehicle>();
        HasErrors = false;
        DevicesAssigned = false;
    }

    public List<SnapshotVehicle> Vehicles { get; set; }
    public bool DevicesAssigned { get; set; }
    public bool HasErrors { get; set; }
    public string ResponseErrorMessage { get; set; }
    public string OrderState { get; set; }
    public string ZipCode { get; set; }
    public string ParticipationType { get; set; }
    public string FulfilledByUserID { get; set; }
    public string DevicePackagingDescription { get; set; }
    public bool AudioOn { get; set; }
    public string PolicyNumber { get; set; }
    public System.DateTime InceptionDate { get; set; }
    public System.DateTime ExpirationDate { get; set; }
    public string ProductCode { get; set; }
    public string RateRevision { get; set; }
    public string ChannelIndicator { get; set; }
    public string ProgramType { get; set; }
    public int DevicesNeeded { get; set; }
    public DateTime OrderDate { get; set; }
    public string ValidDeviceVersionsByCode { get; set; }
    public string ValidDeviceVersionsByLetter { get; set; }
}
