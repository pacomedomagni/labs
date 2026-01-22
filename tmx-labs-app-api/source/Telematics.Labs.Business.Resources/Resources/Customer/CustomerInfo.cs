
using Progressive.Telematics.Labs.Business.Resources.Resources.Participant;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.Customer;

public class CustomerInfo : Resource
{
    public LabsUser User { get; set; }
    public ParticipantGroup ParticipantGroup { get; set; }
    public bool PendingOrdersForCustomer { get; set; }
}
