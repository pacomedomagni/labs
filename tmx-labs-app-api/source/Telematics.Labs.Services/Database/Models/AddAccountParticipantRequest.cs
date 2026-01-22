using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using Progressive.Telematics.Labs.Business.Resources;

namespace Progressive.Telematics.Labs.Services.Database.Models
{
    public class AddAccountParticipantRequest : Resource
    {

        public int ParticipantGroupSeqId { get; set; }

        public VehicleInformation DriverVehicleInformation { get; set; }

    }
}
