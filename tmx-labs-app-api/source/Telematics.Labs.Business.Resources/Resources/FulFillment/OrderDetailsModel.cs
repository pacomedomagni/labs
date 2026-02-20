using System;
using System.Collections.Generic;
using Progressive.Telematics.Labs.Business.Resources.Resources.Device;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;

public class OrderDetailsModel : Resource
{
    public string CustomerName { get; set; }
    public string Email { get; set; }
    public string FulfilledByUserID { get; set; }
    public int DeviceOrderSeqID { get; set; }
    public int ParticipantGroupSeqID { get; set; }
    public bool DevicesAssigned { get; set; }
    public bool HasErrors { get; set; }
		public List<DeviceType> DeviceTypes { get; set; }
		public IEnumerable<string> MobileOSNames { get; set; }
		public List<MyScoreVehicle> Vehicles { get; set; }

		public OrderDetailsModel()
		{
			Vehicles = new List<MyScoreVehicle>();
			DeviceTypes = new List<DeviceType>();
		}
}
