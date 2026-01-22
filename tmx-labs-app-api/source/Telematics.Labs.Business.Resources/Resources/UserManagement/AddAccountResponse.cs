using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.UserManagement;
public class AddAccountResponse : Resource
{
    public AddAccountResponse()
    {
        DeviceOrderSeqIDs = new List<int>();
    }
    public List<int> DeviceOrderSeqIDs { get; set; }
    public string ParticipantGroupExternalKey { get; set; }
    public int ParticipantGroupSeqID { get; set; }
}
