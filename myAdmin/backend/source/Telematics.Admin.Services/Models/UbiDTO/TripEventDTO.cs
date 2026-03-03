using System;

namespace Progressive.Telematics.Admin.Services.Models.UbiDTO;
public class TripEventDTO
{
	public DateTime EventDateTime { get; set; }
	public byte Speed { get; set; }
	public string EventDescription { get; set; }
}
