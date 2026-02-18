using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment;
public class SnapshotVehicle
{
    public string Year { get; set; }
    public string Make { get; set; }
    public string Model { get; set; }
    public string CurrentDeviceId { get; set; }
    public string NewDeviceId { get; set; }
    public string Message { get; set; }
    public string DetailID { get; set; }
    public string CableType { get; set; }
    public string DeviceVersionDescriptor { get; set; }
    public bool VehicleUsesCan { get; set; }
    public string ValidDeviceVersionsByCode { get; set; }
    public string ValidDeviceVersionsByLetter { get; set; }
}
