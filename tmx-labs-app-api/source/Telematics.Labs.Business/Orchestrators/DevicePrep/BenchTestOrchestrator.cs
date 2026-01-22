using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.BenchTest;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;
using WcfBoardService = BenchTestBoardService;
using WcfTestService = BenchTestServices;

namespace Progressive.Telematics.Labs.Business.Orchestrators.DevicePrep
{
    [SingletonService]
    public interface IBenchTestOrchestrator
    {
        // Board Management
        Task<BenchTestBoardResponse> AddBenchTestBoard(AddBenchTestBoardRequest request);
        Task<Resource> UpdateBenchTestBoard(UpdateBenchTestBoardRequest request);
        Task<Resource> DeleteBenchTestBoard(DeleteBenchTestBoardRequest request);
        Task<BenchTestBoardResponse> GetBenchTestBoard(GetBenchTestBoardRequest request);
        Task<BenchTestBoardCollectionResponse> GetAllBoardsByLocation(GetAllBoardsByLocationRequest request);

        // Test Management
        Task<Resource> AddBenchTest(Progressive.Telematics.Labs.Business.Resources.Resources.BenchTest.AddBenchTestRequest request);
        Task<Resource> StopBenchTest(StopBenchTestRequest request);
        Task<Resource> ClearBenchTest(ClearBenchTestRequest request);
        Task<StopIfCompleteBenchTestResponse> StopIfCompleteBenchTest(StopIfCompleteBenchTestRequest request);
    }

    public class BenchTestOrchestrator : IBenchTestOrchestrator
    {
        private readonly IBenchTestBoardService _benchTestBoardService;
        private readonly IBenchTestService _benchTestService;
        private readonly ILogger<BenchTestOrchestrator> _logger;

        public BenchTestOrchestrator(
            IBenchTestBoardService benchTestBoardService,
            IBenchTestService benchTestService,
            ILogger<BenchTestOrchestrator> logger)
        {
            _benchTestBoardService = benchTestBoardService;
            _benchTestService = benchTestService;
            _logger = logger;
        }

        #region Board Management

        public async Task<BenchTestBoardResponse> AddBenchTestBoard(AddBenchTestBoardRequest request)
        {
            var response = new BenchTestBoardResponse();


            if (request?.Board == null)
            {
                response.AddMessage(MessageCode.ErrorCode, "InvalidRequest");
                response.AddMessage(MessageCode.ErrorDetails, "Board information is required");
                return response;
            }

            var wcfBoard = MapToWcfBoard(request.Board);
            var result = await _benchTestBoardService.AddBenchTestBoard(wcfBoard);

            if (result.ResponseStatus == WcfBoardService.ResponseStatus.Failure)
            {
                foreach (var error in result.ResponseErrors ?? Array.Empty<WcfBoardService.ResponseError>())
                {
                    response.AddMessage(MessageCode.Error, error.Message);
                }
                return response;
            }
            response.Board = request.Board;
            response.AddMessage(MessageCode.StatusDescription, "Bench test board added successfully");

            return response;
        }

        public async Task<Resource> UpdateBenchTestBoard(UpdateBenchTestBoardRequest request)
        {
            var response = new Resource();

            if (request?.Board == null)
            {
                response.AddMessage(MessageCode.ErrorCode, "InvalidRequest");
                response.AddMessage(MessageCode.ErrorDetails, "Board information is required");
                return response;
            }

            var wcfBoard = MapToWcfBoard(request.Board);
            var result = await _benchTestBoardService.UpdateBenchTestBoard(wcfBoard);

            if (result.ResponseStatus == WcfBoardService.ResponseStatus.Failure)
            {
                foreach (var error in result.ResponseErrors ?? Array.Empty<WcfBoardService.ResponseError>())
                {
                    response.AddMessage(MessageCode.Error, error.Message);
                }
                return response;
            }

            response.AddMessage(MessageCode.StatusDescription, "Bench test board updated successfully");

            return response;
        }

        public async Task<Resource> DeleteBenchTestBoard(DeleteBenchTestBoardRequest request)
        {
            var response = new Resource();

            if (request.BoardId <= 0)
            {
                response.AddMessage(MessageCode.ErrorCode, "InvalidRequest");
                response.AddMessage(MessageCode.ErrorDetails, "Valid BoardId is required");
                return response;
            }

            var result = await _benchTestBoardService.DeleteBenchTestBoard(request.BoardId);

            if (result.ResponseStatus == WcfBoardService.ResponseStatus.Failure)
            {
                foreach (var error in result.ResponseErrors ?? Array.Empty<WcfBoardService.ResponseError>())
                {
                    response.AddMessage(MessageCode.Error, error.Message);
                }
                return response;
            }

            response.AddMessage(MessageCode.StatusDescription, "Bench test board deleted successfully");

            return response;
        }

        public async Task<BenchTestBoardResponse> GetBenchTestBoard(GetBenchTestBoardRequest request)
        {
            var response = new BenchTestBoardResponse();

            if (request.BoardId <= 0)
            {
                response.AddMessage(MessageCode.ErrorCode, "InvalidRequest");
                response.AddMessage(MessageCode.ErrorDetails, "Valid BoardId is required");
                return response;
            }

            var result = await _benchTestBoardService.GetBenchTestBoard(request.BoardId);

            if (result.ResponseStatus == WcfBoardService.ResponseStatus.Failure)
            {
                foreach (var error in result.ResponseErrors ?? Array.Empty<WcfBoardService.ResponseError>())
                {
                    response.AddMessage(MessageCode.Error, error.Message);
                }
                return response;
            }

            if (result.BenchTestBoard == null)
            {
                response.AddMessage(MessageCode.ErrorCode, "BoardNotFound");
                response.AddMessage(MessageCode.ErrorDetails, $"Bench test board with ID {request.BoardId} not found");
                return response;
            }

            response.Board = MapFromWcfBoard(result.BenchTestBoard);
            response.AddMessage(MessageCode.StatusDescription, "Bench test board retrieved successfully");

            return response;
        }

        public async Task<BenchTestBoardCollectionResponse> GetAllBoardsByLocation(GetAllBoardsByLocationRequest request)
        {
            var response = new BenchTestBoardCollectionResponse();

            if (request.LocationCode <= 0)
            {
                response.AddMessage(MessageCode.ErrorCode, "InvalidRequest");
                response.AddMessage(MessageCode.ErrorDetails, "Valid LocationCode is required");
                return response;
            }

            var result = await _benchTestBoardService.GetAllBoardsByLocation(request.LocationCode);

            if (result.ResponseStatus == WcfBoardService.ResponseStatus.Failure)
            {
                foreach (var error in result.ResponseErrors ?? Array.Empty<WcfBoardService.ResponseError>())
                {
                    response.AddMessage(MessageCode.Error, error.Message);
                }
                return response;
            }

            response.Boards = result.BenchTestBoards?.Select(MapFromWcfBoard).ToArray() ?? Array.Empty<BenchTestBoard>();
            response.ResultCount = result.resultCount;
            response.AddMessage(MessageCode.StatusDescription, $"Retrieved {response.ResultCount} bench test boards");
            return response;
        }

        #endregion

        #region Test Management

        public async Task<Resource> AddBenchTest(Progressive.Telematics.Labs.Business.Resources.Resources.BenchTest.AddBenchTestRequest request)
        {
            var response = new Resource();

            if (request?.BenchTest == null)
            {
                response.AddMessage(MessageCode.ErrorCode, "InvalidRequest");
                response.AddMessage(MessageCode.ErrorDetails, "Bench test information is required");
                return response;
            }

            var wcfBenchTest = MapToWcfBenchTest(request.BenchTest);
            var result = await _benchTestService.AddBenchTest(wcfBenchTest);

            if (result.ResponseStatus == WcfTestService.ResponseStatus.Failure)
            {
                foreach (var error in result.ResponseErrors ?? Array.Empty<WcfTestService.ResponseError>())
                {
                    response.AddMessage(MessageCode.Error, error.Message);
                }
                return response;
            }

            response.AddMessage(MessageCode.StatusDescription, "Bench test added successfully");
            return response;
        }

        public async Task<Resource> StopBenchTest(StopBenchTestRequest request)
        {
            var response = new Resource();

            if (request.BoardId <= 0)
            {
                response.AddMessage(MessageCode.ErrorCode, "InvalidRequest");
                response.AddMessage(MessageCode.ErrorDetails, "Valid BoardId is required");
                return response;
            }

            var result = await _benchTestService.StopBenchTest(request.BoardId);

            if (result.ResponseStatus == WcfTestService.ResponseStatus.Failure)
            {
                foreach (var error in result.ResponseErrors ?? Array.Empty<WcfTestService.ResponseError>())
                {
                    response.AddMessage(MessageCode.Error, error.Message);
                }
                return response;
            }

            response.AddMessage(MessageCode.StatusDescription, "Bench test stopped successfully");
            return response;
        }

        public async Task<Resource> ClearBenchTest(ClearBenchTestRequest request)
        {
            var response = new Resource();

            if (request.BoardId <= 0)
            {
                response.AddMessage(MessageCode.ErrorCode, "InvalidRequest");
                response.AddMessage(MessageCode.ErrorDetails, "Valid BoardId is required");
                return response;
            }

            var result = await _benchTestService.ClearBenchTest(request.BoardId);

            if (result.ResponseStatus == WcfTestService.ResponseStatus.Failure)
            {
                foreach (var error in result.ResponseErrors ?? Array.Empty<WcfTestService.ResponseError>())
                {
                    response.AddMessage(MessageCode.Error, error.Message);
                }
                return response;
            }

            response.AddMessage(MessageCode.StatusDescription, "Bench test cleared successfully");
            return response;
        }

        public async Task<StopIfCompleteBenchTestResponse> StopIfCompleteBenchTest(StopIfCompleteBenchTestRequest request)
        {
            var response = new StopIfCompleteBenchTestResponse();

            if (request.BoardId <= 0)
            {
                response.AddMessage(MessageCode.ErrorCode, "InvalidRequest");
                response.AddMessage(MessageCode.ErrorDetails, "Valid BoardId is required");
                return response;
            }

            var result = await _benchTestService.StopIfCompleteBenchTest(request.BoardId);

            if (result.ResponseStatus == WcfTestService.ResponseStatus.Failure)
            {
                foreach (var error in result.ResponseErrors ?? Array.Empty<WcfTestService.ResponseError>())
                {
                    response.AddMessage(MessageCode.Error, error.Message);
                }
                return response;
            }

            response.IsStopped = result.IsStopped;
            response.AddMessage(MessageCode.StatusDescription,
                result.IsStopped ? "Bench test stopped (complete)" : "Bench test not stopped (not complete)");
            return response;
        }

        #endregion

        #region Mapping Methods

        private static WcfTestService.BenchTest MapToWcfBenchTest(Progressive.Telematics.Labs.Business.Resources.Resources.BenchTest.BenchTest benchTest)
        {
            if (benchTest == null) return null;

            return new WcfTestService.BenchTest
            {
                BoardID = benchTest.BoardID,
                UserID = benchTest.UserID,
                ForceUpdate = benchTest.ForceUpdate,
                BenchTestItemList = benchTest.BenchTestItemList?.Select(item => new WcfTestService.BenchTestItemList
                {
                    DeviceSerialNumber = item.DeviceSerialNumber,
                    FirmwareSetCode = item.FirmwareSetCode,
                    LocationOnBoard = item.LocationOnBoard
                }).ToArray()
            };
        }

        private static WcfBoardService.BenchTestBoard MapToWcfBoard(BenchTestBoard board)
        {
            if (board == null) return null;

            return new WcfBoardService.BenchTestBoard
            {
                BoardID = board.BoardID,
                Name = board.Name,
                LocationCode = board.LocationCode,
                StatusCode = board.StatusCode,
                UserID = board.UserID,
                StartDateTime = board.StartDateTime,
                EndDateTime = board.EndDateTime
            };
        }

        private static BenchTestBoard MapFromWcfBoard(WcfBoardService.BenchTestBoard wcfBoard)
        {
            if (wcfBoard == null) return null;

            return new BenchTestBoard
            {
                BoardID = wcfBoard.BoardID,
                Name = wcfBoard.Name,
                LocationCode = wcfBoard.LocationCode,
                StatusCode = wcfBoard.StatusCode,
                UserID = wcfBoard.UserID,
                StartDateTime = wcfBoard.StartDateTime,
                EndDateTime = wcfBoard.EndDateTime
            };
        }

        #endregion
    }
}
