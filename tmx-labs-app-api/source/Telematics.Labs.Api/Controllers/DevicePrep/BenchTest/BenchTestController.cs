using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Progressive.Telematics.Labs.Business.Orchestrators.DevicePrep;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Business.Resources.DevicePrep;
using Progressive.Telematics.Labs.Business.Resources.Resources.BenchTest;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Api.Controllers.DevicePrep.BenchTest
{
    [Route("Api/BenchTest")]
    public class BenchTestController : TelematicsController<IBenchTestOrchestrator>
    {
        #region Board Management

        /// <summary>
        /// Add a new bench test board
        /// </summary>
        [HttpPost("AddBoard")]
        [ProducesResponseType(typeof(BenchTestBoardResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<BenchTestBoardResponse> AddBenchTestBoard([FromBody][Required] AddBenchTestBoardRequest request)
        {
            return await Orchestrator.AddBenchTestBoard(request);
        }

        /// <summary>
        /// Update an existing bench test board
        /// </summary>
        [HttpPut("UpdateBoard")]
        [ProducesResponseType(typeof(Resource), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<Resource> UpdateBenchTestBoard([FromBody][Required] UpdateBenchTestBoardRequest request)
        {
            return await Orchestrator.UpdateBenchTestBoard(request);
        }

        /// <summary>
        /// Delete a bench test board by ID
        /// </summary>
        [HttpDelete("DeleteBoard/{boardId}")]
        [ProducesResponseType(typeof(Resource), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<Resource> DeleteBenchTestBoard([FromRoute][Required] int boardId)
        {
            return await Orchestrator.DeleteBenchTestBoard(new DeleteBenchTestBoardRequest { BoardId = boardId });
        }

        /// <summary>
        /// Get a bench test board by ID
        /// </summary>
        [HttpGet("GetBoard/{boardId}")]
        [ProducesResponseType(typeof(BenchTestBoardResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<BenchTestBoardResponse> GetBenchTestBoard([FromRoute][Required] int boardId)
        {
            return await Orchestrator.GetBenchTestBoard(new GetBenchTestBoardRequest { BoardId = boardId });
        }

        /// <summary>
        /// Get all bench test boards by location code
        /// </summary>
        [HttpGet("GetBoardsByLocation/{locationCode}")]
        [ProducesResponseType(typeof(BenchTestBoardCollectionResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<BenchTestBoardCollectionResponse> GetAllBoardsByLocation([FromRoute][Required] int locationCode)
        {
            return await Orchestrator.GetAllBoardsByLocation(new GetAllBoardsByLocationRequest { LocationCode = locationCode });
        }

        #endregion

        #region Test Management

        /// <summary>
        /// Add devices to a bench test board for testing
        /// </summary>
        [HttpPost("AddTest")]
        [ProducesResponseType(typeof(Resource), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<Resource> AddBenchTest([FromBody][Required] AddBenchTestRequest request)
        {
            return await Orchestrator.AddBenchTest(request);
        }

        /// <summary>
        /// Stop a bench test on a board
        /// </summary>
        [HttpPost("StopTest/{boardId}")]
        [ProducesResponseType(typeof(Resource), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<Resource> StopBenchTest([FromRoute][Required] int boardId)
        {
            return await Orchestrator.StopBenchTest(new StopBenchTestRequest { BoardId = boardId });
        }

        /// <summary>
        /// Clear a bench test from a board
        /// </summary>
        [HttpPost("ClearTest/{boardId}")]
        [ProducesResponseType(typeof(Resource), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<Resource> ClearBenchTest([FromRoute][Required] int boardId)
        {
            return await Orchestrator.ClearBenchTest(new ClearBenchTestRequest { BoardId = boardId });
        }

        /// <summary>
        /// Stop a bench test if it's complete
        /// </summary>
        [HttpPost("StopIfCompleteTest/{boardId}")]
        [ProducesResponseType(typeof(StopIfCompleteBenchTestResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<StopIfCompleteBenchTestResponse> StopIfCompleteBenchTest([FromRoute][Required] int boardId)
        {
            return await Orchestrator.StopIfCompleteBenchTest(new StopIfCompleteBenchTestRequest { BoardId = boardId });
        }

        /// <summary>
        /// Verify bench test for all devices in a lot by updating each device
        /// </summary>
        [HttpPost("VerifyBenchTest")]
        [ProducesResponseType(typeof(VerifyBenchTestResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<VerifyBenchTestResponse>> VerifyBenchTest([FromBody][Required] VerifyBenchTestRequest request)
        {
            if (request == null || request.LotSeqId <= 0)
            {
                return BadRequest("Valid lot sequence ID is required");
            }

            var response = await Orchestrator.VerifyBenchTest(request);

            if (response.HasErrorCode("NoDevicesFound"))
            {
                return NotFound(response);
            }

            return Ok(response);
        }

        #endregion
    }
}
