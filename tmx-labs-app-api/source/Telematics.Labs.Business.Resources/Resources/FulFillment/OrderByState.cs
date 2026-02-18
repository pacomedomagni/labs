using System.Collections.Generic;
using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;
[TsClass]
public class OrdersByState : OrderSearch
{
    public OrdersByState()
    {
        SearchResults = new List<StateOrder>();
    }

    public List<StateOrder> SearchResults { get; set; }

}
