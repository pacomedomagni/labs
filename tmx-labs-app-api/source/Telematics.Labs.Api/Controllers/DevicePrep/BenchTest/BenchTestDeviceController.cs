using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Labs.Business.Orchestrators.DevicePrep;
using Progressive.Telematics.Labs.Business.Resources.Resources.BenchTest;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Api.Controllers.DevicePrep.BenchTest
{
    [Route("Api/BenchTestDevice")]
    public class BenchTestDeviceController : TelematicsController<IBenchTestDeviceOrchestrator>
    {
        /// <summary>
        /// Validate DeviceID can be bench tested
        /// </summary>
        [HttpPost("ValidateDevice")]
        [ProducesResponseType(typeof(ValidateDeviceForBenchTestResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ValidateDeviceForBenchTestResponse>> ValidateDeviceForBenchTest([FromBody][Required] ValidateDeviceForBenchTestRequest request)
        {
            var result = await Orchestrator.ValidateDeviceForBenchTest(request);

            if (result.HasErrorCode("DeviceNotFound"))
            {
                return NotFound(result);
            }
            else if (result.HasErrorCode("InvalidRequest"))
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Get all devices on a bench test board
        /// </summary>
        [HttpGet("GetAllDevicesByBoard")]
        [ProducesResponseType(typeof(BenchTestBoardDeviceCollectionResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<BenchTestBoardDeviceCollectionResponse>> GetAllDevicesByBoard([FromQuery][Required] int boardId)
        {
            var result = await Orchestrator.GetAllDevicesByBoard(new GetAllDevicesByBoardRequest { BoardId = boardId });

            if (result.HasErrorCode("InvalidRequest"))
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
                /// Get all device statuses on a bench test board
                /// </summary>
                [HttpGet("GetAllDeviceStatusesByBoard")]
                [ProducesResponseType(typeof(BenchTestBoardStatusResponse), StatusCodes.Status200OK)]
                [ProducesResponseType(StatusCodes.Status400BadRequest)]
                public async Task<ActionResult<BenchTestBoardStatusResponse>> GetAllDeviceStatusesByBoard([FromQuery][Required] int boardId)
                {
                    var result = await Orchestrator.GetAllDeviceStatusesByBoard(new GetAllDevicesByBoardRequest { BoardId = boardId });

                    if (result.HasErrorCode("InvalidRequest"))
                    {
                        return BadRequest(result);
                    }

                    return Ok(result);
                }

                /// <summary>
                /// Add a device to a bench test board
                /// </summary>
                [HttpPost("SaveDeviceToBoard")]
                [ProducesResponseType(typeof(AddDeviceToBoardResponse), StatusCodes.Status200OK)]
                [ProducesResponseType(StatusCodes.Status400BadRequest)]
                public async Task<ActionResult<AddDeviceToBoardResponse>> SaveDeviceToBoard([FromBody][Required] AddDeviceToBoardRequest request)
                {
                    var result = await Orchestrator.SaveDeviceToBoard(request.BoardId, request.Device);

                    if (result.HasErrorCode("InvalidRequest"))
                    {
                        return BadRequest(result);  
                    }

                    return Ok(result);
                }

                /// <summary>
                /// Delete a device from a bench test board
                /// </summary>
                [HttpDelete("DeleteDeviceFromBoard")]
                [ProducesResponseType(typeof(DeleteDeviceFromBoardResponse), StatusCodes.Status200OK)]
                [ProducesResponseType(StatusCodes.Status400BadRequest)]
                public async Task<ActionResult<DeleteDeviceFromBoardResponse>> DeleteDeviceFromBoard([FromQuery][Required] int boardId, [FromQuery][Required] int locationOnBoard)
                {
                    var result = await Orchestrator.DeleteDeviceFromBoard(boardId, locationOnBoard);

                    if (result.HasErrorCode("InvalidRequest"))
                    {
                        return BadRequest(result);
                    }

                    return Ok(result);
                }
            }
        }
