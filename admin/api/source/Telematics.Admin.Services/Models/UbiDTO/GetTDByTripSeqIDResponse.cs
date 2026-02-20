using System.Collections.Generic;

namespace Progressive.Telematics.Admin.Services.Models.UbiDTO;
public class GetTDByTripSeqIDResponse
{
    public List<TripEventDTO> TripEventList { get; set; }
    public int TotalRecordCount { get; set; }
}
