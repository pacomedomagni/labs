using Progressive.Telematics.Labs.Business.Resources.Enums;
using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;
[TsClass]
public class OrderSearch : Resource
{
    public OrderType Type { get; set; }
    public string OrderId { get; set; }

}
