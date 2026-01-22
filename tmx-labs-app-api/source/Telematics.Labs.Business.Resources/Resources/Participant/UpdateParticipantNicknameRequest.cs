using Progressive.Telematics.Labs.Business.Resources;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.Participant;

public class UpdateParticipantNicknameRequest : Resource
{
    public int ParticipantSeqID { get; set; }
    public string Nickname { get; set; }
}
