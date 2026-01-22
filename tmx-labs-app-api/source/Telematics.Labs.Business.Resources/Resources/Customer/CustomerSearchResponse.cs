
namespace Progressive.Telematics.Labs.Business.Resources.Resources.Customer;
public class CustomerSearchResponse : Resource
{
    public CustomerInfo[] Customers { get; set; }
    public int RecordCount { get; set; }
}
