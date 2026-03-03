using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Admin.Business.Orchestrators.DevicePrep;
using Progressive.Telematics.Admin.Business.Resources;

namespace Progressive.Telematics.Admin.Api.Controllers.DevicePrep
{
    public class ReceivedController : DevicePrepController<IReceivedOrchestrator>
    {
        [HttpGet("inProcess")]
        public async Task<IEnumerable<DeviceLot>> GetLotsInProcess()
        {
            return await Orchestrator.GetInProcessLots();
        }

        [HttpGet("findLot/{serialNumber}")]
        public async Task<DeviceLot> FindLotBySerialNumber([Required] string serialNumber)
        {
            return await Orchestrator.FindLot(serialNumber);
        }

        [HttpPost("checkIn/{query}")]
        public async Task<Resource> Checkin([Required] string query)
        {
            return await Orchestrator.Checkin(query);
        }
    }
}
