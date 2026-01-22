namespace Progressive.Telematics.Labs.Business.Resources.Resources.Device;

public class MarkAbandonedRequest
{
    public string DeviceSerialNumber { get; set; }
    public int ParticipantSequenceId { get; set; }
}
