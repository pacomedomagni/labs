using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Resources;
using Progressive.Telematics.Labs.Business.Resources.DevicePrep;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.BenchTest;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Services.Database.Models;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;
using WcfBoardService = BenchTestBoardService;
using WcfTestService = BenchTestServices;
using WcfXirgoService;

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
        Task<VerifyBenchTestResponse> VerifyBenchTest(VerifyBenchTestRequest request);
    }

    public class BenchTestOrchestrator : IBenchTestOrchestrator
    {
        private readonly IBenchTestBoardService _benchTestBoardService;
        private readonly IBenchTestBoardDAL _benchTestBoardDAL;
        private readonly IBenchTestService _benchTestService;
        private readonly IXirgoDeviceService _xirgoDeviceService;
        private readonly IDeviceActivityService _deviceActivityService;
        private readonly ILogger<BenchTestOrchestrator> _logger;

        public BenchTestOrchestrator(
            IBenchTestBoardService benchTestBoardService,
            IBenchTestBoardDAL benchTestBoardDAL,
            IBenchTestService benchTestService,
            IXirgoDeviceService xirgoDeviceService,
            IDeviceActivityService deviceActivityService,
            ILogger<BenchTestOrchestrator> logger)
        {
            _benchTestBoardService = benchTestBoardService;
            _benchTestBoardDAL = benchTestBoardDAL;
            _benchTestService = benchTestService;
            _xirgoDeviceService = xirgoDeviceService;
            _deviceActivityService = deviceActivityService;
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

            var boards = await _benchTestBoardDAL.GetAllBoardsByLocation(request.LocationCode);
            var boardList = boards?.ToList() ?? new List<BenchTestBoardDataModel>();

            response.Boards = boardList.Select(MapFromDataModel).ToArray();
            response.ResultCount = boardList.Count;
            response.AddMessage(MessageCode.StatusDescription, $"Retrieved {response.ResultCount} bench test boards");
            return response;
        }

        #endregion


        #region Test Management

        public async Task<Resource> AddBenchTest(AddBenchTestRequest request)
        {
            var response = new Resource();

            if (request?.BenchTest == null)
            {
                response.AddMessage(MessageCode.ErrorCode, "InvalidRequest");
                response.AddMessage(MessageCode.ErrorDetails, "Bench test information is required");
                return response;
            }

            // Set board to running state
            var updateBoardResponse = await _benchTestBoardService.UpdateBenchTestBoard(new WcfBoardService.BenchTestBoard() {
                BoardID = request.BenchTest.BoardID,
                StatusCode = (int)BenchTestBoardStatus.Testing
            });

            foreach(var device in request.BenchTest.Devices ?? Array.Empty<BenchTestBoardDevice>())
            {
                if (device.DeviceSerialNumber != null)
                {
                    var updateDeviceResponse = await _xirgoDeviceService.UpdateAsync(new UpdateDeviceRequest()
                    {
                        Device = new XirgoDevice
                        {
                            DeviceSerialNumber = device.DeviceSerialNumber,
                            StatusCode = (int)DeviceStatus.ReadyForBenchTest,
                            BenchTestStatusCode = (int)DeviceBenchTestStatus.ReadyForBenchTest
                        }
                    });
                }
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

        public async Task<VerifyBenchTestResponse> VerifyBenchTest(VerifyBenchTestRequest request)
        {
            var response = new VerifyBenchTestResponse
            {
                Results = Array.Empty<DeviceUpdateResult>()
            };

            // Get all devices in the lot
            var wcfResponse = await _xirgoDeviceService.GetDevicesByLot(request.LotSeqId, request.LotType);

            if (wcfResponse.Devices == null || wcfResponse.Devices.Length == 0)
            {
                response.Messages = new Dictionary<MessageCode, object>
                {
                    { MessageCode.ErrorCode, "NoDevicesFound" },
                    { MessageCode.ErrorDetails, $"No devices found in lot {request.LotSeqId}" }
                };
                return response;
            }

            response.TotalDevices = wcfResponse.Devices.Length;
            var results = new List<DeviceUpdateResult>();

            // Loop through each device and update
            foreach (var device in wcfResponse.Devices)
            {
                var result = new DeviceUpdateResult
                {
                    DeviceSerialNumber = device.DeviceSerialNumber,
                    Success = false
                };

                if (device.ProgramCode == null)
                {
                    var updateRequest = new UpdateDeviceRequest();

                    updateRequest.Device = new XirgoDevice
                    {
                        DeviceSeqID = device.DeviceSeqID,
                        IsCommunicationAllowed = true,
                        StatusCode = TMXDeviceStatus.Available,
                        ReportedVIN = " ",
                        WTFStateInfo = " ",
                        ReportedProtocolCode = 0,
                        LastRemoteResetDateTime = new DateTime(1970, 1, 1)
                    };

                    var updateResponse = await _xirgoDeviceService.UpdateAsync(updateRequest);

                    if (updateResponse.ResponseStatus == WcfXirgoService.ResponseStatus.Success)
                    {
                        result.Success = true;
                        response.SuccessfulUpdates++;

                        // Log device activity
                        await _deviceActivityService.AddDeviceActivity(
                            device.DeviceSeqID.Value,
                            $"Bench test verification: Status={device.StatusCode.Value}, Location={device.LocationCode.Value}"
                        );
                    }
                    else
                    {
                        result.ErrorMessage = string.Join("; ",
                            updateResponse.ResponseErrors?.Select(e => e.Message) ?? new[] { "Update failed" });
                        response.FailedUpdates++;
                    }
                }
                else
                {
                    result.ErrorMessage = "Missing required device information (DeviceSeqID, StatusCode, or LocationCode)";
                    response.FailedUpdates++;
                }

                results.Add(result);
            }

            response.Results = results.ToArray();
            response.Messages = new Dictionary<MessageCode, object>
            {
                { MessageCode.StatusDescription, $"Verified {response.TotalDevices} devices: {response.SuccessfulUpdates} successful, {response.FailedUpdates} failed" }
            };

            return response;
        }

        #endregion

        #region Mapping Methods

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

        private static BenchTestBoard MapFromDataModel(BenchTestBoardDataModel dataModel)
        {
            if (dataModel == null) return null;

            return new BenchTestBoard
            {
                BoardID = dataModel.BoardID,
                Name = dataModel.Name,
                LocationCode = dataModel.LocationCode,
                StatusCode = dataModel.StatusCode,
                UserID = dataModel.UserID,
                StartDateTime = dataModel.StartDateTime,
                EndDateTime = dataModel.EndDateTime,
                DeviceCount = dataModel.DeviceCount
            };
        }

        #endregion
    }
}
