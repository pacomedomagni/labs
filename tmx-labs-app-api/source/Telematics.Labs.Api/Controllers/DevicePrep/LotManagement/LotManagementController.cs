using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Labs.Business.Orchestrators.DevicePrep;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Business.Resources.DevicePrep;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using Progressive.Telematics.Labs.Shared;

namespace Progressive.Telematics.Labs.Api.Controllers.DevicePrep.LotManagement
{
    /// <summary>
    /// Controller for managing device lots
    /// </summary>
    [Route("Api/LotManagement")]
    public class LotManagementController : TelematicsController<ILotManagementOrchestrator>
    {
        /// <summary>
        /// Get all device lots currently in process
        /// </summary>
        /// <returns>Collection of device lots in process</returns>
        [HttpGet("GetReceiveDeviceLotsInProgress")]
        [ProducesResponseType(typeof(GetReceiveDeviceLotsInProcessResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<GetReceiveDeviceLotsInProcessResponse>> GetReceiveDeviceLotsInProgress()
        {
            var lots = await Orchestrator.GetInProcessLots();

            var response = new GetReceiveDeviceLotsInProcessResponse
            {
                DeviceLots = lots.ToArray(),
                DeviceLotCount = lots.Count()
            };

            response.AddMessage(MessageCode.StatusDescription,
                $"Retrieved {response.DeviceLotCount} device lot(s) in process");

            return Ok(response);
        }

        /// <summary>
        /// Get device lots that can be marked as bench test complete
        /// </summary>
        /// <returns>Collection of device lots eligible for bench test completion</returns>
        [HttpGet("GetLotsForMarkBenchTestComplete")]
        [ProducesResponseType(typeof(GetReceiveDeviceLotsInProcessResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<GetReceiveDeviceLotsInProcessResponse>> GetLotsForMarkBenchTestComplete()
        {
            var lots = await Orchestrator.GetLotsForMarkBenchTestComplete();
            var requiredCount = 2; // TODO Pull from somehwere??

            var response = new GetReceiveDeviceLotsInProcessResponse
            {
                DeviceLots = lots.ToArray(),
                DeviceLotCount = lots.Count(),
                RequiredPercentage = requiredCount
            };

            response.AddMessage(MessageCode.StatusDescription,
                $"Retrieved {response.DeviceLotCount} device lot(s) eligible for bench test completion");

            return Ok(response);
        }

        /// <summary>
        /// Find device lot by device serial number
        /// </summary>
        /// <param name="deviceSerialNumber">Device serial number</param>
        /// <returns>Device lot information</returns>
        [HttpGet("FindLot/{deviceSerialNumber}")]
        [ProducesResponseType(typeof(DeviceLot), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<DeviceLot>> FindLot([FromRoute] string deviceSerialNumber)
        {
            if (string.IsNullOrWhiteSpace(deviceSerialNumber))
            {
                return BadRequest("Device serial number is required");
            }

            var lot = await Orchestrator.FindLot(deviceSerialNumber);

            if (lot == null || string.IsNullOrEmpty(lot.Name))
            {
                return NotFound($"No lot found for device serial number: {deviceSerialNumber}");
            }

            return Ok(lot);
        }

        /// <summary>
        /// Get device lot by lot name
        /// </summary>
        /// <param name="lotName">Device lot name</param>
        /// <returns>Device lot information</returns>
        [HttpGet("GetDeviceLot/{lotName}")]
        [ProducesResponseType(typeof(DeviceLot), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<DeviceLot>> GetDeviceLot([FromRoute] string lotName)
        {
            if (string.IsNullOrWhiteSpace(lotName))
            {
                return BadRequest("Lot name is required");
            }

            var lot = await Orchestrator.GetDeviceLot(lotName);

            if (lot == null || string.IsNullOrEmpty(lot.Name))
            {
                return NotFound($"Device lot '{lotName}' not found");
            }

            return Ok(lot);
        }

        /// <summary>
        /// Get all devices in a specific lot
        /// </summary>
        /// <param name="lotSeqId">Lot sequence ID</param>
        /// <param name="lotType">Lot type (Manufacturer, Returned, RMA, Inventory)</param>
        /// <returns>Collection of devices in the lot</returns>
        [HttpGet("GetDevicesByLot")]
        [ProducesResponseType(typeof(GetDevicesByLotResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<GetDevicesByLotResponse>> GetDevicesByLot(
            [FromQuery] int lotSeqId, 
            [FromQuery] DeviceLotType lotType)
        {
            if (lotSeqId <= 0)
            {
                return BadRequest("Valid lot sequence ID is required");
            }

            var response = await Orchestrator.GetDevicesByLot(lotSeqId, lotType);

            response.AddMessage(MessageCode.StatusDescription,
                $"Retrieved {response.DeviceCount} device(s) from lot {lotSeqId}");

            return Ok(response);
        }

        /// <summary>
        /// Check in a device lot or device by query (lot name or serial number)
        /// </summary>
        /// <param name="request">Check-in request containing lot name or device serial number</param>
        /// <returns>Check-in result</returns>
        [HttpPost("Checkin")]
        [ProducesResponseType(typeof(Resource), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Resource>> Checkin([FromBody] CheckinRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Query))
            {
                return BadRequest("Query (lot name or device serial number) is required");
            }

            var result = await Orchestrator.Checkin(request.Query);

            if (result.HasErrorCode("InvalidRequest"))
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
    }

    /// <summary>
    /// Request model for checking in a lot or device
    /// </summary>
    public class CheckinRequest
    {
        /// <summary>
        /// Lot name or device serial number
        /// </summary>
        public string Query { get; set; }
    }
}
