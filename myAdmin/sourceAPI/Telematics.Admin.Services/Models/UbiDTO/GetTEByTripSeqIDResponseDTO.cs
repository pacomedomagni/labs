using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Admin.Services.Models.UbiDTO;
public class GetTEByTripSeqIDResponseDTO
{
    public List<EventDTO> TripEventList { get; set; }
    public int TotalRecordCount { get; set; }
}
