using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.UserManagement;
public class ContactDetailsModel : Resource
{
    public int ParticipantGroupTypeCode { get; set; }
    public int ParticipantGroupSeqID { get; set; }
    public string Email { get; set; }
    public string UserName { get; set; }
    public bool IsAbleToEnroll { get; set; }
    public bool IsCustomer { get; set; }
    public string Address { get; set; }
    public string City { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string PhoneNumber { get; set; }
    public string PhoneAreaCode { get; set; }
    public string PhoneFirstThree { get; set; }
    public string PhoneLastFour { get; set; }
    public string State { get; set; }
    public string Zip { get; set; }
    public Guid ParticipantId { get; set; }
    public bool MustEnrollIntoOwnGroup { get; set; }
    public int? CurrentUserParticipantGroup { get; set; }
}
