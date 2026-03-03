using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Admin.Business.Orchestrators.DevicePrep;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Enums;

namespace Progressive.Telematics.Admin.Api.Controllers.DevicePrep
{
    public class ActivationController : DevicePrepController<IActivationOrchestrator>
    {
        [HttpPost("{query}")]
        public async Task<IEnumerable<PluginDevice>> GetDevices([Required] string query, [Required] DeviceActivationRequestType action)
        {
            return await Orchestrator.GetDevicesInLot(query, action);
        }


    }
}
