using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;

[TsClass]
public class StateOrder: Resource
{
    public string State { get; set; }
    public int NumberOfOrders { get; set; }
    public int NumberOfDevices { get; set; }
    public int NumberOfOldOrders { get; set; }
    public DateTime OldestOrder { get; set; }
    public int NumberDaysForOldOrders { get; set; }
}



