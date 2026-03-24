using System.Collections.Generic;
using Progressive.Telematics.Labs.Business.Resources.Domain.Fulfillment;


namespace Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;

	public class OrdersList : Resource
	{
		public OrdersList()
		{
			DeviceOrders = new List<DeviceOrderInfo>();
		}

		public List<DeviceOrderInfo> DeviceOrders { get; set; }
		public int DeviceOrderStatusCode { get; set; }
		public int NumberOfOrders { get; set; }
        public int NumberOfDevices { get; set; }
		public int? ParticipantGroupTypeCode { get; set; }
		public bool CanOnlyViewOrdersForOwnGroup { get; set; }
	}

