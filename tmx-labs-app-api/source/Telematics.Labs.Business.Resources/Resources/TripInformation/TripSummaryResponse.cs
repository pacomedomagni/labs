using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Progressive.Telematics.Labs.Shared;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation;

public class TripSummaryResponse : Resource
{
    public List<TripDaySummary> TripDays { get; set; }
}
