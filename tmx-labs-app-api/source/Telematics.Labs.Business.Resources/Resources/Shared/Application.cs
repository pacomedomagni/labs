using System;

namespace Progressive.Telematics.Labs.Business.Resources;
public class Application
{
    public int Code { get; set; }
    public string Description { get; set; }
    public DateTime CreateDateTime { get; set; }
    public DateTime LastChangeDateTime { get; set; }
    public string LastChangeUserId { get; set; }
}

