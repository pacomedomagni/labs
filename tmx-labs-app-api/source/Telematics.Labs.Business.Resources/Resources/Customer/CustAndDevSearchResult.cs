
using Progressive.Telematics.Labs.Business.Resources.Resources.Participant;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.Customer;
public class CustAndDevSearchResult : Resource
{
    public CustomerInfo Customer { get; set; }
    public ParticipantInfo Participant { get; set; }
}
