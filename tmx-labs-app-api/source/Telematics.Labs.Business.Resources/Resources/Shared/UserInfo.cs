using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources;

[TsClass]
public class UserInfo
{
    public string Name { get; set; }
    public string LanId { get; set; }
    public bool IsLabsAdmin { get; set; }
    public bool IsLabsUser { get; set; }
}

