using System;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;

[TsClass]
public class Orders : Resource
{
    public Orders()
    {
        SearchBeginDate = DateTime.Now.ToShortDateString();
        SearchEndDate = DateTime.Now.ToShortDateString();
    }

    public string SearchOrderNumber { get; set; }
    public string SearchBeginDate { get; set; }
    public string SearchEndDate { get; set; }

    public OrderType Type { get; set; }

    public int OpenSnapshotOrders { get; set; }
    public int ProcessedSnapshotOrders { get; set; }
    public int SnapshotDevicesNeeded { get; set; }
    public int OpenCommercialLinesOrders { get; set; }
    public int ProcessedCommercialLinesOrders { get; set; }
    public int CommercialLinesDevicesNeeded { get; set; }

}
