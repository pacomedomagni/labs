using System;

namespace Progressive.Telematics.Labs.Business.Resources;

public class Slot
{
    public int Code { get; set; }
    public string Description { get; set; }
    public DateTime CreateDateTime { get; set; }
    public DateTime LastChangeDateTime { get; set; }
    public string LastChangeUserId { get; set; }
}

